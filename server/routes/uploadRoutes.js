const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parsePdfQuestions } = require('../utils/pdfParser');
const { parseExcelQuestions } = require('../utils/excelParser');
const Question = require('../models/Question');
const { autoTranslateQuestion } = require('../controllers/questionController');
const { protect, admin } = require('../middleware/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// @desc    Upload Excel and extract questions
// @route   POST /api/upload/excel-questions
// @access  Private/Admin
router.post('/excel-questions', protect, admin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { subjectId, testId } = req.body;

        // 1. Parse Excel
        const extractedQuestions = await parseExcelQuestions(req.file.buffer);
        console.log(`[Excel Route] Extracted ${extractedQuestions?.length || 0} questions.`);

        if (!extractedQuestions || extractedQuestions.length === 0) {
            return res.status(400).json({ message: 'No valid questions found in the Excel file.' });
        }

        // 2. Prepare Questions (Add Subject ID)
        const BATCH_SIZE = 5;
        const skipTranslation = extractedQuestions.length > 50;
        const finalQuestions = [];

        console.log(`[Excel Route] Processing ${extractedQuestions.length} questions. Skip Translation: ${skipTranslation}`);

        if (skipTranslation) {
            extractedQuestions.forEach(q => {
                finalQuestions.push({ ...q, subjectId: subjectId || null });
            });
        } else {
            // Smaller uploads can still benefit from auto-translation
            for (let i = 0; i < extractedQuestions.length; i += BATCH_SIZE) {
                const chunk = extractedQuestions.slice(i, i + BATCH_SIZE);
                const processedChunk = await Promise.all(chunk.map(async (q) => {
                    let newQ = { ...q, subjectId: subjectId || null };
                    if (newQ.text && !newQ.textHindi && !newQ.text.includes("N/A")) {
                        try {
                            return await autoTranslateQuestion(newQ);
                        } catch (e) {
                            console.warn("[Excel Route] Translation failed for one question, skipping...");
                            return newQ;
                        }
                    }
                    return newQ;
                }));
                finalQuestions.push(...processedChunk);
            }
        }

        // 3. Insert into DB in chunks to prevent memory issues for 10,000+ items
        const DB_CHUNK_SIZE = 500;
        let totalInserted = 0;
        const allInsertedIds = [];

        for (let i = 0; i < finalQuestions.length; i += DB_CHUNK_SIZE) {
            const chunk = finalQuestions.slice(i, i + DB_CHUNK_SIZE);
            const result = await Question.insertMany(chunk, { ordered: false });
            totalInserted += result.length;
            allInsertedIds.push(...result.map(q => q._id));
        }

        // 4. Link to Test
        let finalMessage = `Successfully extracted and created ${totalInserted} questions from Excel`;

        if (totalInserted === 0) {
            return res.status(400).json({
                message: 'No valid questions were created. The file might be duplicate, empty, or contain only noise.'
            });
        }

        if (testId && allInsertedIds.length > 0) {
            const Test = require('../models/Test');
            const updatedTest = await Test.findByIdAndUpdate(
                testId,
                { $push: { questions: { $each: allInsertedIds } } },
                { new: true }
            );
            if (updatedTest) finalMessage += ` and added them to test "${updatedTest.title}"`;
        }

        res.json({
            message: finalMessage,
            count: totalInserted,
            linkedTestId: testId || null
        });

    } catch (error) {
        console.error('Excel Upload Error:', error);
        res.status(500).json({ message: `Failed to process Excel: ${error.message}` });
    }
});

// @desc    Upload PDF and extract questions
// @route   POST /api/upload/pdf-questions
// @access  Private/Admin
router.post('/pdf-questions', protect, admin, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const { subjectId, testId } = req.body;

        // 1. Parse PDF
        const extractedQuestions = await parsePdfQuestions(req.file.buffer);
        console.log(`[PDF Route] Extracted ${extractedQuestions?.length || 0} questions.`);

        if (!extractedQuestions || extractedQuestions.length === 0) {
            return res.status(400).json({ message: 'No valid questions found in the PDF file.' });
        }

        // 2. Prepare Questions (Add Subject ID)
        const BATCH_SIZE = 5;
        const skipTranslation = extractedQuestions.length > 50;
        const finalQuestions = [];

        console.log(`[PDF Route] Processing ${extractedQuestions.length} questions. Skip Translation: ${skipTranslation}`);

        if (skipTranslation) {
            extractedQuestions.forEach(q => {
                finalQuestions.push({ ...q, subjectId: subjectId || null });
            });
        } else {
            for (let i = 0; i < extractedQuestions.length; i += BATCH_SIZE) {
                const chunk = extractedQuestions.slice(i, i + BATCH_SIZE);
                const processedChunk = await Promise.all(chunk.map(async (q) => {
                    let newQ = { ...q, subjectId: subjectId || null };
                    if (newQ.text && !newQ.textHindi && !newQ.text.includes("N/A")) {
                        try {
                            return await autoTranslateQuestion(newQ);
                        } catch (e) {
                            return newQ;
                        }
                    }
                    return newQ;
                }));
                finalQuestions.push(...processedChunk);
            }
        }

        // 3. Insert into DB
        const DB_CHUNK_SIZE = 500;
        let totalInserted = 0;
        const allInsertedIds = [];

        for (let i = 0; i < finalQuestions.length; i += DB_CHUNK_SIZE) {
            const chunk = finalQuestions.slice(i, i + DB_CHUNK_SIZE);
            const result = await Question.insertMany(chunk, { ordered: false });
            totalInserted += result.length;
            allInsertedIds.push(...result.map(q => q._id));
        }

        // 4. Link to Test
        let finalMessage = `Successfully extracted and created ${totalInserted} questions from PDF`;

        if (totalInserted === 0) {
            return res.status(400).json({
                message: 'No valid questions were created. The file might be duplicate, empty, or contain only noise.'
            });
        }

        if (testId && allInsertedIds.length > 0) {
            const Test = require('../models/Test');
            const updatedTest = await Test.findByIdAndUpdate(
                testId,
                { $push: { questions: { $each: allInsertedIds } } },
                { new: true }
            );
            if (updatedTest) finalMessage += ` and added them to test "${updatedTest.title}"`;
        }

        res.json({
            message: finalMessage,
            count: totalInserted,
            linkedTestId: testId || null
        });

    } catch (error) {
        console.error('PDF Upload Error:', error);
        res.status(500).json({ message: `Failed to process PDF: ${error.message}` });
    }
});

module.exports = router;
