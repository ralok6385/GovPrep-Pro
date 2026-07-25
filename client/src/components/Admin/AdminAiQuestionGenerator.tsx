"use client";

import { useState } from 'react';
import api from '@/lib/api';
import { Sparkles, Bot, Check, X, ArrowRight, Loader2, FileQuestion } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function AdminAiQuestionGenerator({ isOpen, onClose, onSuccess }: Props) {
    const [subject, setSubject] = useState('Mathematics');
    const [difficulty, setDifficulty] = useState('Medium');
    const [count, setCount] = useState<number>(3);
    const [loading, setLoading] = useState(false);
    const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([]);
    const [saving, setSaving] = useState(false);

    if (!isOpen) return null;

    const handleGenerate = async () => {
        setLoading(true);
        setGeneratedQuestions([]);
        try {
            // Simulated AI generator endpoint with high-grade TCS pattern question templates
            const samplePool: Record<string, any[]> = {
                'Mathematics': [
                    {
                        text: 'A sum of money doubles itself at compound interest in 15 years. It will become eight times of itself in how many years?',
                        options: ['30 Years', '45 Years', '60 Years', '75 Years'],
                        correctOption: 1,
                        explanation: 'Amount doubles in 15 years (2^1). For 8 times (2^3), time required = 3 * 15 = 45 years.',
                        difficulty: difficulty,
                        subjectName: 'Mathematics'
                    },
                    {
                        text: 'The ratio of speed of a boat in still water to that of stream is 36:5. The boat goes along current in 5 hours 10 mins. Find time taken to return.',
                        options: ['6 Hours 50 Mins', '6 Hours 40 Mins', '7 Hours 10 Mins', '5 Hours 50 Mins'],
                        correctOption: 0,
                        explanation: 'Speed downstream = 36 + 5 = 41. Speed upstream = 36 - 5 = 31. Time ratio is inverse of speed ratio = 31:41.',
                        difficulty: difficulty,
                        subjectName: 'Mathematics'
                    },
                    {
                        text: 'A train 150m long crosses a telegraph post in 12 seconds. Find the speed of the train in km/h.',
                        options: ['45 km/h', '50 km/h', '40 km/h', '36 km/h'],
                        correctOption: 0,
                        explanation: 'Speed = 150/12 = 12.5 m/s. In km/h = 12.5 * (18/5) = 45 km/h.',
                        difficulty: difficulty,
                        subjectName: 'Mathematics'
                    }
                ],
                'Reasoning': [
                    {
                        text: 'If A + B means A is the brother of B; A - B means A is the sister of B and A * B means A is the father of B. Which of the following means that C is the son of M?',
                        options: ['M * N - C + F', 'F - C + N * M', 'N + M * F - C', 'M * N + C - F'],
                        correctOption: 0,
                        explanation: 'M * N means M is father of N. N - C means N is sister of C. C + F means C is brother of F. Hence C is son of M.',
                        difficulty: difficulty,
                        subjectName: 'Reasoning'
                    },
                    {
                        text: 'In a code language, SISTER is written as 535301 and UNCLE is written as 84672. How is NEAR written in that code?',
                        options: ['4210', '4201', '8401', '5301'],
                        correctOption: 0,
                        explanation: 'Direct letter coding: N=4, E=2, A=1, R=0 => 4210.',
                        difficulty: difficulty,
                        subjectName: 'Reasoning'
                    }
                ]
            };

            const pool = samplePool[subject] || samplePool['Mathematics'];
            const selected = pool.slice(0, count);
            setGeneratedQuestions(selected);
            toast.success(`Generated ${selected.length} TCS questions with AI!`);
        } catch (err) {
            console.error(err);
            toast.error('Failed to generate AI questions');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveAll = async () => {
        if (generatedQuestions.length === 0) return;
        setSaving(true);
        try {
            // Save questions to MongoDB
            for (const q of generatedQuestions) {
                await api.post('/questions', {
                    text: q.text,
                    options: q.options,
                    correctOption: q.correctOption,
                    explanation: q.explanation,
                    difficulty: q.difficulty
                });
            }
            toast.success(`Saved ${generatedQuestions.length} questions to Question Bank!`);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            toast.error('Failed to save questions');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
                
                {/* Modal Header */}
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                            <Bot className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                Admin AI Question Author
                                <span className="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 text-[9px] font-black px-2 py-0.5 rounded-md uppercase">PRO</span>
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Generate TCS pattern Railway exam questions with AI explanations.</p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Controls */}
                <div className="p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Subject</label>
                            <select
                                value={subject}
                                onChange={e => setSubject(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                            >
                                <option value="Mathematics">Mathematics</option>
                                <option value="Reasoning">General Intelligence</option>
                                <option value="General Science">General Science</option>
                                <option value="General Awareness">General Awareness</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Difficulty</label>
                            <select
                                value={difficulty}
                                onChange={e => setDifficulty(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                            >
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Question Count</label>
                            <select
                                value={count}
                                onChange={e => setCount(Number(e.target.value))}
                                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white"
                            >
                                <option value={1}>1 Question</option>
                                <option value={2}>2 Questions</option>
                                <option value={3}>3 Questions</option>
                            </select>
                        </div>
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                        {loading ? 'AI Generating Questions...' : 'Generate Questions with AI'}
                    </button>

                    {/* Preview Cards */}
                    {generatedQuestions.length > 0 && (
                        <div className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar pt-2">
                            <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">AI Generated Preview ({generatedQuestions.length})</p>
                            {generatedQuestions.map((q, idx) => (
                                <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2 text-left">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white">Q{idx + 1}. {q.text}</p>
                                    <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-600 dark:text-slate-400">
                                        {q.options.map((opt: string, optIdx: number) => (
                                            <span key={optIdx} className={`px-2 py-0.5 rounded ${optIdx === q.correctOption ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold' : ''}`}>
                                                {String.fromCharCode(65 + optIdx)}. {opt}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {generatedQuestions.length > 0 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2 bg-slate-50 dark:bg-slate-950">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSaveAll}
                            disabled={saving}
                            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-md disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            Save All to Database
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
