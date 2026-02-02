const sampleText = `
SSO / Railway Exam - Practice Question Paper (PDF)

Instructions: Attempt all questions. This is a practice paper based on previous year patterns.

1. What is the SI unit of Force?
(a) Watt (b) Joule (c) Newton (d) Pascal

2. If 5x = 20, find the value of x.
(a) 2 (b) 3 (c) 4 (d) 5

3. Who is known as the Father of the Indian Constitution?
(a) Mahatma Gandhi (b) B.R. Ambedkar (c) Nehru (d) Patel

4. Synonym of 'Rapid' is:
(a) Slow (b) Fast (c) Weak (d) Late

5. Which gas is most abundant in Earth's atmosphere?
(a) Oxygen (b) Nitrogen (c) Carbon Dioxide (d) Hydrogen

Answer Key

1. (c) Newton
2. (c) 4
3. (b) B.R. Ambedkar
4. (b) Fast
5. (b) Nitrogen
`;

const parsePdfQuestions = (text) => {
    // Current logic simulation (simplified)
    const questionBlocks = text.split(/(?=\n\s*(?:Q\.?)?\s*\d+[\.\)]\s+)/i);
    const parsedQuestions = [];

    questionBlocks.forEach((block, index) => {
        const cleanBlock = block.trim();
        if (!cleanBlock || cleanBlock.length < 20) return;

        const answerRegex = /(?:Answer|Ans|Correct|Right Option)[\s\:\-\.]*([A-D])/i;
        const answerMatch = cleanBlock.match(answerRegex);
        const correctOption = answerMatch ? answerMatch[1].toUpperCase() : null;

        if (!correctOption) {
            console.log(`[Test] Skip block ${index} because no Answer line found.`);
            return;
        }

        // ... rest of logic ...
        parsedQuestions.push({ text: "Simulated extracted text" });
    });

    return parsedQuestions;
};

console.log("--- Testing Current Logic ---");
const results = parsePdfQuestions(sampleText);
console.log(`Extracted: ${results.length} questions`);

if (results.length === 0) {
    console.log("Current logic failed as expected (0 questions extracted).");
}
