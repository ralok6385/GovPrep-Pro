"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { BookOpen, ChevronRight, ArrowRight, CheckCircle, XCircle, Lightbulb, Loader2, Filter, RotateCcw, Trophy, Zap, Target, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { Subject, Question, TopicInfo } from '@/types';
import AIDoubtSolver from '@/components/Common/AIDoubtSolver';

type PracticeState = 'select' | 'playing' | 'review';

export default function PracticePage() {
    const router = useRouter();

    // Selection state
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [topics, setTopics] = useState<TopicInfo[]>([]);
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('all');
    const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
    const [loading, setLoading] = useState(true);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    // Practice state
    const [state, setState] = useState<PracticeState>('select');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi'>('hi');

    // Stats tracking
    const [stats, setStats] = useState({ correct: 0, incorrect: 0, total: 0 });

    const currentQ = questions[currentIndex];

    useEffect(() => {
        fetchSubjects();
    }, []);

    useEffect(() => {
        if (selectedSubject) {
            fetchTopics(selectedSubject);
        }
    }, [selectedSubject]);

    const fetchSubjects = async () => {
        try {
            const { data } = await api.get('/subjects?all=true');
            setSubjects(data);
            if (data.length > 0) setSelectedSubject(data[0]._id);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const fetchTopics = async (subjectId: string) => {
        try {
            const { data } = await api.get(`/questions/topics?subjectId=${subjectId}`);
            setTopics(data);
        } catch (e) {
            console.error(e);
        }
    };

    const startPractice = async () => {
        setLoadingQuestions(true);
        try {
            const params = new URLSearchParams();
            if (selectedSubject) params.set('subjectId', selectedSubject);
            if (selectedTopic !== 'all') params.set('topic', selectedTopic);
            if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
            params.set('limit', '20');

            const { data } = await api.get(`/questions/practice?${params.toString()}`);
            if (data.questions.length === 0) {
                alert('No questions found for this filter. Try different options.');
                setLoadingQuestions(false);
                return;
            }
            setQuestions(data.questions);
            setCurrentIndex(0);
            setStats({ correct: 0, incorrect: 0, total: 0 });
            setSelectedOption(null);
            setIsAnswered(false);
            setState('playing');
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingQuestions(false);
        }
    };

    const handleAnswer = (optionId: string) => {
        if (isAnswered) return;
        setSelectedOption(optionId);
        setIsAnswered(true);

        const isCorrect = optionId === currentQ.correctOption;
        
        // Haptic feedback for mobile
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
            try {
                navigator.vibrate(isCorrect ? 50 : [40, 40, 80]);
            } catch (e) {}
        }

        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            incorrect: prev.incorrect + (isCorrect ? 0 : 1),
            total: prev.total + 1
        }));
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setIsAnswered(false);
        } else {
            setState('review');
        }
    };

    const getSubjectName = (id: string) => subjects.find(s => s._id === id)?.name || '';

    // ===== SELECT VIEW =====
    if (state === 'select') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
                {/* Header */}
                <header className="relative bg-gradient-to-br from-emerald-600 to-teal-700 text-white overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                    <div className="relative max-w-2xl mx-auto px-5 py-8 text-center">
                        <button
                            onClick={() => router.back()}
                            className="absolute left-5 top-8 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-white" />
                        </button>

                        <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl mb-4 inline-flex shadow-inner border border-white/20">
                            <Target className="w-8 h-8 text-yellow-300" />
                        </div>
                        <h1 className="font-bold text-3xl mb-2 tracking-tight">Topic-wise Practice</h1>
                        <p className="text-emerald-100 text-sm font-medium opacity-90">
                            Master one topic at a time. Instant feedback, detailed explanations.
                        </p>
                    </div>
                </header>

                <main className="max-w-xl mx-auto px-4 py-8 space-y-8">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                        </div>
                    ) : (
                        <>
                            {/* Subject Selection */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <BookOpen className="w-4 h-4 text-emerald-600" /> Select Subject
                                </label>
                                <div className="grid grid-cols-2 gap-3 mt-3">
                                    {subjects.map(sub => (
                                        <button
                                            key={sub._id}
                                            onClick={() => { setSelectedSubject(sub._id); setSelectedTopic('all'); }}
                                            className={`p-4 rounded-2xl border-2 text-left font-semibold text-sm transition-all ${selectedSubject === sub._id
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 shadow-lg shadow-emerald-500/10'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                                                }`}
                                        >
                                            {sub.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Topic Selection */}
                            {topics.length > 0 && (
                                <div>
                                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                        <Filter className="w-4 h-4 text-emerald-600" /> Select Topic
                                    </label>
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        <button
                                            onClick={() => setSelectedTopic('all')}
                                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTopic === 'all'
                                                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                }`}
                                        >
                                            All Topics
                                        </button>
                                        {topics.map(t => (
                                            <button
                                                key={t.topic}
                                                onClick={() => setSelectedTopic(t.topic)}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTopic === t.topic
                                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20'
                                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                                                    }`}
                                            >
                                                {t.topic} <span className="opacity-60">({t.count})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Difficulty Selection */}
                            <div>
                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                                    <Zap className="w-4 h-4 text-emerald-600" /> Difficulty
                                </label>
                                <div className="flex gap-3 mt-3">
                                    {[{ v: 'all', l: 'All', c: 'slate' }, { v: 'easy', l: 'Easy', c: 'emerald' }, { v: 'medium', l: 'Medium', c: 'amber' }, { v: 'hard', l: 'Hard', c: 'rose' }].map(d => (
                                        <button
                                            key={d.v}
                                            onClick={() => setSelectedDifficulty(d.v)}
                                            className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border-2 ${selectedDifficulty === d.v
                                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400'
                                                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {d.l}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Start Button */}
                            <button
                                onClick={startPractice}
                                disabled={loadingQuestions || !selectedSubject}
                                className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2 text-lg disabled:opacity-50"
                            >
                                {loadingQuestions ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Loading Questions...</>
                                ) : (
                                    <>Start Practice <ArrowRight className="w-5 h-5" /></>
                                )}
                            </button>
                        </>
                    )}
                </main>
            </div>
        );
    }

    // ===== PLAYING VIEW =====
    if (state === 'playing' && currentQ) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
                {/* Top Bar */}
                <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 sticky top-0 z-30">
                    <div className="max-w-2xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setState('review')} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200">
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{getSubjectName(selectedSubject)}</p>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    Q {currentIndex + 1} / {questions.length}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Language Toggle */}
                            <button
                                onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')}
                                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800"
                            >
                                {language === 'en' ? 'हिंदी' : 'ENG'}
                            </button>

                            {/* Score */}
                            <div className="flex items-center gap-3 text-sm font-bold">
                                <span className="flex items-center gap-1 text-emerald-600"><CheckCircle className="w-4 h-4" />{stats.correct}</span>
                                <span className="flex items-center gap-1 text-rose-500"><XCircle className="w-4 h-4" />{stats.incorrect}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Question Area */}
                <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
                    {/* Difficulty Badge */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentQ.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : currentQ.difficulty === 'hard' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                                : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                            }`}>
                            {currentQ.difficulty}
                        </span>
                        {currentQ.topic && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                                {currentQ.topic}
                            </span>
                        )}
                        {currentQ.source && (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                PYQ: {currentQ.source}
                            </span>
                        )}
                    </div>

                    {/* Question Text */}
                    <div className="max-h-52 overflow-y-auto pr-1 mb-6 custom-scrollbar">
                        <h2 className="text-lg md:text-xl font-bold text-slate-800 dark:text-white leading-relaxed" dangerouslySetInnerHTML={{
                            __html: language === 'hi' && currentQ.textHindi ? currentQ.textHindi : currentQ.text
                        }} />
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                        {currentQ.options.map((opt) => {
                            let cls = 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10';

                            if (isAnswered) {
                                if (opt.id === currentQ.correctOption) {
                                    cls = 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 text-emerald-700 dark:text-emerald-400';
                                } else if (opt.id === selectedOption) {
                                    cls = 'bg-rose-50 dark:bg-rose-900/20 border-rose-500 text-rose-700 dark:text-rose-400';
                                } else {
                                    cls = 'bg-slate-50 dark:bg-slate-800/50 opacity-50 border-transparent';
                                }
                            }

                            return (
                                <button
                                    key={opt.id}
                                    onClick={() => handleAnswer(opt.id)}
                                    disabled={isAnswered}
                                    className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ${cls}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm font-bold text-slate-500 dark:text-slate-400">
                                            {opt.id}
                                        </span>
                                        <span dangerouslySetInnerHTML={{
                                            __html: language === 'hi' && opt.textHindi ? opt.textHindi : opt.text
                                        }} />
                                    </div>
                                    {isAnswered && opt.id === currentQ.correctOption && <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />}
                                    {isAnswered && opt.id === selectedOption && opt.id !== currentQ.correctOption && <XCircle className="w-5 h-5 text-rose-500 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation (shown after answering) */}
                    {isAnswered && (
                        <div className="mt-6 space-y-4">
                            {(currentQ.explanation || currentQ.explanationHindi) && (
                                <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-5">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Lightbulb className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        <span className="text-sm font-bold text-indigo-700 dark:text-indigo-300">Explanation</span>
                                    </div>
                                    <p className="text-sm text-indigo-900 dark:text-indigo-200 leading-relaxed" dangerouslySetInnerHTML={{
                                        __html: language === 'hi' && currentQ.explanationHindi ? currentQ.explanationHindi : (currentQ.explanation || '')
                                    }} />
                                </div>
                            )}

                            {/* AI Doubt Tutor */}
                            <AIDoubtSolver
                                questionText={currentQ.text}
                                options={currentQ.options}
                                correctOption={currentQ.correctOption}
                                userSelectedOption={selectedOption || undefined}
                                questionId={currentQ._id}
                            />
                        </div>
                    )}

                    {/* Next Button */}
                    {isAnswered && (
                        <button
                            onClick={handleNext}
                            className="w-full mt-6 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            {currentIndex < questions.length - 1 ? (
                                <>Next Question <ArrowRight className="w-5 h-5" /></>
                            ) : (
                                <>View Summary <Trophy className="w-5 h-5" /></>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    }

    // ===== REVIEW VIEW =====
    if (state === 'review') {
        const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;

        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
                <div className="max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center ${accuracy >= 70 ? 'bg-emerald-100 dark:bg-emerald-900/30' : accuracy >= 40 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-rose-100 dark:bg-rose-900/30'}`}>
                            <Trophy className={`w-12 h-12 ${accuracy >= 70 ? 'text-emerald-600' : accuracy >= 40 ? 'text-amber-600' : 'text-rose-500'}`} />
                        </div>
                        <h1 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Practice Complete!</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                            {getSubjectName(selectedSubject)} {selectedTopic !== 'all' ? `• ${selectedTopic}` : ''}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm mb-6">
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <div className="text-3xl font-black text-emerald-600">{stats.correct}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Correct</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-rose-500">{stats.incorrect}</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Incorrect</div>
                            </div>
                            <div>
                                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{accuracy}%</div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 font-bold mt-1">Accuracy</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-6 h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex">
                            <div className="h-full bg-emerald-500 rounded-l-full" style={{ width: `${(stats.correct / stats.total) * 100}%` }}></div>
                            <div className="h-full bg-rose-500 rounded-r-full" style={{ width: `${(stats.incorrect / stats.total) * 100}%` }}></div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={() => { setState('select'); setQuestions([]); }}
                            className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                        >
                            <RotateCcw className="w-5 h-5" /> Practice More
                        </button>
                        <Link
                            href="/dashboard"
                            className="w-full py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 hover:border-slate-300 transition-all"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
