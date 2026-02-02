require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    if (!process.env.GEMINI_API_KEY) {
        console.error("❌ No GEMINI_API_KEY found in .env");
        return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    try {
        console.log("🔍 Fetching available Gemini models...");
        // Hack: The SDK doesn't always expose listModels directly on the main class in older/newer versions easily,
        // but let's try via the model manager if available, or just try a known list.
        // Actually, the best way verification is to try a simple generation with different names.

        const modelsToTest = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-flash-001",
            "gemini-pro",
            "gemini-1.0-pro"
        ];

        for (const modelName of modelsToTest) {
            process.stdout.write(`Testing ${modelName}... `);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hello");
                const response = await result.response;
                console.log(`✅ SUCCESS! (Response: ${response.text().trim()})`);
                // Found a working one, export it? No, just log it.
            } catch (error) {
                console.log(`❌ Failed: ${error.message}`);
                if (error.response) console.log(JSON.stringify(error.response, null, 2));
            }
        }

    } catch (error) {
        console.error("Fatal Error:", error);
    }
}

listModels();
