const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

async function testKey() {
    try {
        const key = process.env.GEMINI_API_KEY;
        console.log("Testing Key:", key ? `${key.substring(0, 5)}...` : "NONE");
        const genAI = new GoogleGenerativeAI(key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("echo 'Key works'");
        const response = await result.response;
        console.log("Success:", response.text());
        process.exit(0);
    } catch (e) {
        console.error("Key Failed:", e.message);
        process.exit(1);
    }
}
testKey();
