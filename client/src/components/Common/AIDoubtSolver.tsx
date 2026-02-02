import { useState } from 'react';
import api from '@/lib/api';
import { Sparkles, X, MessageCircle, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIDoubtSolverProps {
    questionText: string;
    options: any[];
    correctOption: string;
    userSelectedOption?: string;
    questionId: string;
}

export default function AIDoubtSolver({ questionText, options, correctOption, userSelectedOption, questionId }: AIDoubtSolverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [explanation, setExplanation] = useState('');
    const [error, setError] = useState('');

    const handleAskAI = async () => {
        setIsOpen(true);
        if (explanation) return; // Don't re-fetch if already fetched

        setLoading(true);
        setError('');

        try {
            const { data } = await api.post('/ai/explain', {
                questionText,
                options,
                correctOption,
                userSelectedOption
            });
            setExplanation(data.explanation);
        } catch (err: any) {
            const message = err.response?.data?.message || 'Failed to get explanation.';
            const method = err.response?.data?.error || '';
            setError(`${message} ${method ? `(${method})` : ''}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={handleAskAI}
                className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 font-black text-white transition-all duration-200 bg-indigo-600 rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/30 overflow-hidden"
            >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></span>
                <Sparkles className="w-5 h-5 animate-pulse" />
                <span>Ask AI Tutor</span>
            </button>
        );
    }

    return (
        <div className="mt-6 rounded-3xl border-2 border-indigo-100 bg-indigo-50/50 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-100/50 border-b border-indigo-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-black text-indigo-900 text-sm uppercase tracking-wider">AI Doubt Solver</h4>
                        <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Powered by Google Gemini</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-indigo-200 rounded-full text-indigo-400 hover:text-indigo-700 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="p-6 min-h-[100px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-4 text-indigo-600">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-xs font-black uppercase tracking-widest animate-pulse">Analyzing Question...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-4">
                        <p className="text-rose-500 font-bold text-sm mb-3">{error}</p>
                        <button
                            onClick={() => { setExplanation(''); handleAskAI(); }}
                            className="text-xs font-black uppercase text-indigo-600 hover:underline"
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed">
                        <div className="flex gap-4">
                            <div className="shrink-0 mt-1">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                                    <MessageCircle className="w-4 h-4" />
                                </div>
                            </div>
                            <div className="bg-white p-6 rounded-2xl rounded-tl-none shadow-sm border border-indigo-100/50 w-full">
                                <ReactMarkdown>{explanation}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
