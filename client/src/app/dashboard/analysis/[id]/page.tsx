
"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Zap, FileText, TrendingUp, RotateCcw, Home, CheckCircle, AlertCircle, AlertOctagon, Target, Clock, BookOpen, ChevronLeft, ChevronRight, Users, Crown, Medal } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import AIDoubtSolver from '@/components/Common/AIDoubtSolver';

export default function AnalysisPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [viewSolutions, setViewSolutions] = useState(false);
    const [currentSolutionIndex, setCurrentSolutionIndex] = useState(0);
    const [mounted, setMounted] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const [solutionFilter, setSolutionFilter] = useState<'all' | 'correct' | 'wrong' | 'unattempted'>('all');
    const [comparison, setComparison] = useState<any>(null);
    const [compLoading, setCompLoading] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const fetchResult = async () => {
            try {
                const { data } = await api.get(`/tests/results/${params.id}`);
                setResult(data);
                // Also fetch topper comparison
                if (data.testId?._id || data.testId) {
                    const testIdStr = typeof data.testId === 'object' ? data.testId._id : data.testId;
                    setCompLoading(true);
                    try {
                        const { data: compData } = await api.get(`/analytics/test-comparison/${testIdStr}`);
                        setComparison(compData);
                    } catch (compErr) {
                        console.warn('Comparison data not available:', compErr);
                    } finally {
                        setCompLoading(false);
                    }
                }
            } catch (err) {
                const savedResult = localStorage.getItem(`test_result_${params.id}`);
                if (savedResult) {
                    setResult(JSON.parse(savedResult));
                } else {
                    setError('Result not found.');
                }
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchResult();
        }
    }, [params.id]);

    const handleBack = () => {
        if (viewSolutions) {
            setViewSolutions(false);
            return;
        }
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
    };

    if (!mounted) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="text-center antialiased">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Loading Analysis...</p>
            </div>
        </div>
    );

    if (error || !result) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
                <AlertOctagon className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-slate-800 mb-2">Error Loading Result</h2>
                <p className="text-slate-500 mb-6">{error || 'Result data unavailable.'}</p>
                <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors">
                    Back to Dashboard
                </Link>
            </div>
        </div>
    );

    const totalQuestions = result.responses?.length || result.totalQuestions || 0;
    const correctAnswersCount = result.responses
        ? result.responses.filter((r: any) => r.isCorrect).length
        : (result.correctAnswers || 0);
    const wrongAnswersCount = result.responses
        ? result.responses.filter((r: any) => r.selectedOption && !r.isCorrect).length
        : (result.wrongAnswers || 0);
    const scoreVal = result.score || 0;
    const accuracyVal = result.accuracy !== undefined ? Math.round(result.accuracy) : 0;

    // Safer percentage calculation
    const totalMarks = result.testId?.totalMarks || 0;
    const percentage = totalMarks > 0
        ? Math.round((scoreVal / totalMarks) * 100)
        : (totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0);

    // Final safe percentage clamped 0-100
    const safePercentage = Math.min(100, Math.max(0, percentage));
    const correctPercent = totalQuestions > 0 ? Math.round((correctAnswersCount / totalQuestions) * 100) : 0;


    const filteredResponses = result.responses?.filter((r: any) => {
        if (solutionFilter === 'all') return true;
        if (solutionFilter === 'correct') return r.isCorrect;
        if (solutionFilter === 'wrong') return r.selectedOption && !r.isCorrect;
        if (solutionFilter === 'unattempted') return !r.selectedOption;
        return true;
    }) || [];

    const totalQuestionsCount = result.responses?.length || 0;

    if (viewSolutions && result.responses) {
        const hasResponses = result.responses.length > 0;
        const currentResponse = filteredResponses[currentSolutionIndex];
        const question = currentResponse?.questionId && typeof currentResponse.questionId === 'object' ? currentResponse.questionId : null;
        const userAns = currentResponse?.selectedOption;
        const correctAns = question?.correctOption || currentResponse?.correctOption;

        const getEmptyFilterMessage = () => {
            if (solutionFilter === 'wrong') return "Zero errors! You're on fire! 🔥";
            if (solutionFilter === 'correct') return "No correct answers yet. Keep trying! 💪";
            if (solutionFilter === 'unattempted') return "You've attempted everything! Great persistence! 🚀";
            return "No questions found in this test.";
        };

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-30 shadow-2xl shadow-black/20">
                    <div className="max-w-6xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={handleBack} className="p-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-xl transition-all active:scale-95 border border-slate-700">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h2 className="text-white font-black text-lg uppercase tracking-tight">Solution Mode</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{result.testId?.title || 'Mock Test'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="hidden md:flex bg-slate-800/50 p-1 rounded-xl border border-slate-700/50">
                                {(['all', 'correct', 'wrong', 'unattempted'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => { setSolutionFilter(f); setCurrentSolutionIndex(0); }}
                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${solutionFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-400 hover:text-white'}`}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                            <span className="text-slate-200 text-xs font-black bg-slate-800 px-4 py-2 rounded-xl border border-slate-700 tabular-nums">
                                {filteredResponses.length === 0 ? '0' : currentSolutionIndex + 1} / {filteredResponses.length}
                            </span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 max-w-6xl mx-auto w-full flex flex-col lg:flex-row gap-6 p-4 md:p-8 overflow-hidden">
                    {/* Sidebar Navigator */}
                    <aside className="lg:w-72 shrink-0 bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col max-h-[calc(100vh-160px)]">
                        <h3 className="font-black text-slate-800 dark:text-white text-xs uppercase tracking-[0.15em] mb-4 border-b border-slate-50 dark:border-slate-800 pb-3">Navigator</h3>
                        <div className="grid grid-cols-5 md:grid-cols-6 lg:grid-cols-4 gap-2 overflow-y-auto pr-1 custom-scrollbar">
                            {filteredResponses.map((r: any, idx: number) => {
                                const isSelected = idx === currentSolutionIndex;
                                const isCorrect = r.isCorrect;
                                const isUnattempted = !r.selectedOption;

                                let statusClasses = "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 border-transparent shadow-none";
                                if (isCorrect) statusClasses = "bg-emerald-500 text-white shadow-sm shadow-emerald-500/25";
                                else if (!isUnattempted) statusClasses = "bg-rose-500 text-white shadow-sm shadow-rose-500/25";

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSolutionIndex(idx)}
                                        className={`w-full aspect-square rounded-xl flex items-center justify-center font-black text-xs transition-all border-2 
                                            ${statusClasses}
                                            ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-2 scale-110 z-10 border-white dark:border-slate-900' : 'hover:scale-105'}
                                        `}
                                    >
                                        {result.responses.indexOf(r) + 1}
                                    </button>
                                );
                            })}
                        </div>
                        {filteredResponses.length === 0 && (
                            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 opacity-40">
                                <AlertCircle className="w-10 h-10 mb-2" />
                                <p className="text-xs font-bold uppercase">No items match this filter</p>
                            </div>
                        )}

                        <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-2">
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                <div className="w-2.5 h-2.5 rounded bg-emerald-500"></div> Correct
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                <div className="w-2.5 h-2.5 rounded bg-rose-500"></div> Wrong
                            </div>
                            <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400">
                                <div className="w-2.5 h-2.5 rounded bg-slate-200"></div> Skipped
                            </div>
                        </div>
                    </aside>

                    {/* Main Question Display */}
                    <main className="flex-1 min-w-0">
                        {filteredResponses.length === 0 ? (
                            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[400px]">
                                <Sparkles className="w-16 h-16 text-indigo-400 mb-6 animate-pulse" />
                                <h3 className="text-2xl font-black text-slate-800 dark:text-white mb-2 uppercase tracking-tight">{getEmptyFilterMessage()}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">Try switching filters to see your other responses.</p>
                                <button
                                    onClick={() => setSolutionFilter('all')}
                                    className="mt-8 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/30"
                                >
                                    View All Solutions
                                </button>
                            </div>
                        ) : question ? (
                            <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-slate-100 dark:border-slate-800 mb-6 relative overflow-hidden transition-all duration-500 scroll-mt-24">
                                {/* Subject Badge */}
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full text-[10px] font-black uppercase mb-6 border border-indigo-100 dark:border-indigo-900/20">
                                    <BookOpen className="w-3 h-3" />
                                    {question.subjectId?.name || 'General Reasoning'}
                                </div>

                                <div className="flex gap-6 mb-8 items-start">
                                    <span className="shrink-0 w-12 h-12 bg-indigo-900 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg border-2 border-indigo-700 italic">
                                        Q{result.responses.indexOf(currentResponse) + 1}
                                    </span>
                                    <div className="space-y-4">
                                        <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white leading-[1.6]">
                                            {question.text}
                                        </p>
                                        {question.textHindi && (
                                            <p className="text-lg md:text-xl font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic opacity-80 border-l-4 border-slate-200 dark:border-slate-800 pl-4">
                                                {question.textHindi}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {['A', 'B', 'C', 'D'].map((opt) => {
                                        const optionData = question.options?.find((o: any) => o.id === opt);
                                        const isCorrectOpt = opt === correctAns;
                                        const isUserSelected = opt === userAns;

                                        let statusClasses = "border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20 text-slate-600 dark:text-slate-300";
                                        if (isCorrectOpt) statusClasses = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 ring-1 ring-emerald-500/30 shadow-lg shadow-emerald-500/5";
                                        if (isUserSelected && !isCorrectOpt) statusClasses = "border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-800 dark:text-rose-400 ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/5";

                                        return (
                                            <div key={opt} className={`group p-5 rounded-3xl border flex items-center gap-4 transition-all duration-300 ${statusClasses}`}>
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black border transition-all 
                                                    ${isCorrectOpt ? 'bg-emerald-500 border-emerald-400 text-white rotate-3 scale-110 shadow-lg' :
                                                        isUserSelected ? 'bg-rose-500 border-rose-400 text-white rotate-[-3deg] scale-110 shadow-lg' :
                                                            'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                                                    }`}>
                                                    {opt}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold leading-tight">{optionData?.text || "Options unavailable"}</p>
                                                    {optionData?.textHindi && <p className="text-[11px] opacity-70 mt-1 font-medium">{optionData.textHindi}</p>}
                                                </div>
                                                {isCorrectOpt && <CheckCircle className="w-5 h-5 text-emerald-500 transition-transform animate-in zoom-in" />}
                                                {isUserSelected && !isCorrectOpt && <AlertCircle className="w-5 h-5 text-rose-500 transition-transform animate-in zoom-in" />}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mt-10 p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 border-dashed relative group">
                                    <div className="absolute top-0 right-8 -translate-y-1/2 bg-yellow-400 text-indigo-950 px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-lg flex items-center gap-2 group-hover:scale-105 transition-transform">
                                        <Sparkles className="w-4 h-4" /> Explanation
                                    </div>
                                    <div className="prose dark:prose-invert max-w-none">
                                        <p className="text-slate-700 dark:text-slate-300 text-base leading-relaxed font-medium">
                                            {question.explanation || "No detailed explanation available for this question."}
                                        </p>
                                        {question.explanationHindi && (
                                            <p className="text-slate-500 dark:text-slate-400 text-sm italic mt-4 border-t border-slate-200 dark:border-slate-800 pt-4">
                                                {question.explanationHindi}
                                            </p>
                                        )}
                                    </div>
                                    <div className="mt-6">
                                        <AIDoubtSolver
                                            questionText={question.text}
                                            options={question.options}
                                            correctOption={question.correctOption || currentResponse?.correctOption} // Fallback if question obj incomplete
                                            userSelectedOption={userAns}
                                            questionId={question._id}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 p-12 rounded-[2.5rem] text-center border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <AlertOctagon className="w-10 h-10 text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Question not found</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm max-w-xs mx-auto">This usually happens if the test content was changed or the response is invalid.</p>
                            </div>
                        )}

                        <div className="flex items-center justify-between gap-4 mt-8">
                            <button
                                disabled={currentSolutionIndex === 0}
                                onClick={() => setCurrentSolutionIndex(prev => prev - 1)}
                                className="flex-1 py-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-black rounded-2xl hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                <ChevronLeft className="w-4 h-4" /> Back
                            </button>
                            <button
                                disabled={currentSolutionIndex === filteredResponses.length - 1}
                                onClick={() => setCurrentSolutionIndex(prev => prev + 1)}
                                className="flex-1 py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-2xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                            >
                                Next <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </main>
                </div>

                {/* Mobile Navigator Trigger (FAB) */}
                <div className="fixed bottom-6 right-6 lg:hidden">
                    <button className="w-16 h-16 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform">
                        <TrendingUp className="w-6 h-6" />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="analysis-report" className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-20 font-sans">
            {/* Professional PDF Header (Visible in capture) */}
            <div className="hidden border-b-8 border-indigo-600 bg-white p-0 mb-8 relative" id="pdf-header">
                <img
                    src="/branding-header.png"
                    alt="Branding"
                    className="w-full h-[300px] object-cover"
                />
                <div className="absolute top-10 right-10 flex flex-col items-center">
                    <div className="w-24 h-24 border-4 border-emerald-500 rounded-full flex items-center justify-center rotate-12 bg-white/10 backdrop-blur-sm">
                        <span className="text-emerald-500 font-black text-[10px] text-center leading-tight uppercase">Verified<br />Score</span>
                    </div>
                </div>
                <div className="p-10 flex justify-between items-end bg-slate-900 text-white">
                    <div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">SCORE CARD</h1>
                        <p className="text-indigo-400 font-bold text-lg">{result.testId?.title || 'National Mock Test'}</p>
                        <div className="mt-4 flex gap-4">
                            <div className="bg-white/10 px-3 py-1 rounded text-xs">ID: {params.id?.toString().slice(-8).toUpperCase()}</div>
                            <div className="bg-white/10 px-3 py-1 rounded text-xs">TYPE: Competitive Exam</div>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-xs uppercase font-black text-indigo-400 mb-1">Authenticated On</p>
                        <p className="font-bold text-xl">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>
            </div>

            <header className="bg-indigo-900 text-white p-8 shadow-md text-center relative overflow-hidden print:hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <button
                    onClick={handleBack}
                    className="absolute left-6 top-8 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="relative z-10">
                    <p className="text-indigo-300 text-xs font-black uppercase tracking-[0.2em] mb-3">Overall Performance</p>
                    <div className="inline-flex items-center justify-center w-28 h-28 rounded-full border-8 border-emerald-400/30 bg-indigo-800 mb-6 shadow-2xl relative">
                        {result.rank && (
                            <div className="absolute -top-2 -right-2 bg-yellow-500 text-slate-900 text-[10px] font-black px-2 py-1 rounded-full shadow-lg border border-yellow-400">
                                RANK #{result.rank}
                            </div>
                        )}
                        <div>
                            <span className="block text-4xl font-black">{scoreVal}</span>
                            <span className="text-[10px] text-indigo-300 font-bold uppercase">Marks</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-black mb-1">
                        {percentage > 35 ? 'Excellent Work! 🚀' : 'Keep Pushing! 💪'}
                    </h1>
                    <p className="text-indigo-200 text-xs font-medium opacity-80">Consistency is the key to success in Railway Exams.</p>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 -mt-8 relative z-10">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 text-center transition-transform hover:-translate-y-1">
                        <Target className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{accuracyVal}%</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Accuracy</p>
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 text-center transition-transform hover:-translate-y-1">
                        <AlertOctagon className="w-8 h-8 text-rose-500 mx-auto mb-2" />
                        <p className="text-3xl font-black text-slate-800 dark:text-white">{wrongAnswersCount}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Wrong</p>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 mb-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-slate-800 pb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Subject Analysis
                    </h3>

                    <div className="space-y-5">
                        {result.subjectAnalysis && result.subjectAnalysis.length > 0 ? (
                            result.subjectAnalysis.map((subj: any, idx: number) => {
                                const accuracy = Math.round((subj.correct / subj.total) * 100);
                                return (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-end mb-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-0.5">Subject</span>
                                                <span className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{subj.name}</span>
                                            </div>
                                            <div className="text-right">
                                                <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums">{accuracy}%</span>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{subj.correct}/{subj.total} Correct</p>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                                            <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${accuracy}%` }}></div>
                                            <div className="h-full bg-rose-500 transition-all duration-1000" style={{ width: `${Math.round((subj.wrong / subj.total) * 100)}%` }}></div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="py-4 text-center">
                                <p className="text-xs text-slate-400 font-bold uppercase italic tracking-widest">No subject data available</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Topper Comparison Section */}
                {comparison && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 mb-8">
                        <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-slate-800 pb-4 flex items-center gap-2">
                            <Crown className="w-5 h-5 text-amber-500" />
                            Topper Comparison
                        </h3>

                        {/* Rank & Percentile */}
                        <div className="grid grid-cols-3 gap-3 mb-6">
                            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl text-center">
                                <Medal className="w-5 h-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1" />
                                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">#{comparison.myResult.rank}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Your Rank</p>
                            </div>
                            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
                                <Target className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{comparison.myResult.percentile}%</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Percentile</p>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-center">
                                <Users className="w-5 h-5 text-slate-600 dark:text-slate-400 mx-auto mb-1" />
                                <p className="text-2xl font-black text-slate-700 dark:text-slate-300">{comparison.totalParticipants}</p>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Students</p>
                            </div>
                        </div>

                        {/* Score Comparison Bars */}
                        <div className="space-y-4 mb-6">
                            {[{ label: 'You', score: comparison.myResult.score, max: comparison.topper.score, color: 'indigo', accuracy: comparison.myResult.accuracy },
                            { label: 'Topper', score: comparison.topper.score, max: comparison.topper.score, color: 'amber', accuracy: comparison.topper.accuracy, name: comparison.topper.name },
                            { label: 'Average', score: comparison.average.score, max: comparison.topper.score, color: 'slate', accuracy: comparison.average.accuracy }].map((item) => (
                                <div key={item.label}>
                                    <div className="flex justify-between items-center mb-1">
                                        <div className="flex items-center gap-2">
                                            {item.label === 'Topper' && <Crown className="w-3 h-3 text-amber-500" />}
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.label}</span>
                                            {item.name && <span className="text-[10px] text-slate-400">({item.name})</span>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-black text-slate-800 dark:text-white tabular-nums">{item.score} marks</span>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.accuracy >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'}`}>
                                                {item.accuracy}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-1000 ${item.color === 'indigo' ? 'bg-indigo-500' : item.color === 'amber' ? 'bg-amber-500' : 'bg-slate-400'}`} style={{ width: `${item.max > 0 ? Math.round((item.score / item.max) * 100) : 0}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Time Analysis */}
                        {comparison.myResult.timeAnalysis.avgTimePerQuestion > 0 && (
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-6">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1"><Clock className="w-3 h-3" /> Time Per Question</h4>
                                <div className="grid grid-cols-3 gap-3 text-center">
                                    <div>
                                        <p className="text-lg font-black text-emerald-600">{comparison.myResult.timeAnalysis.fastest}s</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Fastest</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-indigo-600">{comparison.myResult.timeAnalysis.avgTimePerQuestion}s</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Avg (You)</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-black text-amber-600">{comparison.topper.timeAnalysis.avgTimePerQuestion}s</p>
                                        <p className="text-[9px] text-slate-400 font-bold">Avg (Topper)</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Mini Leaderboard */}
                        {comparison.leaderboard && comparison.leaderboard.length > 0 && (
                            <div>
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Top 5 Leaderboard</h4>
                                <div className="space-y-2">
                                    {comparison.leaderboard.map((entry: any) => (
                                        <div key={entry.rank} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${entry.rank <= 3 ? 'bg-amber-50/50 dark:bg-amber-900/10' : 'bg-slate-50 dark:bg-slate-800/30'}`}>
                                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${entry.rank === 1 ? 'bg-amber-500 text-white' : entry.rank === 2 ? 'bg-slate-400 text-white' : entry.rank === 3 ? 'bg-amber-700 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                                                {entry.rank}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-800 dark:text-white truncate">{entry.name}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{entry.score}</p>
                                                <p className="text-[9px] text-slate-400 font-bold">{entry.accuracy}%</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {compLoading && (
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 mb-8 text-center">
                        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                        <p className="text-xs text-slate-400 font-bold">Loading topper comparison...</p>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-white dark:border-slate-800 mb-8">
                    <h3 className="font-black text-slate-800 dark:text-white text-sm uppercase tracking-widest mb-6 border-b border-slate-50 dark:border-slate-800 pb-4">Test Summary</h3>

                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500 dark:text-slate-400">Correct Answers</span>
                                <span className="text-emerald-600">{correctAnswersCount} / {totalQuestions}</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${correctPercent}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-bold mb-2">
                                <span className="text-slate-500 dark:text-slate-400">Total Score</span>
                                <span className="text-indigo-600">{scoreVal} Marks</span>
                            </div>
                            <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${safePercentage}%` }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={() => setViewSolutions(true)}
                        className="w-full bg-indigo-600 text-white font-black py-5 rounded-2xl text-center shadow-2xl shadow-indigo-500/40 flex items-center justify-center gap-3 active:scale-95 transition-all group"
                    >
                        <Zap className="w-6 h-6 fill-current text-yellow-300 group-hover:rotate-12 transition-transform" />
                        VIEW SOLUTIONS
                    </button>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            disabled={isGeneratingPdf}
                            onClick={async () => {
                                setIsGeneratingPdf(true);
                                try {
                                    const { default: jsPDF } = await import('jspdf');
                                    const { toPng } = await import('html-to-image');
                                    const element = document.getElementById('analysis-report');
                                    const pdfHeader = document.getElementById('pdf-header');
                                    if (!element || !pdfHeader) return;

                                    // Show the hidden header for the PDF Output
                                    pdfHeader.classList.remove('hidden');

                                    const imgData = await toPng(element, {
                                        backgroundColor: '#ffffff',
                                        style: { transform: 'scale(1)', transformOrigin: 'top left', margin: '0' },
                                        pixelRatio: 2
                                    });

                                    // Hide it back
                                    pdfHeader.classList.add('hidden');

                                    const pdf = new jsPDF('p', 'mm', 'a4');
                                    const imgProps = pdf.getImageProperties(imgData);
                                    const pdfWidth = pdf.internal.pageSize.getWidth();
                                    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                                    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                                    pdf.save(`RailPath_Report_${result.testId?.title || 'Test'}.pdf`);
                                } catch (err) {
                                    console.error('PDF Gen Error:', err);
                                } finally {
                                    setIsGeneratingPdf(false);
                                }
                            }}
                            className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isGeneratingPdf ? (
                                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <FileText className="w-5 h-5 text-rose-500" />
                            )}
                            {isGeneratingPdf ? 'Processing...' : 'PDF Report'}
                        </button>

                        <button
                            onClick={() => {
                                const shareText = `I scored ${scoreVal} marks with ${accuracyVal}% accuracy in ${result.testId?.title || 'the Mock Test'} on Lalan RailPath! 🚀 My AIR Rank is #${result.rank || 'N/A'}. Can you beat my score?`;
                                const shareUrl = window.location.href;
                                const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
                                window.location.href = whatsappUrl;
                            }}
                            className="flex-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold py-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                        >
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                            Share Rank
                        </button>
                    </div>

                    <Link href="/dashboard/tests" className="block w-full bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 font-bold py-5 rounded-2xl text-center border-2 border-indigo-50 dark:border-indigo-900/30 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <RotateCcw className="w-5 h-5" /> Take Another Test
                    </Link>
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="block w-full bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 font-bold py-5 rounded-2xl text-center border border-slate-100 dark:border-slate-800 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                        <Home className="w-5 h-5" /> Back to Dashboard
                    </Link>
                </div>
            </main>
        </div>
    );
}
