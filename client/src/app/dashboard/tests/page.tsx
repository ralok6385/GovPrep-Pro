
"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, CheckCircle2, Star, ArrowRight, Trophy, Zap, Copy, Sparkles, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import EmptyState from '@/components/Common/EmptyState';

export default function TestsPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const searchParams = useSearchParams();
    const filterType = searchParams.get('type'); // 'exam' or 'quiz'
    const filterCategory = searchParams.get('category'); // 'ntpc', 'groupd', etc.

    useEffect(() => {
        fetchTests();
    }, []);

    const fetchTests = async () => {
        try {
            // In a real app, this would be /api/tests/available or similar
            // Using existing endpoint for now
            const { data } = await api.get('/tests');
            setTests(data);
        } catch (error) {
            console.error('Failed to load tests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStartLiveTest = () => {
        if (tests.length > 0) {
            // Locate a "Mock" test if possible, otherwise first one
            const mockTest = tests.find(t => t.title.toLowerCase().includes('mock')) || tests[0];
            router.push(`/dashboard/tests/${mockTest._id}`);
        } else {
            toast.error('No live test currently active.');
        }
    };

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/dashboard');
        }
    };

    const showExams = !filterType || filterType === 'exam';
    const showQuizzes = !filterType || filterType === 'quiz';

    const getPageTitle = () => {
        if (filterCategory) {
            const categoryMap: any = {
                'rrb-ntpc': 'RRB NTPC',
                'rrb-group-d': 'RRB Group D',
                'rrb-alp': 'RRB ALP',
                'rrb-je': 'RRB JE'
            };
            return `${categoryMap[filterCategory] || 'Target Exam'} Prep`;
        }
        if (filterType === 'exam') return "Full Mock Exams";
        if (filterType === 'quiz') return "Daily Speed Quizzes";
        return "All Tests & Quizzes";
    }

    const getPageDesc = () => {
        if (filterCategory) return `Focused preparation for ${filterCategory.toUpperCase()} exam.`;
        if (filterType === 'exam') return "Simulate real exam conditions with full-length papers per latest pattern.";
        if (filterType === 'quiz') return "Quick fire questions to boost accuracy and speed while on the go.";
        return "Practice with mocks and quizzes to ace your preparation.";
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20 dark:bg-slate-950">
            {/* Header with Pattern */}
            <header className="relative bg-indigo-900 text-white sticky top-0 z-40 overflow-hidden shadow-xl shadow-indigo-900/20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-900 opacity-90"></div>
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

                <div className="relative max-w-2xl mx-auto px-5 py-6 flex flex-col items-center text-center">
                    <button
                        onClick={handleBack}
                        className="absolute left-5 top-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm group"
                        aria-label="Go back"
                    >
                        <ArrowRight className="w-5 h-5 text-white rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl mb-3 shadow-inner border border-white/20">
                        {filterType === 'quiz' ? <Zap className="w-8 h-8 text-yellow-300 fill-yellow-300" /> : <Trophy className="w-8 h-8 text-yellow-300 fill-yellow-300" />}
                    </div>
                    <h1 className="font-bold text-2xl md:text-3xl mb-1 tracking-tight">
                        {getPageTitle()}
                    </h1>
                    <p className="text-sm text-indigo-100 max-w-sm font-medium opacity-90">
                        {getPageDesc()}
                    </p>
                </div>
            </header>

            <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
                {/* Featured Test Card - Show only if filter is empty or exam */}
                {showExams && (
                    <div className="relative group">
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-red-600 to-amber-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
                        <div className="relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-xl border border-slate-100 dark:border-slate-800">

                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 uppercase tracking-wider mb-2 border border-amber-100 dark:border-amber-900/50">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        Live Now
                                    </span>
                                    <h2 className="font-bold text-xl text-slate-900 dark:text-white mb-1">Weekly All India Mock</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">RRB NTPC • Based on Latest Pattern</p>
                                </div>
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 p-2.5 rounded-xl">
                                    <Trophy className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 mb-6">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{tests.find(t => t.title.toLowerCase().includes('mock'))?.durationMinutes || tests[0]?.durationMinutes || 90} Mins</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{tests.find(t => t.title.toLowerCase().includes('mock'))?.questionsCount || tests[0]?.questionsCount || 0} Qns</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">+1 / -0.33</span>
                                </div>
                            </div>

                            <button
                                onClick={handleStartLiveTest}
                                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98] flex items-center justify-center gap-2 group/btn"
                            >
                                Start Live Test
                                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* SECTION 1: Full Mock Exams */}
                    {showExams && (
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2 px-1">
                                <Trophy className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Full Length Mocks
                            </h3>

                            {loading ? (
                                <div className="space-y-3">
                                    {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                                </div>
                            ) : tests.filter(t =>
                                (t.type === 'exam' || !t.type) &&
                                (!filterCategory ||
                                    (t.examId?.slug && t.examId.slug.includes(filterCategory)) ||
                                    t.title.toLowerCase().includes(filterCategory.toLowerCase()))
                            ).length === 0 ? (
                                <EmptyState
                                    title={`No ${filterCategory ? filterCategory.toUpperCase() : ''} mocks available today`}
                                    description="Don't stop your preparation! Revise study material to stay consistent and improve your rank in the next mock."
                                    icon={Trophy}
                                />
                            ) : (
                                <div className="space-y-4">
                                    {tests.filter(t =>
                                        (t.type === 'exam' || !t.type) &&
                                        (!filterCategory ||
                                            (t.examId?.slug && t.examId.slug.includes(filterCategory)) ||
                                            t.title.toLowerCase().includes(filterCategory.toLowerCase()))
                                    ).map((test, idx) => (
                                        <Link key={test._id} href={`/dashboard/tests/${test._id}`} className="block group">
                                            <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:border-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-0.5 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-[3rem] transition-transform group-hover:scale-125"></div>

                                                <div className="flex justify-between items-center relative z-10">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-sm">
                                                                {idx + 1}
                                                            </div>
                                                            <span className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide border border-indigo-100 dark:border-indigo-800">
                                                                Exam
                                                            </span>
                                                        </div>
                                                        <h4 className="font-bold text-slate-800 dark:text-white text-lg mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                                            {test.title}
                                                        </h4>
                                                        <div className="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {test.questionsCount || 0} Questions
                                                            </span>
                                                            <span className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                                                <Clock className="w-3.5 h-3.5 text-amber-500" /> {test.durationMinutes || 90} Minutes
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="pl-4">
                                                        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all shadow-sm">
                                                            <ArrowRight className="w-5 h-5" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECTION 2: Speed Quizzes */}
                    {showQuizzes && (
                        <div>
                            <h3 className="font-bold text-slate-800 dark:text-white text-lg mb-4 flex items-center gap-2 px-1">
                                <Zap className="w-5 h-5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
                                Speed Quizzes
                            </h3>

                            {loading ? (
                                <div className="grid grid-cols-2 gap-3">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                                </div>
                            ) : tests.filter(t =>
                                (t.type === 'quiz') &&
                                (!filterCategory ||
                                    (t.examId?.slug && t.examId.slug.includes(filterCategory)) ||
                                    t.title.toLowerCase().includes(filterCategory.toLowerCase()))
                            ).length === 0 ? (
                                <EmptyState
                                    title={`No speed quizzes found for ${filterCategory ? filterCategory.toUpperCase() : 'this category'}`}
                                    description="Speed is the key to selection! Practice with full mocks if quizzes are unavailable, or revise your weak areas now."
                                    icon={Zap}
                                />
                            ) : (
                                <div className="grid grid-cols-2 gap-3">
                                    {tests.filter(t =>
                                        (t.type === 'quiz') &&
                                        (!filterCategory ||
                                            (t.examId?.slug && t.examId.slug.includes(filterCategory)) ||
                                            t.title.toLowerCase().includes(filterCategory.toLowerCase()))
                                    ).map((test) => (
                                        <Link key={test._id} href={`/dashboard/tests/${test._id}`} className="block group h-full">
                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-full transition-all hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-bl-[2rem] transition-transform group-hover:scale-125"></div>

                                                <div className="relative z-10">
                                                    <span className="inline-block bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide mb-2 border border-emerald-100 dark:border-emerald-800">
                                                        Daily Quiz
                                                    </span>
                                                    <h4 className="font-bold text-slate-800 dark:text-white text-sm leading-tight mb-3 line-clamp-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                                                        {test.title}
                                                    </h4>
                                                </div>

                                                <div className="flex items-end justify-between relative z-10">
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium space-y-1">
                                                        <p className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {test.questionsCount || 0} Qs</p>
                                                        <p className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.durationMinutes} Min</p>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                        <ArrowRight className="w-4 h-4" />
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
