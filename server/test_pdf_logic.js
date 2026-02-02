const fs = require('fs');

// Simple direct test of logic
const text = fs.readFileSync('debug_last_pdf.txt', 'utf8');

// Since we can't easily Jest mock in a simple node script without Jest, 
// let's just create a modified version of the function that accepts TEXT input 
// or simpler: just use the copy-pasted logic in a script like I did for test_v27 but ensure it matches pdfParser exactly.

// Actually, I can just call blockFirstParser if I export it? 
// No, it's not exported.

// Let's create a script that IMPORTS the pdfParser and runs it.
// We'll mock the buffer as a string, but pdf-parse expects a buffer.
// It's easier to just read the file and feed it to the function but we need to bypass `pdf()` call if we want to test the TEXT directly.
// But wait, parsePdfQuestions CALLS pdf().
// If I pass a buffer of a valid PDF it works.
// If I pass a dummy buffer, pdf() fails.

// Plan B: Copy-Paste the BlockFirstParser from pdfParser.js (which I verified has the logs now) 
// and run it on the text file content. This confirms the LOGIC flow.

// Copied EXACTLY from pdfParser.js (V27 + Logs)
const getHumanScore = (text) => {
    if (!text || text.length < 2) return 0;
    const cleanText = text.trim();
    const safeText = cleanText.replace(/[^\x20-\x7E\n\r\t\u0900-\u097F\u20B9]/g, '');
    const purity = (safeText.length / cleanText.length) * 100;
    let score = purity;
    if (/\b(?:iwa|stylesheet|font-family|binary|index\.xml|captions|shapestyle|THhyperlink|label|Christ|Domini|TOC|PYQ|Type|Standard)\b/i.test(cleanText)) score -= 150;
    if (/\bst quarter\b/i.test(cleanText)) score -= 150;
    const words = cleanText.split(/\s+/).filter(w => w.length > 0);
    if (words.length >= 2) score += 20;
    if (cleanText.length < 50 && purity > 70) score += 40;
    const artifacts = (cleanText.match(/\ufffd/g) || []).length;
    if (artifacts > 2) score -= (artifacts * 30);
    return score;
};

const extractDetachedAnswers = (text) => {
    const answerMap = {};
    const keyHeader = text.match(/(?:Answers|Answer Key|Key|Solution|Solutions|Correct Options)(?:[\s\S]{0,50}(?:Only Options|Key|Sheet))?/i);
    if (keyHeader) {
        const keySection = text.substring(keyHeader.index);
        const matches = keySection.matchAll(/(?:Q|º|\.|^|\s)(\d+)[\s\.\:\-\)]+\s*([A-D1-4])/gi);
        for (const m of matches) {
            answerMap[m[1]] = m[2].toUpperCase();
        }
    }
    return answerMap;
};

const blockFirstParser = (text) => {
    const questions = [];
    if (!text || text.length < 20) return [];

    console.log("--- RUNNING PDF PARSER LOGIC ---");
    text = "\n" + text; // V27 Q1 Fix
    const answerKey = extractDetachedAnswers(text);
    console.log("Detached Answers:", answerKey);

    const markerPattern = /(?:\d+|Q\s*\.?\s*\d+|Question|Ques|प्रश्न|Pt|I{1,3}|IV|V|VI{1,3}|IX|X)/i.source;
    const blockRegex = new RegExp(`(?:\\r?\\n|^|\\s+)(${markerPattern}\\s*[\\.\\)\\:\\-]\\s+[\\s\\S]+?)(?=(?:\\r?\\n|\\s+)${markerPattern}\\s*[\\.\\)\\:\\-]\\s+|$)`, 'gi');

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        let clean = match[1].trim();
        console.log(`[V27 DEBUG] Block Found: ${clean.substring(0, 30)}...`);

        clean = clean.replace(/([^\s])([A-D1-4][\)])/g, '$1 $2');
        clean = clean.replace(/✅/g, '');

        const markerNumMatch = clean.match(new RegExp(`^(${markerPattern})`, 'i'));
        const markerRaw = markerNumMatch ? markerNumMatch[1].replace(/\D/g, '') : null;

        let optA = clean.match(/(?:^|\s)[\[\(]?(?:A|1)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:B|2)[\]\.\)\:\s]|$)/i);
        let optB = clean.match(/(?:^|\s)[\[\(]?(?:B|2)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:C|3)[\]\.\)\:\s]|$)/i);
        let optC = clean.match(/(?:^|\s)[\[\(]?(?:C|3)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:D|4)[\]\.\)\:\s]|$)/i);
        let optD = clean.match(/(?:^|\s)[\[\(]?(?:D|4)[\]\.\)\:\s]\s*([\s\S]+?)(?=\r?\n|\s+Ans|Answer|Answer:|उत्तर|Correct|$)/i);

        const ansMatch = clean.match(/(?:Ans|Answer|Correct|उत्तर|सही)[\s\:\-\.]*\s*([A-D1-4])/i);

        if (!optA) {
            const splitA = clean.match(/([\s\S]+?)(?=\s*[\[\(]?(?:A)[\]\.\)\:\s])/i);
            if (splitA) {
                const potentialRest = clean.substring(splitA[1].length);
                optA = potentialRest.match(/(?:^|\s)[\[\(]?(?:A|1)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:B|2)[\]\.\)\:\s]|$)/i);
            }
        }

        if (!optA || !optB) {
            console.log(`[V27 DEBUG] DROPPED block: ${clean.substring(0, 30)}... Reason: ${!optA ? 'No OptA' : 'No OptB'}`);
        }

        if (optA && optB) {
            const markerRegex = new RegExp(`^${markerPattern}\\s*[\\.\\)\\:\\-]\\s*`, 'i');
            const qRaw = clean.split(/(?:\s)[\[\s\(]?(?:A|1)[\]\)\.\:]/i)[0].trim();
            const qText = qRaw.replace(markerRegex, '').trim();

            if (getHumanScore(qText) < 15 || getHumanScore(optA[1]) < 5) {
                console.log(`[V27 DEBUG] SCORE FAIL? Text:"${qText.substring(0, 20)}"`);
                continue;
            }

            let correct = "A";
            if (ansMatch) {
                correct = ansMatch[1].toUpperCase();
            } else if (markerRaw && answerKey[markerRaw]) {
                correct = answerKey[markerRaw];
            }

            questions.push({ text: qText, correctOption: correct });
        }
    }
    return questions;
};

const results = blockFirstParser(text);
console.log(`Results: ${results.length}`);
results.forEach((q, i) => console.log(`[Q${i + 1}] ${q.text.substring(0, 40)}... ANS: ${q.correctOption}`));
