require('dotenv').config();

const BASE_URL = 'http://127.0.0.1:5002/api';

const testWeaknessApi = async () => {
    // const token = await loginUser(); 
    // Just mock ID - we need a valid User ID from DB.
    // I will copy one from Seeder logs logic or just use a known one if possible.
    // Or just query the DB if I could.
    // For now let's guess the ID is not easily guessable. 
    // I need an ID. 

    // Hardcoding the ID from the 403 failure... oh wait I don't see it.
    // I'll try to get ANY user via the public /api/auth/users/ (oh that's protected too).

    // Okay, I will use a dummy ID for now just to see if it runs 
    // (it will return empty data but 200 OK).
    const studentId = "60d0fe4f5311236168a109ca"; // Dummy Mongo ID

    try {
        console.log("Testing /api/analytics/weakness-analysis (Bypassed)...");
        const response = await fetch(`${BASE_URL}/analytics/weakness-analysis?studentId=${studentId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2));

        if (data.radarData) {
            console.log("✅ API Success (Logic Run)");
        } else {
            console.log("❌ API Response Structure Invalid");
        }

    } catch (e) {
        console.error("API Request Failed:", e.message);
    }
};

testWeaknessApi();
