const { v4: uuidv4 } = require('uuid');
const Question = require('../models/Question');

// State (In-memory for prototype, Redis for production)
let matchmakingQueue = []; // Array of { socketId, userId, name }
const activeGames = new Map(); // roomId -> { players: [], questions: [], currentRound: 0 }

const findMatch = async (io, socket, userData) => {
    // 1. Remove if already in queue (prevent duplicates)
    matchmakingQueue = matchmakingQueue.filter(u => u.socketId !== socket.id);

    console.log(`[Battle] User ${userData.name} (${socket.id}) looking for match... Queue Size: ${matchmakingQueue.length}`);

    if (matchmakingQueue.length > 0) {
        // 2. Match Found!
        const opponent = matchmakingQueue.shift();
        const roomId = uuidv4();

        // Join both to room
        socket.join(roomId);
        const opponentSocket = io.sockets.sockets.get(opponent.socketId);
        if (opponentSocket) {
            opponentSocket.join(roomId);
        } else {
            // Opponent disconnected while waiting? Retry this user.
            return findMatch(io, socket, userData);
        }

        // 3. Fetch Questions (Random 5) — keep FULL data server-side
        const questions = await Question.aggregate([{ $sample: { size: 5 } }]);

        // 4. Sanitize questions for clients — NEVER send correctOption
        const sanitizedQuestions = questions.map(q => ({
            _id: q._id,
            text: q.text,
            textHindi: q.textHindi,
            options: q.options.map(o => ({ id: o.id, text: o.text, textHindi: o.textHindi })),
            // NO correctOption, NO explanation
        }));

        // 5. Initialize Game State (server keeps full questions with answers)
        const gameState = {
            roomId,
            players: [
                { id: socket.id, odii: userData.userId, name: userData.name, score: 0, avatar: userData.avatar, answeredRounds: new Set() },
                { id: opponent.socketId, odii: opponent.userId, name: opponent.name, score: 0, avatar: opponent.avatar, answeredRounds: new Set() }
            ],
            questions, // FULL questions with correctOption — server-only
            currentRound: 0,
            startTime: Date.now()
        };
        activeGames.set(roomId, gameState);

        // 6. Notify Players
        io.to(roomId).emit('match_found', {
            roomId,
            opponent: "Opponent"
        });

        // 7. Start Game — send SANITIZED questions only
        setTimeout(() => {
            io.to(roomId).emit('game_start', {
                questions: sanitizedQuestions,
                players: gameState.players.map(p => ({
                    id: p.id, odii: p.odii, name: p.name, score: p.score, avatar: p.avatar
                }))
            });
        }, 1500);

        console.log(`[Battle] Match Started: ${roomId} | ${userData.name} vs ${opponent.name}`);

    } else {
        // 3. No Match, Add to Queue
        matchmakingQueue.push({
            socketId: socket.id,
            userId: userData.userId,
            name: userData.name,
            avatar: userData.avatar
        });
        socket.emit('waiting_for_match');
    }
};

/**
 * Server-side answer validation.
 * Client sends: { roomId, questionId, selectedOption, timeLeft }
 * Server validates correctness and calculates score.
 */
const submitAnswer = (io, socket, { roomId, questionId, selectedOption, timeLeft }) => {
    const game = activeGames.get(roomId);
    if (!game) return;

    // Find the player
    const player = game.players.find(p => p.id === socket.id);
    if (!player) return;

    // Find the question (server has full data with correctOption)
    const question = game.questions.find(q => q._id.toString() === questionId);
    if (!question) return;

    // Prevent double-answering the same question
    const roundKey = questionId;
    if (player.answeredRounds.has(roundKey)) return;
    player.answeredRounds.add(roundKey);

    // Server-side scoring — validate answer correctness HERE
    let points = 0;
    const isCorrect = selectedOption === question.correctOption;
    if (isCorrect) {
        const clampedTimeLeft = Math.max(0, Math.min(15, timeLeft || 0)); // Sanitize timeLeft (0-15)
        points = 10 + Math.ceil(clampedTimeLeft / 2); // Speed bonus
    }

    player.score += points;

    // Broadcast Updated Scores (without exposing answers)
    io.to(roomId).emit('score_update', {
        players: game.players.map(p => ({
            id: p.id, odii: p.odii, name: p.name, score: p.score, avatar: p.avatar
        }))
    });

    // Send result BACK to the answering player only (so they know if correct)
    socket.emit('answer_result', {
        questionId,
        isCorrect,
        correctOption: question.correctOption, // Reveal AFTER answering
        pointsEarned: points
    });
};

const handleDisconnect = (socket) => {
    // Remove from queue
    matchmakingQueue = matchmakingQueue.filter(u => u.socketId !== socket.id);

    // Handle Active Games
    for (const [roomId, game] of activeGames.entries()) {
        const isPlayer = game.players.find(p => p.id === socket.id);
        if (isPlayer) {
            socket.to(roomId).emit('opponent_disconnected');
            activeGames.delete(roomId);
            console.log(`[Battle] Game ${roomId} ended due to disconnect.`);
        }
    }
};

module.exports = {
    findMatch,
    submitAnswer,
    handleDisconnect
};
