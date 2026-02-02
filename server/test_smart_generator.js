// Native fetch is available in Node 18+

const BASE_URL = 'http://127.0.0.1:5002/api';

const loginUser = async () => {
    try {
        console.log("Attempting Login...");
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'student@example.com',
                password: 'student'
            })
        });

        if (!response.ok) {
            console.warn("Login Failed, trying to sign up...");
            await fetch(`${BASE_URL}/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: 'Smart Test Student',
                    email: 'student@example.com',
                    password: 'student',
                    targetExam: 'NTPC'
                })
            });

            // Login again
            const loginRes = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'student@example.com',
                    password: 'student'
                })
            });
            const loginData = await loginRes.json();
            return loginData.token;
        }

        const data = await response.json();
        return data.token;
    } catch (e) {
        console.error("Auth Error:", e.message);
        return null;
    }
};

const testSmartGenerator = async () => {
    const token = await loginUser();
    if (!token) {
        console.log("❌ Skipping test due to login failure.");
        return;
    }

    try {
        console.log("\nTesting POST /api/tests/generate...");
        const response = await fetch(`${BASE_URL}/tests/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2));

        if (response.ok && data._id) {
            console.log(`✅ Success! Created Smart Test: ${data.title} (${data._id})`);
            console.log(`Questions Count: ${data.questionsCount}`);
        } else {
            console.log("❌ Failed to generate test.");
        }

    } catch (e) {
        console.error("API Request Failed:", e.message);
    }
};

testSmartGenerator();
