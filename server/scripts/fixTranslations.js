require('dotenv').config();
const mongoose = require('mongoose');
const Question = require('../models/Question');
const { autoTranslateQuestion } = require('../controllers/questionController');

async function fixMissingTranslations() {
    try {
        console.log("--- Starting Global Translation Fix ---");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Database Connected");

        // Find questions missing textHindi
        const missing = await Question.find({
            $or: [
                { textHindi: { $exists: false } },
                { textHindi: "" },
                { "options.textHindi": { $exists: false } }
            ]
        });

        console.log(`Found ${missing.length} questions missing Hindi translations.`);

        const BATCH_SIZE = 5;
        let successCount = 0;

        for (let i = 0; i < missing.length; i += BATCH_SIZE) {
            const chunk = missing.slice(i, i + BATCH_SIZE);
            console.log(`Processing Batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(missing.length / BATCH_SIZE)}...`);

            await Promise.all(chunk.map(async (q) => {
                const qObj = q.toObject();
                const translated = await autoTranslateQuestion(qObj);

                // Update the document
                await Question.findByIdAndUpdate(q._id, {
                    textHindi: translated.textHindi,
                    options: translated.options,
                    explanationHindi: translated.explanationHindi
                });
                successCount++;
            }));
        }

        console.log(`\n--- Migration Finished ---`);
        console.log(`Successfully updated ${successCount} questions.`);
        process.exit(0);

    } catch (error) {
        console.error("Migration Failed:", error);
        process.exit(1);
    }
}

fixMissingTranslations();
