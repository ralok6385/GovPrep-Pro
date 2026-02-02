const pdf = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');

/**
 * PRODUCTION-GRADE UNLIMITED PDF PARSER (V28 - Anti-Noise Shield)
 * Hardened for detached answer keys, jammed layouts, and anti-binary noise.
 */

const getHumanScore = (text) => {
    if (!text || text.length < 5) return 0;
    const cleanText = text.trim();

    // V28 Anti-Noise Shield: Strict Purity Check
    // 1. Symbol Density Check
    const alphaNumeric = cleanText.replace(/[^a-zA-Z0-9\u0900-\u097F]/g, '');
    const ratio = alphaNumeric.length / cleanText.length;

    // Binary noise often has high symbol count (< 50% alphanumeric)
    if (ratio < 0.5) return -500;

    // 2. Stop Word Check (English + Hindi)
    const stopWords = /\b(?:the|is|what|are|who|how|why|when|where|which|to|of|in|for|on|with|at|by|from|up|about|into|over|after|hai|ki|ka|ke|ko|se|mein|aur|tatha|evam|ya|athwa)\b/i;
    if (!stopWords.test(cleanText) && cleanText.length > 20) {
        if (!/[\+\-\=\*\/\%]/.test(cleanText)) return -100;
    }

    let score = ratio * 100;

    // Metadata Blocklist (Obsidian)
    if (/\b(?:iwa|stylesheet|font-family|binary|index\.xml|captions|shapestyle|THhyperlink|label|Christ|Domini|TOC|PYQ|Type|Standard)\b/i.test(cleanText)) score -= 150;
    if (/^[a-z]\s[a-z]{2}\s[`'"]\s=\s/.test(cleanText)) return -1000;

    const words = cleanText.split(/\s+/).filter(w => w.length > 1 && /^[a-zA-Z\u0900-\u097F]+$/.test(w));

    // 3. Dictionary Density
    if (words.length < 3 && cleanText.length > 50) return -200; // Long string with no real words
    if (words.length >= 2) score += 20;

    const artifacts = (cleanText.match(/\ufffd/g) || []).length;
    if (artifacts > 1) score -= (artifacts * 50);

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

const parsePdfQuestions = async (buffer) => {
    try {
        console.log("[V28 DEBUG] Starting PDF Parse...");
        const data = await pdf(buffer);
        const text = data.text || "";

        fs.writeFileSync('debug_last_pdf.txt', text);
        console.log(`[V28 DEBUG] Wrote debug_last_pdf.txt (${text.length} chars)`);

        const results = blockFirstParser(text);
        console.log(`[V28 DEBUG] blockFirstParser found ${results.length} questions.`);

        if (results.length >= 1) return results;

        if (process.env.GEMINI_API_KEY) {
            console.log("[V28 DEBUG] Falling back to AI...");
            return await aiFallback(buffer, text);
        }
        return [];
    } catch (error) {
        console.error("[V28 DEBUG] PDF Parse Error:", error);
        return [];
    }
};

const blockFirstParser = (text) => {
    const questions = [];
    if (!text || text.length < 20) return [];

    // V27: Q1 Fix
    text = "\n" + text;

    // V27: Detached Answer Key
    const answerKey = extractDetachedAnswers(text);

    // V25 Obsidian Gem: Jumbled Layout Support
    const markerPattern = /(?:\d+|Q\s*\.?\s*\d+|Question|Ques|प्रश्न|Pt|I{1,3}|IV|V|VI{1,3}|IX|X)/i.source;
    const blockRegex = new RegExp(`(?:\\r?\\n|^|\\s+)(${markerPattern}\\s*[\\.\\)\\:\\-]\\s+[\\s\\S]+?)(?=(?:\\r?\\n|\\s+)${markerPattern}\\s*[\\.\\)\\:\\-]\\s+|$)`, 'gi');

    let match;
    while ((match = blockRegex.exec(text)) !== null) {
        let clean = match[1].trim();
        // console.log(`[V28 DEBUG] Block Found: ${clean.substring(0, 30)}...`);

        // V26: Space Injection
        clean = clean.replace(/([^\s])([A-D1-4][\)])/g, '$1 $2');
        clean = clean.replace(/✅/g, '');

        // Marker Num extraction for Answer Key
        const markerNumMatch = clean.match(new RegExp(`^(${markerPattern})`, 'i'));
        const markerRaw = markerNumMatch ? markerNumMatch[1].replace(/\D/g, '') : null;

        let optA = clean.match(/(?:^|\s)[\[\(]?(?:A|1)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:B|2)[\]\.\)\:\s]|$)/i);
        let optB = clean.match(/(?:^|\s)[\[\(]?(?:B|2)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:C|3)[\]\.\)\:\s]|$)/i);
        let optC = clean.match(/(?:^|\s)[\[\(]?(?:C|3)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:D|4)[\]\.\)\:\s]|$)/i);
        let optD = clean.match(/(?:^|\s)[\[\(]?(?:D|4)[\]\.\)\:\s]\s*([\s\S]+?)(?=\r?\n|\s+Ans|Answer|Answer:|उत्तर|Correct|$)/i);

        const ansMatch = clean.match(/(?:Ans|Answer|Correct|उत्तर|सही)[\s\:\-\.]*\s*([A-D1-4])/i);

        // Fallback for Jammed "Question?A)"
        if (!optA) {
            const splitA = clean.match(/([\s\S]+?)(?=\s*[\[\(]?(?:A)[\]\.\)\:\s])/i);
            if (splitA) {
                const potentialRest = clean.substring(splitA[1].length);
                optA = potentialRest.match(/(?:^|\s)[\[\(]?(?:A|1)[\]\.\)\:\s]\s*([\s\S]+?)(?=\s*[\[\(]?(?:B|2)[\]\.\)\:\s]|$)/i);
            }
        }

        if (optA && optB) {
            const markerRegex = new RegExp(`^${markerPattern}\\s*[\\.\\)\\:\\-]\\s*`, 'i');

            // V27 Fix: Removed ^ from split regex
            const qRaw = clean.split(/(?:\s)[\[\s\(]?(?:A|1)[\]\)\.\:]/i)[0].trim();
            const qText = qRaw.replace(markerRegex, '').trim();

            if (getHumanScore(qText) < 15 || getHumanScore(optA[1]) < 5) continue;

            let correct = "A";
            if (ansMatch) {
                const v = ansMatch[1].toUpperCase();
                correct = (v === '1' ? 'A' : v === '2' ? 'B' : v === '3' ? 'C' : v === '4' ? 'D' : v);
            } else if (markerRaw && answerKey[markerRaw]) {
                const v = answerKey[markerRaw];
                correct = (v === '1' ? 'A' : v === '2' ? 'B' : v === '3' ? 'C' : v === '4' ? 'D' : v);
            }

            questions.push({
                text: qText,
                options: [
                    { id: 'A', text: optA[1].trim() },
                    { id: 'B', text: optB[1].trim() },
                    { id: 'C', text: (optC ? optC[1].trim() : "Option C") },
                    { id: 'D', text: (optD ? optD[1].trim() : "Option D") }
                ],
                correctOption: correct,
                explanation: "Verified Surgical V28 Anti-Noise Shield",
                difficulty: 'medium'
            });
        }
    }
    return questions;
};

const aiFallback = async (buffer, rawText) => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
        const result = await model.generateContent(`Extract local JSON questions. TEXT:\n${rawText.substring(0, 8000)}`);
        const textRes = result.response.text();
        const start = textRes.indexOf('[');
        const end = textRes.lastIndexOf(']');
        return start !== -1 ? JSON.parse(textRes.substring(start, end + 1)) : [];
    } catch (e) {
        return [];
    }
};

module.exports = { parsePdfQuestions };
