"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Clock, Target, TrendingUp, ArrowRight, Trophy, Zap, FileText, Calendar, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface TestResultItem {
    _id: string;
    testId: {
        _id: string;
        title: string;
        type: string;
        totalMarks: number;
    };
    score: number;
    accuracy: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    timeTaken?: number;
    createdAt: string;
}

export default function TestHistoryPage() {
    const [results, setResults] = useState<TestResultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'exam' | 'quiz'>('all');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const { data } = await api.get('/tests/results/me');
            setResults(data);
        } catch (error) {
            console.error('Failed to load test history', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredResults = results.filter(r => {
        if (filter === 'all') return true;
        return r.testId?.type === filter;
    });

    const avgAccuracy = results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + (r.accuracy || 0), 0) / results.length)
        : 0;

    const bestScore = results.length > 0
        ? Math.max(...results.map(r => r.score || 0))
        : 0;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white px-6 py-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <FileText className="w-5 h-5 text-indigo-200" />
                        <span className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Performance Log</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Test History</h1>
                    <p className="text-indigo-100 text-sm font-medium opacity-80">
                        Track your journey — every test attempted, every score earned.
                    </p>

                    {/* Quick Stats */}
                    {results.length > 0 && (
                        <div className="flex gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-2xl font-black">{results.length}</p>
                                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Tests</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-2xl font-black">{avgAccuracy}%</p>
                                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Avg Accuracy</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-2xl font-black">{bestScore}</p>
                                <p className="text-[10px] text-indigo-200 font-bold uppercase tracking-widest">Best Score</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Filter Tabs */}
                <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm w-fit">
                    {(['all', 'exam', 'quiz'] as const).map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                }`}
                        >
                            {f === 'all' ? 'All' : f === 'exam' ? 'Mock Exams' : 'Quizzes'}
                        </button>
                    ))}
                </div>

                {/* Results List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-24 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800"></div>
                        ))}
                    </div>
                ) : filteredResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                            <FileText className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {filter !== 'all' ? `No ${filter === 'exam' ? 'mock exam' : 'quiz'} attempts yet` : 'No test history yet'}
                        </h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
                            Start taking tests to build your performance history and track your progress.
                        </p>
                        <Link href="/dashboard/tests" className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-colors">
                            Take Your First Test
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredResults.map((result) => {
                            const accuracy = Math.round(result.accuracy || 0);
                            const isExam = result.testId?.type === 'exam' || !result.testId?.type;

                            return (
                                <Link
                                    key={result._id}
                                    href={`/dashboard/analysis/${result._id}`}
                                    className="block group"
                                >
                                    <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-lg hover:border-indigo-200 dark:hover:border-indigo-800 hover:-translate-y-0.5 transition-all relative overflow-hidden">
                                        {/* Decorative corner */}
                                        <div className={`absolute top-0 right-0 w-12 h-12 rounded-bl-[2rem] transition-transform group-hover:scale-125 ${isExam ? 'bg-indigo-50 dark:bg-indigo-900/10' : 'bg-emerald-50 dark:bg-emerald-900/10'}`}></div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${isExam
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-100 dark:border-indigo-800'
                                                            : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-800'
                                                        }`}>
                                                        {isExam ? 'Exam' : 'Quiz'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {result.createdAt ? formatDistanceToNow(new Date(result.createdAt), { addSuffix: true }) : 'Recently'}
                                                    </span>
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-white text-base truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2">
                                                    {result.testId?.title || 'Untitled Test'}
                                                </h4>
                                                <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                                        {result.score} marks
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Target className="w-3.5 h-3.5 text-emerald-500" />
                                                        {accuracy}% accuracy
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                                                        {result.correctAnswers || 0}/{result.totalQuestions || 0} correct
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="pl-4 shrink-0">
                                                {/* Accuracy Ring */}
                                                <div className="relative w-14 h-14">
                                                    <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
                                                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                                                        <circle cx="28" cy="28" r="24" fill="none" stroke="currentColor" strokeWidth="4"
                                                            className={accuracy >= 70 ? 'text-emerald-500' : accuracy >= 40 ? 'text-amber-500' : 'text-rose-500'}
                                                            strokeDasharray={`${(accuracy / 100) * 150.8} 150.8`}
                                                            strokeLinecap="round"
                                                        />
                                                    </svg>
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-black text-slate-700 dark:text-white">
                                                        {accuracy}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
