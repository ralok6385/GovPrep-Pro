require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function findWorkingModel() {
    console.log("--- BRUTE FORCE MODEL FINDER ---");
    const key = process.env.GEMINI_API_KEY;
    if (!key) { console.error("No Key"); return; }

    // 1. Fetch logical available models
    console.log("Fetching available models...");
    let availableModels = [];
    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            availableModels = data.models.map(m => m.name.replace('models/', ''));
        }
    } catch (e) {
        console.error("Failed to list models:", e.message);
    }

    console.log(`Found ${availableModels.length} models in account.`);

    // 2. Try generation on each interesting one
    const genAI = new GoogleGenerativeAI(key);

    // Priorities
    const priorities = [
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro',
        'gemini-pro',
        'gemini-1.0-pro'
    ];

    // Combine priorities with available (dedupe)
    const toTest = [...new Set([...priorities, ...availableModels])];

    console.log(`Testing ${toTest.length} models for generation capability...`);

    for (const modelName of toTest) {
        if (!modelName.includes('gemini')) continue; // skip embedding/other models
        if (modelName.includes('vision')) continue;

        process.stdout.write(`Testing ${modelName.padEnd(40)} `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // Set timeout via promise race to avoid hanging
            const resultPromise = model.generateContent("Hi");
            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));

            const result = await Promise.race([resultPromise, timeoutPromise]);
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log(`✅ WORKING!`);
            } else {
                console.log(`❌ Empty Response`);
            }
        } catch (e) {
            let msg = e.message;
            if (msg.includes('429')) msg = "429 Rate Limit";
            if (msg.includes('404')) msg = "404 Not Found";
            if (msg.includes('400')) msg = "400 Bad Request";
            console.log(`❌ ${msg.substring(0, 30)}`);
        }
    }
}

findWorkingModel();
