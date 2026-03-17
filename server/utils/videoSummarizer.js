const path = require('path');
const Groq = require('groq-sdk');
const Content = require('../models/Content');

// youtube-transcript v1.3.0 is ESM-only; import the .esm.js file directly for CJS compat
let _ytModule;
async function getYoutubeTranscript() {
    if (!_ytModule) {
        const esmPath = path.join(__dirname, '..', 'node_modules', 'youtube-transcript', 'dist', 'youtube-transcript.esm.js');
        _ytModule = await import(esmPath);
    }
    return _ytModule.YoutubeTranscript;
}

// Lazy-init: Groq SDK throws if key is missing at require time
let groq;
function getGroqClient() {
    if (!groq) {
        groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    }
    return groq;
}

// Using Groq for blazingly fast summaries
async function generateAISummary(transcriptText) {
    try {
        const response = await getGroqClient().chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: "You are an expert educational assistant. Your task is to summarize the following lecture transcript. Provide a highly structured and beautifully formatted Markdown summary with clear headings, bullet points for key concepts, and a brief conclusion. Make it engaging for students."
                },
                {
                    role: "user",
                    content: `Please summarize this transcript:\n\n${transcriptText}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.5,
            max_tokens: 3000,
        });

        return response.choices[0]?.message?.content || "Summary could not be generated.";
    } catch (error) {
        console.error("[generateAISummary] Groq Error:", error);
        throw error; // Let the caller handle fallback if needed
    }
}

async function processVideoSummary(contentId, videoUrl) {
    try {
        // 1. Mark as processing
        await Content.findByIdAndUpdate(contentId, { processingStatus: 'processing' });
        
        // 2. Extract Transcript
        console.log(`[VideoSummarizer] Fetching transcript for ${videoUrl}`);
        const YoutubeTranscript = await getYoutubeTranscript();
        const transcriptRaw = await YoutubeTranscript.fetchTranscript(videoUrl);
        
        if (!transcriptRaw || transcriptRaw.length === 0) {
            throw new Error("No transcript available for this video.");
        }

        // Combine transcript pieces into full text
        const fullTranscript = transcriptRaw.map((t) => t.text).join(' ');
        
        // Use max 15,000 chars for Groq to be safe with limits
        const truncatedTranscript = fullTranscript.slice(0, 15000);

        // 3. Generate Summary with AI
        console.log(`[VideoSummarizer] Generating AI summary for ${contentId}...`);
        const summary = await generateAISummary(truncatedTranscript);

        // 4. Update Database
        await Content.findByIdAndUpdate(contentId, {
            summary: summary,
            processingStatus: 'completed'
        });
        
        console.log(`[VideoSummarizer] Successfully completed for ${contentId}`);

    } catch (error) {
        console.error(`[VideoSummarizer] Failed for ${contentId}:`, error.message);
        
        // Mark as failed if anything went wrong
        await Content.findByIdAndUpdate(contentId, {
            processingStatus: 'failed',
            summary: `Failed to generate summary: ${error.message}`
        });
    }
}

module.exports = {
    processVideoSummary
};
