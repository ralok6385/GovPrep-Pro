"use client";

import { useEffect, useState, useRef } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { Timer, LayoutGrid, CheckCircle2, ChevronRight, ChevronLeft, Flag } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '@/context/AuthContext';

interface Question {
    _id: string;
    text: string;
    options: { id: string; text: string }[];
}

interface TestData {
    _id: string;
    title: string;
    durationMinutes: number;
    questions: Question[];
}

interface ResponseState {
    questionId: string;
    selectedOption: string | null;
    timeTakenSeconds: number;
    visited: boolean;
    marked: boolean;
}

// Helper to format seconds
const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

export default function TestPage({ params }: { params: { id: string } }) {
    const [test, setTest] = useState<TestData | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [responses, setResponses] = useState<ResponseState[]>([]);
    const [timeLeft, setTimeLeft] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const router = useRouter();
    const startTimeRef = useRef<number>(Date.now());
    const { user } = useAuth();

    // Load Test
    useEffect(() => {
        // Basic unwrap params if needed in Next 13/14, but standard props usually work
        // In Next 15 params promise might be strict, assuming Next 14 standard behavior
        const testId = params.id;

        const fetchTest = async () => {
            try {
                const { data } = await api.get(`/tests/${testId}/start`);
                setTest(data);
                setTimeLeft(data.durationMinutes * 60);

                // Init responses
                const initResponses = data.questions.map((q: Question) => ({
                    questionId: q._id,
                    selectedOption: null,
                    timeTakenSeconds: 0,
                    visited: false,
                    marked: false,
                }));
                // Mark first as visited
                initResponses[0].visited = true;
                setResponses(initResponses);
            } catch (error) {
                toast.error('Failed to start test');
                router.push('/tests');
            } finally {
                setLoading(false);
            }
        };
        fetchTest();

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [params.id, router]);

    // Timer Logic
    useEffect(() => {
        if (loading || !test) return;

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });

            // Update time taken for current question
            setResponses(prev => {
                const newResp = [...prev];
                if (newResp[currentQIndex]) {
                    newResp[currentQIndex].timeTakenSeconds += 1;
                }
                return newResp;
            });
        }, 1000);

        return () => clearInterval(timerRef.current!);
    }, [loading, test, currentQIndex]);

    const handleOptionSelect = (optId: string) => {
        setResponses(prev => {
            const newResp = [...prev];
            newResp[currentQIndex].selectedOption = optId;
            return newResp;
        });
    };

    const handleNext = () => {
        if (currentQIndex < (test?.questions.length || 0) - 1) {
            setCurrentQIndex(prev => {
                const next = prev + 1;
                // Mark next as visited
                setResponses(r => {
                    const nr = [...r];
                    nr[next].visited = true;
                    return nr;
                });
                return next;
            });
        }
    };

    const handlePrev = () => {
        if (currentQIndex > 0) {
            setCurrentQIndex(prev => prev - 1);
        }
    };

    const toggleMark = () => {
        setResponses(prev => {
            const newResp = [...prev];
            newResp[currentQIndex].marked = !newResp[currentQIndex].marked;
            return newResp;
        });
    };

    const handleSubmit = async () => {
        if (!test) return;
        if (timerRef.current) clearInterval(timerRef.current);

        const toastId = toast.loading('Submitting test...');
        try {
            const payload = {
                responses: responses.map(r => ({
                    questionId: r.questionId,
                    selectedOption: r.selectedOption,
                    timeTakenSeconds: r.timeTakenSeconds
                }))
            };

            const { data } = await api.post(`/tests/${test._id}/submit`, payload);
            toast.dismiss(toastId);
            toast.success('Test Submitted!');
            router.push(`/tests/result/${data._id}`);
        } catch (error) {
            toast.dismiss(toastId);
            toast.error('Submission failed. Try again.');
            // Restart timer if failed? ensuring user doesn't lose progress.
        }
    };

    if (loading || !test) return <div className="flex justify-center items-center h-screen bg-slate-900 text-white">Loading Test Environment...</div>;

    const currentQ = test.questions[currentQIndex];
    const currentResp = responses[currentQIndex];

    return (
        <div className="flex flex-col h-screen bg-slate-900 text-white overflow-hidden">
            {/* Header */}
            <header className="flex justify-between items-center px-6 py-3 bg-slate-800 border-b border-slate-700">
                <h1 className="font-bold text-lg truncate max-w-md">{test.title}</h1>
                <div className="flex items-center gap-6">
                    <div className={clsx("flex items-center gap-2 font-mono text-xl font-bold bg-slate-900 px-4 py-1.5 rounded-lg border",
                        timeLeft < 300 ? "text-red-500 border-red-500/50 blink" : "text-emerald-400 border-emerald-500/30"
                    )}>
                        <Timer className="w-5 h-5" />
                        {formatTime(timeLeft)}
                    </div>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-semibold transition-colors"
                    >
                        Submit Test
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Question Area */}
                <div className="flex-1 p-6 md:p-10 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-gray-400 font-medium">Question {currentQIndex + 1} of {test.questions.length}</span>
                            <div className="flex gap-2 text-sm text-gray-500">
                                <span>+2.0 Marks</span>
                                <span>-0.5 Negative</span>
                            </div>
                        </div>

                        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 mb-8 min-h-[200px]">
                            <div className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: currentQ.text }} />
                        </div>

                        <div className="grid gap-4">
                            {currentQ.options.map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleOptionSelect(opt.id)}
                                    className={clsx(
                                        "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all group",
                                        currentResp?.selectedOption === opt.id
                                            ? "border-indigo-500 bg-indigo-500/10"
                                            : "border-slate-700 hover:border-slate-600 bg-slate-800"
                                    )}
                                >
                                    <div className={clsx(
                                        "w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors",
                                        currentResp?.selectedOption === opt.id
                                            ? "bg-indigo-500 border-indigo-500 text-white"
                                            : "border-gray-500 text-gray-500 group-hover:border-gray-400"
                                    )}>
                                        {opt.id}
                                    </div>
                                    <span className="text-lg">{opt.text}</span>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-between items-center mt-10 border-t border-slate-800 pt-6">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => toggleMark()}
                                    className={clsx("flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
                                        currentResp?.marked ? "bg-amber-900/50 text-amber-400" : "text-gray-400 hover:bg-slate-800"
                                    )}
                                >
                                    <Flag className="w-4 h-4" /> {currentResp?.marked ? 'Unmark' : 'Mark for Review'}
                                </button>
                                <button
                                    onClick={() => {
                                        setResponses(prev => {
                                            const n = [...prev];
                                            n[currentQIndex].selectedOption = null;
                                            return n;
                                        })
                                    }}
                                    className="text-gray-400 hover:text-white px-4 py-2 font-medium"
                                >
                                    Clear Response
                                </button>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={handlePrev}
                                    disabled={currentQIndex === 0}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" /> Previous
                                </button>
                                <button
                                    onClick={handleNext}
                                    disabled={currentQIndex === test.questions.length - 1}
                                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold transition-transform active:scale-95 disabled:opacity-50 disabled:bg-slate-700"
                                >
                                    Save & Next <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Palette */}
                <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col hidden lg:flex">
                    <div className="p-6 border-b border-slate-700">
                        <h3 className="font-bold flex items-center gap-2"><LayoutGrid className="w-5 h-5" /> Question Palette</h3>
                        <div className="grid grid-cols-2 gap-3 mt-4 text-xs text-gray-400">
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Answered</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"></div> Not Answered</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-amber-500"></div> Marked</div>
                            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-slate-600"></div> Not Visited</div>
                        </div>
                    </div>

                    <div className="p-6 flex-1 overflow-y-auto">
                        <div className="grid grid-cols-5 gap-3">
                            {responses.map((r, idx) => {
                                let colorClass = "bg-slate-600/50 text-gray-400 hover:bg-slate-600"; // Not visited default-ish
                                if (r.marked) colorClass = "bg-amber-500 text-white shadow-lg shadow-amber-500/20";
                                else if (r.selectedOption) colorClass = "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20";
                                else if (r.visited && !r.selectedOption) colorClass = "bg-red-500/80 text-white"; // Visited but no answer
                                else if (r.visited) colorClass = "bg-slate-600 text-white";

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentQIndex(idx)}
                                        className={clsx(
                                            "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-all transform hover:scale-105",
                                            colorClass,
                                            currentQIndex === idx && "ring-2 ring-white scale-110 z-10"
                                        )}
                                    >
                                        {idx + 1}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
