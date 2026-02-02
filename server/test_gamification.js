// Native fetch is available in Node 18+

const BASE_URL = 'http://127.0.0.1:5002/api';
const EMAIL = 'testuser_gamification@example.com';
const PASSWORD = 'password123';

const run = async () => {
    // 1. Signup
    console.log('Testing Signup...');
    let res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Gamer', email: EMAIL, password: PASSWORD })
    });

    console.log(`Signup Status: ${res.status}`);

    if (res.status === 400) {
        // User might exist, try login
        console.log('User exists, logging in...');
        res = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: EMAIL, password: PASSWORD })
        });
    }

    console.log(`Final Response Status: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log('Raw Response Body:', text);

    let data;
    try {
        data = JSON.parse(text);
    } catch (e) {
        console.error('Failed to parse JSON');
        return;
    }

    console.log('Auth Response Data:', {
        xp: data.xp,
        level: data.level,
        streak: data.streak,
        badges: data.badges
    });

    if (data.xp !== undefined && data.level !== undefined && data.streak !== undefined) {
        console.log('✅ Gamification Fields Present!');
    } else {
        console.error('❌ Missing Gamification Fields!');
    }
};

run();
