// 1. Mock pdf-parse BEFORE requiring the utility
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

const mockPdf = (buf) => Promise.resolve({ text: sampleText });
require.cache[require.resolve('pdf-parse')] = {
    id: require.resolve('pdf-parse'),
    exports: mockPdf,
    loaded: true
};

// 2. Now require the utility
const { parsePdfQuestions } = require('../utils/pdfParser');

parsePdfQuestions(Buffer.from('hello')).then(res => {
    console.log(`Extracted: ${res.length} questions`);
    res.forEach((q, i) => {
        console.log(`\nQ${i + 1}: ${q.text}`);
        q.options.forEach(o => console.log(`  ${o.id}: ${o.text}`));
        console.log(`  Correct: ${q.correctOption}`);
    });
    if (res.length === 5) {
        console.log("\nVERIFICATION SUCCESSFUL: All 5 questions extracted with correct answers.");
    } else {
        console.error("\nVERIFICATION FAILED: Expected 5 questions, got " + res.length);
        process.exit(1);
    }
}).catch(err => {
    console.error("VERIFICATION ERROR:", err);
    process.exit(1);
});
