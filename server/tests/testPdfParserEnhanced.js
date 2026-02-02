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

const enhancedParsePdfQuestions = (text) => {
    // 1. Extract Global Answer Key
    const answerKeyMap = {};
    const answerKeyRegex = /(?:Answer Key|Solutions|Answers|Solved Questions|Correct Answers)[\s\:\-\.]*\n([\s\S]*)$/i;
    const answerKeyMatch = text.match(answerKeyRegex);

    if (answerKeyMatch) {
        console.log("[Parser] Answer Key section found.");
        const keyText = answerKeyMatch[1];
        const keyLines = keyText.split('\n');

        keyLines.forEach(line => {
            // Pattern like "1. (c)" or "1 - B" or "1. C" or "Q1. A"
            const match = line.match(/(?:Q\.?)?\s*(\d+)[\.\)]\s*[\(\[]?([A-D])[\)\]\.]/i);
            if (match) {
                answerKeyMap[match[1]] = match[2].toUpperCase();
            }
        });
        console.log("[Parser] Extracted Answer Key:", answerKeyMap);
    }

    // 2. Remove answer key from text to avoid processing it as questions
    const textWithoutKey = text.split(/(?:Answer Key|Solutions|Answers|Solved Questions|Correct Answers)/i)[0];

    // 3. Split into blocks
    const questionBlocks = textWithoutKey.split(/(?=\n\s*(?:Q\.?)?\s*\d+[\.\)]\s+)/i);
    const parsedQuestions = [];

    questionBlocks.forEach((block, index) => {
        const cleanBlock = block.trim();
        if (!cleanBlock || cleanBlock.length < 20) return;

        // Try to find answer in block first
        const answerRegex = /(?:Answer|Ans|Correct|Right Option)[\s\:\-\.]*([A-D])/i;
        const answerMatch = cleanBlock.match(answerRegex);
        let correctOption = answerMatch ? answerMatch[1].toUpperCase() : null;

        // Extract question number
        const numberMatch = cleanBlock.match(/^(?:Q\.?)?\s*(\d+)[\.\)]/i);
        const questionNumber = numberMatch ? numberMatch[1] : null;

        // Correlation: use global map if not found in block
        if (!correctOption && questionNumber && answerKeyMap[questionNumber]) {
            correctOption = answerKeyMap[questionNumber];
        }

        if (!correctOption) {
            console.log(`[Parser] Skipping block ${index} (No answer found for Q${questionNumber || 'unknown'})`);
            return;
        }

        // --- Extract Text and Options ---
        // Regex for options on same or multiple lines: (a) text (b) text
        const optionRegex = /[\(\[]?([A-D])[\)\]\.]\s*(.+?)(?=\s*[\(\[]?[A-D][\)\]\.]|$)/gi;
        const opts = { A: "", B: "", C: "", D: "" };
        let match;
        const optionsOnThisLine = [];

        let qText = cleanBlock;
        // Find all options and store their positions
        while ((match = optionRegex.exec(cleanBlock)) !== null) {
            const letter = match[1].toUpperCase();
            const text = match[2].trim();
            opts[letter] = text;
            optionsOnThisLine.push({ letter, text, index: match.index, full: match[0] });
        }

        // Clean question text: everything before the first option
        if (optionsOnThisLine.length > 0) {
            const firstOptionIndex = optionsOnThisLine[0].index;
            qText = cleanBlock.substring(0, firstOptionIndex).trim();
        }

        // Remove question number from text
        qText = qText.replace(/^(?:Q\.?)?\s*\d+[\.\)]\s*/i, '').trim();

        // Clean Answer/Ans line from question text or options if it leaked in
        const cleanTail = (str) => str.split(/(?:Answer|Ans|Correct|Right Option)/i)[0].trim();
        qText = cleanTail(qText);
        Object.keys(opts).forEach(k => opts[k] = cleanTail(opts[k]));

        if (qText && (opts.A || opts.B)) {
            parsedQuestions.push({
                index: questionNumber,
                text: qText,
                options: [
                    { id: 'A', text: opts.A || "Option A" },
                    { id: 'B', text: opts.B || "Option B" },
                    { id: 'C', text: opts.C || "Option C" },
                    { id: 'D', text: opts.D || "Option D" }
                ],
                correctOption: correctOption
            });
        }
    });

    return parsedQuestions;
};

console.log("--- Testing Enhanced Logic ---");
const results = enhancedParsePdfQuestions(sampleText);
console.log(`Extracted: ${results.length} questions`);

results.forEach(q => {
    console.log(`\nQ${q.index}: ${q.text}`);
    q.options.forEach(o => console.log(`  ${o.id}: ${o.text}`));
    console.log(`  Correct: ${q.correctOption}`);
});
