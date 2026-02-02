const { v4: uuidv4 } = require('uuid');
const Question = require('../models/Question'); // Assuming this exists

// State (In-memory for prototype, Redis for production)
let matchmakingQueue = []; // Array of { socketId, userId, name }
const activeGames = new Map(); // roomId -> { players: [], scores: {}, questions: [] }

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

        // 3. Fetch Questions (Random 5)
        // For efficiency, just getting random 5 questions from DB
        const questions = await Question.aggregate([{ $sample: { size: 5 } }]);

        // 4. Initialize Game State
        const gameState = {
            roomId,
            players: [
                { id: socket.id, userId: userData.userId, name: userData.name, score: 0, avatar: userData.avatar },
                { id: opponent.socketId, userId: opponent.userId, name: opponent.name, score: 0, avatar: opponent.avatar }
            ],
            questions,
            currentQuestionIndex: 0,
            startTime: Date.now()
        };
        activeGames.set(roomId, gameState);

        // 5. Notify Players
        io.to(roomId).emit('match_found', {
            roomId,
            opponent: (socket.id === roomId) ? null : "Opponent" // Client will parse exact opponent details
        });

        // 6. Start Game (Send first question after brief delay)
        setTimeout(() => {
            io.to(roomId).emit('game_start', {
                questions: questions,
                players: gameState.players
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

const submitAnswer = (io, socket, { roomId, points }) => {
    const game = activeGames.get(roomId);
    if (!game) return;

    // Update Score
    const player = game.players.find(p => p.id === socket.id);
    if (player) {
        player.score += points; // Points calc handled by client (e.g. time based) or verify here
    }

    // Broadcast Update
    io.to(roomId).emit('score_update', {
        players: game.players
    });

    // Check for game over condition if needed (e.g. all answered)
    // For now, client handles "End of Quiz" submission
};

const handleDisconnect = (socket) => {
    // Remove from queue
    matchmakingQueue = matchmakingQueue.filter(u => u.socketId !== socket.id);

    // Handle Active Games?
    // If in game, notify opponent of win by default?
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
