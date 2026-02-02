"use client";

import { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';

interface AIModalProps {
    isOpen: boolean;
    onClose: () => void;
    subjectId: string;
    onQuestionsGenerated: (questions: any[]) => void;
}

export default function AIModal({ isOpen, onClose, subjectId, onQuestionsGenerated }: AIModalProps) {
    const [topic, setTopic] = useState('');
    const [count, setCount] = useState(5);
    const [difficulty, setDifficulty] = useState('medium');
    const [instructions, setInstructions] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        if (!topic) return toast.error('Please enter a topic');

        setLoading(true);
        try {
            const res = await api.post('/ai/generate', {
                topic,
                subjectId,
                count,
                difficulty,
                instructions // Send custom instructions
            });

            if (res.data && Array.isArray(res.data)) {
                onQuestionsGenerated(res.data);
                toast.success(`Generated ${res.data.length} questions!`);
                onClose();
            } else {
                toast.error('Failed to generate valid questions');
            }
        } catch (error) {
            toast.error('AI Generation Failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
                {/* Decorative Gradient */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-indigo-500 sticky z-10"></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-20 bg-slate-900/50 rounded-full p-1"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">AI Question Generator</h3>
                            <p className="text-xs text-slate-400">Powered by Google Gemini / OpenAI</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Topic / Concept</label>
                            <input
                                type="text"
                                autoFocus
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600"
                                placeholder="e.g. Mughal Empire, Thermodynamics..."
                                value={topic}
                                onChange={e => setTopic(e.target.value)}
                            />
                        </div>

                        {/* Custom Instructions */}
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                                Custom Instructions <span className="text-slate-600 font-normal">(Optional)</span>
                            </label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none placeholder:text-slate-600 text-sm resize-y min-h-[80px]"
                                placeholder="e.g. Focus on dates, make options tricky, include 2 statement questions..."
                                rows={2}
                                value={instructions}
                                onChange={e => setInstructions(e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Count</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                                    value={count}
                                    onChange={e => setCount(Number(e.target.value))}
                                >
                                    <option value={5}>5 Questions</option>
                                    <option value={10}>10 Questions</option>
                                    <option value={15}>15 Questions</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Difficulty</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-purple-500 outline-none appearance-none"
                                    value={difficulty}
                                    onChange={e => setDifficulty(e.target.value)}
                                >
                                    <option value="easy">Easy</option>
                                    <option value="medium">Medium</option>
                                    <option value="hard">Hard</option>
                                </select>
                            </div>
                        </div>

                        <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-3 flex gap-3 items-start">
                            <BookOpen className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-purple-200/80">
                                This will generate unique questions based on your topic. Please review them before publishing.
                            </p>
                        </div>

                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg transition-all hover:shadow-purple-500/25 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Generating Magic...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-5 h-5" />
                                    Generate Questions
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
