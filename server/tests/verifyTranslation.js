const { autoTranslateQuestion } = require('../controllers/questionController');

async function verifyTranslation() {
    console.log("--- Starting Translation Verification ---");

    const mockQuestion = {
        text: "Which planet is known as the Red Planet?",
        options: [
            { id: 'A', text: 'Venus' },
            { id: 'B', text: 'Mars' },
            { id: 'C', text: 'Jupiter' },
            { id: 'D', text: 'Saturn' }
        ],
        explanation: "Mars is often called the Red Planet because of iron oxide on its surface."
    };

    console.log("Original English Question:", mockQuestion.text);

    try {
        const result = await autoTranslateQuestion(mockQuestion);

        console.log("\n--- Translation Result ---");
        console.log("Hindi Text:", result.textHindi);
        console.log("Options:");
        result.options.forEach(opt => {
            console.log(`  ${opt.id}: ${opt.text} -> ${opt.textHindi}`);
        });
        console.log("Hindi Explanation:", result.explanationHindi);

        if (result.textHindi && result.textHindi !== result.text) {
            console.log("\n✅ SUCCESS: Question translated successfully.");
        } else {
            console.log("\n❌ FAILURE: Question not translated or remained identical.");
        }
    } catch (error) {
        console.error("Verification Error:", error);
    }
}

// Mock necessary parts or just run if independent
if (require.main === module) {
    verifyTranslation().then(() => process.exit(0));
}
