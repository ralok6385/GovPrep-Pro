const Question = require('../models/Question');
const { autoTranslateQuestion } = require('./questionController');
const { v4: uuidv4 } = require('uuid');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');

// Initialize AI Clients
let genAI, geminiModel;
let openai;

// 1. Setup OpenAI
try {
    if (process.env.OPENAI_API_KEY) {
        openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        console.log('✅ OpenAI Client Initialized');
    } else {
        console.log('ℹ️  OpenAI Key not found');
    }
} catch (err) {
    console.warn("❌ OpenAI Init Error:", err.message);
}

// 2. Setup Gemini
try {
    console.log('DEBUG: GEMINI_API_KEY present?', !!process.env.GEMINI_API_KEY);
    if (process.env.GEMINI_API_KEY) {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Revert to gemini-pro as 1.5-flash was not found by this SDK version
        geminiModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log('✅ Gemini Client Initialized (Model: gemini-1.5-flash)');
    } else {
        console.log('ℹ️  Gemini Key not found');
    }
} catch (err) {
    console.warn("❌ Gemini Init Error:", err.message);
}

// ...



// Helper: Simulated Generation (Fallback)
const generateSimulatedQuestions = async (topic, subjectId, count) => {
    const templates = [
        { t: "What is a primary characteristic of [TOPIC]?", o: ["Feature A", "Feature B", "Feature C", "Feature D"], c: "A", e: "Because A is core to [TOPIC]." },
        { t: "Which year was [TOPIC] established?", o: ["1947", "1950", "2000", "2024"], c: "B", e: "It happened mid-century." },
        { t: "Who is associated with [TOPIC]?", o: ["Gandhi", "Ambedkar", "Nehru", "Tagore"], c: "C", e: "He was the key figure." },
        { t: "What implies the opposite of [TOPIC]?", o: ["Concept X", "Concept Y", "Concept Z", "None"], c: "A", e: "X is the antonym contextually." },
        { t: "Why is [TOPIC] important?", o: ["Economy", "Health", "Space", "Defense"], c: "A", e: "It boosts GDP." }
    ];

    const questionsToSave = await Promise.all(Array.from({ length: count }).map(async (_, i) => {
        const temp = templates[i % templates.length];
        let q = {
            text: temp.t.replace('[TOPIC]', topic),
            options: temp.o.map((opt, idx) => ({ id: ['A', 'B', 'C', 'D'][idx], text: opt })),
            correctOption: temp.c,
            explanation: temp.e.replace('[TOPIC]', topic),
            subjectId: subjectId || null,
            difficulty: 'medium',
            examId: null
        };
        // Auto-Translate simulation too
        return await autoTranslateQuestion(q);
    }));

    try {
        const savedQuestions = await Question.insertMany(questionsToSave);
        return savedQuestions.map(q => ({
            ...q.toObject(),
            id: q._id
        }));
    } catch (err) {
        console.error("Simulation Save Error:", err);
        return [];
    }
};

// @desc    Generate generic questions based on topic
// @route   POST /api/ai/generate
// @access  Private/Admin
const generateQuestions = async (req, res) => {
    try {
        const { topic, subjectId, count = 5, difficulty = 'medium', instructions } = req.body;
        let generatedData = null;

        // Base Prompt Construction
        const basePrompt = `Generate ${count} multiple-choice questions on "${topic}" for a "${difficulty}" level competitive exam in India.
${instructions ? `IMPORTANT CUSTOM INSTRUCTIONS: ${instructions}` : ''}

Return ONLY a raw JSON array. Do not wrap in markdown code blocks. 
Each object must have: 
- "text": The question string
- "options": Array of 4 strings
- "correct": The correct option string EXACTLY matching one of the options
- "exp": A short explanation`;

        // STRATEGY 1: Use OpenAI (ChatGPT)
        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    messages: [
                        { role: "system", content: "You are a helpful assistant that generates multiple-choice questions in JSON format." },
                        { role: "user", content: basePrompt + ` Example JSON: [{ "text": "Q", "options": ["A","B"], "correct": "A", "exp": "..." }]` }
                    ],
                    model: "gpt-3.5-turbo",
                });
                const text = completion.choices[0].message.content;
                generatedData = JSON.parse(text);
            } catch (openaiErr) {
                console.error("OpenAI Failed, trying fallback...", openaiErr.message);
            }
        }

        // STRATEGY 2: Use Gemini (if OpenAI failed or not present)
        if (!generatedData && geminiModel) {
            try {
                const geminiPrompt = basePrompt + `
        Example format:
        [
            {
                "text": "Who is...",
                "options": ["A", "B", "C", "D"],
                "correct": "A",
                "exp": "Because..."
            }
        ]`;

                const result = await geminiModel.generateContent(geminiPrompt);
                const response = await result.response;
                let text = response.text();
                // Clean markdown if present
                text = text.replace(/```json/g, '').replace(/```/g, '').trim();
                generatedData = JSON.parse(text);
            } catch (geminiErr) {
                console.error("Gemini Failed, trying fallback...", geminiErr.message);
            }
        }

        // STRATEGY 3: Simulation (Fallback)
        if (!generatedData) {
            console.log('Using simulated AI (No Keys or Errors)');
            return res.json(await generateSimulatedQuestions(topic, subjectId, count));
        }

        // Parse & Format
        const questionsToSave = generatedData.map(q => {
            // Map correct answer string back to index ID (A, B, C, D)
            let correctId = 'A';
            const optionMap = ['A', 'B', 'C', 'D'];

            // If returned index or letter
            if (['A', 'B', 'C', 'D'].includes(q.correct)) correctId = q.correct;
            else {
                // Match text
                const correctIndex = q.options.findIndex(opt => opt === q.correct);
                if (correctIndex !== -1) correctId = optionMap[correctIndex];
            }

            return {
                text: q.text,
                options: q.options.map((opt, idx) => ({
                    id: optionMap[idx],
                    text: opt
                })),
                correctOption: correctId,
                explanation: q.exp,
                subjectId: subjectId || null, // Allow null if not provided
                difficulty: difficulty,
                examId: null // Generic question
            };
        });

        // Batched Auto-Translate for AI results
        const BATCH_SIZE = 5;
        const finalQuestions = [];
        for (let i = 0; i < questionsToSave.length; i += BATCH_SIZE) {
            const chunk = questionsToSave.slice(i, i + BATCH_SIZE);
            const translatedChunk = await Promise.all(chunk.map(q => autoTranslateQuestion(q)));
            finalQuestions.push(...translatedChunk);
        }

        // SAVE TO DB
        const savedQuestions = await Question.insertMany(finalQuestions);

        // Format for frontend (ensure _id is available)
        const formattedQuestions = savedQuestions.map(q => ({
            ...q.toObject(),
            id: q._id // Ensure frontend gets an 'id' field compatible with UUID/MongoID
        }));

        res.json(formattedQuestions);

    } catch (error) {
        console.error('AI Gen Error:', error);
        res.json(await generateSimulatedQuestions(req.body.topic, req.body.subjectId, 5));
    }
};

// @desc    Translate question content
// @route   POST /api/ai/translate
// @access  Private/Admin
const { translate } = require('google-translate-api-x');

// ... (existing code)

// @desc    Translate question content
// @route   POST /api/ai/translate
// @access  Private/Admin
const translateContent = async (req, res) => {
    try {
        const { sourceLang, targetLang, content } = req.body;

        console.log(`[Translate] Request received: ${sourceLang} -> ${targetLang}`);

        if (!content) {
            return res.status(400).json({ message: 'No content provided for translation' });
        }

        let translatedData = null;

        // 1. Try Free Google Translate (Primary strategy since API keys are unstable)
        try {
            console.log("⏳ Converting text using Free Translate Engine...");
            const toLang = targetLang === 'hi' ? 'hi' : 'en';

            const translateText = async (text) => {
                if (!text) return "";
                const res = await translate(text, { to: toLang, forceBatch: false });
                return res.text;
            };

            // Translate fields in parallel
            translatedData = {
                text: await translateText(content.text),
                options: await Promise.all((content.options || []).map(opt => translateText(opt))),
                explanation: await translateText(content.explanation)
            };

            console.log("✅ Free Translation Success");
        } catch (freeErr) {
            console.error("❌ Free Translation Failed:", freeErr.message);
        }

        // 2. Fallback / Simulation (If free translation fails)
        if (!translatedData) {
            console.warn("⚠️ All Translation methods failed. Using fallback simulation.");

            // Simple mock translation for demo purposes
            if (targetLang === 'hi') {
                translatedData = {
                    text: (content.text || "") + " (Hindi)",
                    options: (content.options || []).map(o => o + " (Hindi)"),
                    explanation: (content.explanation || "") + " (Hindi)"
                };
            } else {
                translatedData = {
                    text: (content.text || "") + " (English)",
                    options: (content.options || []).map(o => o + " (English)"),
                    explanation: (content.explanation || "") + " (English)"
                };
            }
        }

        if (translatedData) {
            res.json(translatedData);
        } else {
            res.status(500).json({ message: 'Translation failed.' });
        }

    } catch (error) {
        console.error('[Translation Error]:', error);
        res.status(500).json({ message: 'Server error during translation' });
    }
};

module.exports = { generateQuestions, translateContent };
