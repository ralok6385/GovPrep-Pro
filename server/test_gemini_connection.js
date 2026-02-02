require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testConnection() {
    console.log("--- Testing Gemini Connection ---");

    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error("ERROR: GEMINI_API_KEY is missing in .env");
        return;
    }
    console.log(`API Key found: ${key.substring(0, 5)}...`);

    try {
        /*
        const genAI = new GoogleGenerativeAI(key);
        // Test with the model we are trying to use
        const modelName = "gemini-1.5-flash"; 
        console.log(`Attempting to use model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });

        const prompt = "Explain why the sky is blue in one sentence.";
        console.log("Sending prompt...");
        
        const result = await model.generateContent(prompt);
        */

        // LIST MODELS
        console.log("Listing models...");
        // Direct REST call or SDK method if available (SDK might not expose listModels directly on client instance easily without admin access or specific import)
        // actually the node SDK doesn't have listModels on the client object easily.

        const candidates = [
            "gemini-2.0-flash-lite-preview-02-05",
            "gemini-exp-1206",
            "gemini-1.5-flash" // Retry just in case
        ];

        console.log("--- Testing Candidates ---");
        const genAI = new GoogleGenerativeAI(key);

        for (const modelName of candidates) {
            console.log(`\nTesting: ${modelName} ...`);
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`✅ SUCCESS with ${modelName}`);
                console.log(`Response: ${response.text().substring(0, 50)}...`);
                // If we get here, we found a good one, maybe break or just show all
            } catch (error) {
                console.log(`❌ FAILED with ${modelName}`);
                console.log(`Error: ${error.message.substring(0, 150)}...`);
            }
        }

    } catch (error) {
        console.error("--- FAILURE ---");
        console.error(error.message);
        if (error.message.includes('404')) {
            console.log("Hint: The model name might be wrong or your API key doesn't have access to it.");
        }
        if (error.message.includes('403')) {
            console.log("Hint: API Key is invalid or quota exceeded.");
        }
    }
}

testConnection();
