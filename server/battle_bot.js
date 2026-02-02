const { io } = require('socket.io-client');

// Connect to the server
const socket = io('http://localhost:5002');

const BOT_NAME = 'BattleBot 3000';
let roomId = null;

socket.on('connect', () => {
    console.log(`[Bot] Connected with ID: ${socket.id}`);

    // Start searching immediately
    console.log('[Bot] Searching for match...');
    socket.emit('find_match', {
        userId: 'bot_user_' + Math.floor(Math.random() * 1000),
        name: BOT_NAME,
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=' + Math.random()
    });
});

socket.on('match_found', (data) => {
    console.log(`[Bot] Match Found! Room: ${data.roomId}`);
    roomId = data.roomId;
});

socket.on('game_start', (data) => {
    console.log('[Bot] Game Started!');
    const questions = data.questions;

    // Simulate playing
    let qIndex = 0;

    const playNext = () => {
        if (qIndex >= questions.length) {
            console.log('[Bot] Finished Game.');
            return;
        }

        const delay = 3000 + Math.random() * 4000; // 3-7 seconds to answer
        console.log(`[Bot] Thinking for question ${qIndex + 1}...`);

        setTimeout(() => {
            // Randomly choose an option or be smart?
            // Let's be random but slightly lucky
            // The answers are client side ID's so we need to pick one
            const q = questions[qIndex];
            const options = q.options;
            const randomOption = options[Math.floor(Math.random() * options.length)];

            // Calculate fake points
            const points = 10 + Math.floor(Math.random() * 5); // 10-15 pts

            console.log(`[Bot] Answering Question ${qIndex + 1} with ${points} pts`);
            socket.emit('submit_answer', {
                roomId: roomId,
                points: points
            });

            qIndex++;
            playNext();
        }, delay);
    };

    playNext();
});

socket.on('opponent_disconnected', () => {
    console.log('[Bot] Opponent left. I win?');
    process.exit(0);
});

socket.on('disconnect', () => {
    console.log('[Bot] Disconnected');
});
