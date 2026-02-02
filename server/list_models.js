const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function listModels() {
    try {
        const key = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(key);
        // We can't easily call listModels without more setup, but we can try a few names
        const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
        for (const m of models) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                const result = await model.generateContent("hi");
                console.log(`Model ${m} works!`);
                process.exit(0);
            } catch (e) {
                console.log(`Model ${m} failed: ${e.message}`);
            }
        }
    } catch (e) {
        console.error("List failed:", e.message);
    }
}
listModels();
