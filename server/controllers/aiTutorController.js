const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
let genAI;
const MODEL_CANDIDATES = [
    "gemini-2.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3-flash-preview",
    "gemini-2.0-flash", // Keep as backup
    "gemini-pro"
];

if (process.env.GEMINI_API_KEY) {
    try {
        console.log("Initializing Gemini Client...");
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    } catch (e) {
        console.error("Gemini Init Fail:", e.message);
    }
}

// Helper to try models sequentially
async function generateWithFallback(prompt) {
    let lastError = null;
    for (const modelName of MODEL_CANDIDATES) {
        try {
            console.log(`Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
            // If 404, try next. If 429, also try next (other model might have different quota?)
        }
    }
    throw lastError;
}

// @desc    Get AI Explanation for a question
// @route   POST /api/ai/explain
// @access  Private (Student)
const explainQuestion = async (req, res) => {
    try {
        const { questionText, options, correctOption, userSelectedOption, language = 'hinglish' } = req.body;

        if (!questionText) {
            return res.status(400).json({ message: 'Question text is required' });
        }

        if (!genAI) {
            return res.status(503).json({ message: 'AI Service Unavailable (Config)' });
        }

        const prompt = `
        Act as a friendly and encouraging expert tutor.
        The student is stuck on this question:
        "${questionText}"

        Options: ${JSON.stringify(options)}
        Correct Answer: ${correctOption}
        Student Selected: ${userSelectedOption || "None"}

        Goal: Explain WHY the correct answer is right and (if applicable) why the student's choice was wrong.
        
        Style:
        - Use "Hinglish" (Mix of Hindi and English) which is popular for competitive exams.
        - Keep it short (under 100 words).
        - Be encouraging ("Don't worry!", "Great try!").
        - Use emoji 🌟.

        Output Format: Just the explanation text.
        `;

        const text = await generateWithFallback(prompt);

        res.json({ explanation: text });

    } catch (error) {
        console.error('AI Tutor Fallback Failed:', error);

        if (error?.message?.includes('429') || error?.status === 429) {
            return res.status(429).json({ message: 'AI is currently busy (All models quota exceeded). Please try again in 1 minute.' });
        }

        res.status(500).json({
            message: 'Failed to generate explanation',
            error: error?.message || "Unknown error"
        });
    }
};

module.exports = { explainQuestion };
