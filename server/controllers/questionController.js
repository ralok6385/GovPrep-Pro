const Question = require('../models/Question');

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const { translate } = require('google-translate-api-x');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini for fallback translation
let genAI, geminiModel;
if (process.env.GEMINI_API_KEY) {
    try {
        genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        geminiModel = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
    } catch (e) {
        console.error("Gemini Init Fail in QuestionController:", e.message);
    }
}

// Universal Robust Translator
const robustTranslate = async (text, targetLang = 'hi') => {
    if (!text || text.trim() === "") return "";

    // 1. Try Google Translate (Free)
    try {
        const res = await translate(text, { to: targetLang, forceBatch: false });
        if (res && res.text) return res.text;
    } catch (e) {
        console.warn(`[Translation] Google Translate failed for: "${text.substring(0, 20)}...". Error: ${e.message}`);
    }

    // 2. Try Gemini Fallback
    if (geminiModel) {
        try {
            console.log(`[Translation] Falling back to Gemini for: "${text.substring(0, 20)}..."`);
            const prompt = `Translate the following text to ${targetLang === 'hi' ? 'Hindi' : 'English'}. Return ONLY the translated text, no extra commentary.\n\nText: ${text}`;
            const result = await geminiModel.generateContent(prompt);
            const response = await result.response;
            return response.text().trim();
        } catch (e) {
            console.error(`[Translation] Gemini Fallback also failed: ${e.message}`);
        }
    }

    return ""; // Total failure
};

// Helper to auto-translate a single question object
const autoTranslateQuestion = async (qData) => {
    try {
        console.log(`[Translation] Robust Translating question: "${qData.text?.substring(0, 30)}..."`);

        // Translate Text
        if (!qData.textHindi && qData.text) {
            const hText = await robustTranslate(qData.text, 'hi');
            if (hText) qData.textHindi = hText;
        }

        // Options
        if (qData.options && Array.isArray(qData.options)) {
            await Promise.all(qData.options.map(async (opt, idx) => {
                if (typeof opt === 'object' && opt.text && !opt.textHindi) {
                    const hOpt = await robustTranslate(opt.text, 'hi');
                    if (hOpt) qData.options[idx].textHindi = hOpt;
                }
            }));
        }

        // Explanation
        if (!qData.explanationHindi && qData.explanation) {
            if (qData.explanation !== "Extracted from PDF") {
                const hExp = await robustTranslate(qData.explanation, 'hi');
                if (hExp) qData.explanationHindi = hExp;
            } else {
                qData.explanationHindi = "PDF से निकाला गया";
            }
        }

        return qData;
    } catch (error) {
        console.error("Auto-Translation Critical Fail:", error.message);
        return qData;
    }
};

// @desc    Add a new question
// @route   POST /api/questions
// @access  Private/Admin
const createQuestion = async (req, res) => {
    let {
        text,
        textHindi,
        options,
        correctOption,
        explanation,
        explanationHindi,
        subjectId,
        difficulty,
    } = req.body;

    // Auto-Translate if Hindi missing
    if (!textHindi) {
        const translated = await autoTranslateQuestion({ text, textHindi, options, explanation, explanationHindi });
        textHindi = translated.textHindi;
        explanationHindi = translated.explanationHindi;
        // Options are updated in place in the object if passed by reference, but we reconstructed above
        options = translated.options;
    }

    const question = await Question.create({
        text,
        textHindi,
        options,
        correctOption,
        explanation,
        explanationHindi,
        subjectId,
        difficulty,
    });

    res.status(201).json(question);
};

// @desc    Bulk create questions (for Excel/CSV upload)
// @route   POST /api/questions/bulk
// @access  Private/Admin
const bulkCreateQuestions = async (req, res) => {
    try {
        const { questions, subjectId } = req.body; // Expects array of question objects

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'No questions provided' });
        }

        console.log(`Processing Bulk Upload: ${questions.length} questions...`);

        // Add subjectId and Auto-Translate in small batches to prevent timeouts
        const BATCH_SIZE = 5;
        const questionsToInsert = [];

        for (let i = 0; i < questions.length; i += BATCH_SIZE) {
            const chunk = questions.slice(i, i + BATCH_SIZE);
            console.log(`[Bulk Upload] Translating batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(questions.length / BATCH_SIZE)}...`);

            const translatedChunk = await Promise.all(chunk.map(async (q) => {
                let newQ = { ...q };
                const finalSubjectId = q.subjectId || subjectId;
                if (finalSubjectId) newQ.subjectId = finalSubjectId;

                // Auto Translate if missing Hindi
                if (!newQ.textHindi) {
                    newQ = await autoTranslateQuestion(newQ);
                }
                return newQ;
            }));

            questionsToInsert.push(...translatedChunk);
        }

        const insertedQuestions = await Question.insertMany(questionsToInsert);
        res.status(201).json(insertedQuestions);
    } catch (error) {
        console.error('Bulk Upload Error:', error);
        res.status(500).json({
            message: 'Failed to bulk upload questions',
            error: error.message // Send specific error details to frontend
        });
    }
};

// @desc    Get questions by subject (for Admin browsing)
// @route   GET /api/questions/subject/:subjectId
// @access  Private/Admin
const getQuestionsBySubject = async (req, res) => {
    const questions = await Question.find({ subjectId: req.params.subjectId });
    res.json(questions);
};

// @desc    Get all questions (with search/filter support)
// @route   GET /api/questions
// @access  Private/Admin
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find({})
            .populate('subjectId', 'name')
            .sort({ createdAt: -1 });
        res.json(questions);
    } catch (error) {
        console.error('Fetch Questions Error:', error);
        res.status(500).json({ message: 'Failed to fetch questions' });
    }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Private
const getQuestionById = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id).populate('subjectId', 'name');

        if (question) {
            res.json(question);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error('Fetch Question Error:', error);
        res.status(500).json({ message: 'Failed to fetch question' });
    }
};

// @desc    Delete a question
// @route   DELETE /api/questions/:id
// @access  Private/Admin
const deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findById(req.params.id);

        if (question) {
            await Question.deleteOne({ _id: req.params.id });
            res.json({ message: 'Question removed' });
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error('Delete Question Error:', error);
        res.status(500).json({ message: 'Failed to delete question' });
    }
};

// @desc    Update a question
// @route   PUT /api/questions/:id
// @access  Private/Admin
const updateQuestion = async (req, res) => {
    try {
        const {
            text,
            textHindi,
            options,
            correctOption,
            explanation,
            explanationHindi,
            subjectId,
            difficulty,
        } = req.body;

        const question = await Question.findById(req.params.id);

        if (question) {
            question.text = text || question.text;
            question.textHindi = textHindi || question.textHindi;
            question.options = options || question.options;
            question.correctOption = correctOption || question.correctOption;
            question.explanation = explanation || question.explanation;
            question.explanationHindi = explanationHindi || question.explanationHindi;
            question.subjectId = subjectId || question.subjectId;
            question.difficulty = difficulty || question.difficulty;

            // Optional: Re-translate if english text changed but hindi didn't?
            // For now, let's assume manual edit overrides auto-translation logic 
            // OR if user wants re-translation they can use the button in UI.

            const updatedQuestion = await question.save();
            res.json(updatedQuestion);
        } else {
            res.status(404).json({ message: 'Question not found' });
        }
    } catch (error) {
        console.error('Update Question Error:', error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

// @desc    Get questions by multiple IDs (Batch)
// @route   POST /api/questions/batch
// @access  Private
const getQuestionsByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        if (!ids || !Array.isArray(ids)) {
            return res.status(400).json({ message: 'Invalid IDs array' });
        }

        const questions = await Question.find({ _id: { $in: ids } });
        res.json(questions);
    } catch (error) {
        console.error('Batch Fetch Error:', error);
        res.status(500).json({ message: 'Failed to fetch batch questions' });
    }
};

module.exports = {
    createQuestion,
    bulkCreateQuestions,
    getQuestionsBySubject,
    getQuestions,
    getQuestionById,
    deleteQuestion,
    updateQuestion,
    getQuestionsByIds,
    autoTranslateQuestion
};
