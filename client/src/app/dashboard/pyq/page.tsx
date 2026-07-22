"use client";

import { useState, useMemo, useEffect } from 'react';
import { BookOpen, Search, X, ChevronDown, ChevronUp, Filter, ArrowLeft, Trophy, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import Link from 'next/link';
import AIDoubtSolver from '@/components/Common/AIDoubtSolver';

interface PYQ {
    _id: string;
    question: string;
    options: string[];
    correctOption: number;
    explanation?: string;
    year: number;
    subject: string;
    topic?: string;
    examType?: string;
}

const EXAM_TABS = ['all', 'RRB NTPC', 'RRB Group D', 'RRB ALP', 'RRB JE'];

export default function PYQPage() {
    const router = useRouter();
    const [pyqs, setPyqs] = useState<PYQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeYear, setActiveYear] = useState<number | 'all'>('all');
    const [activeSubject, setActiveSubject] = useState<string>('all');
    const [activeExam, setActiveExam] = useState<string>('all');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [revealedId, setRevealedId] = useState<string | null>(null);
    const [userAnswers, setUserAnswers] = useState<{ [id: string]: number }>({});
    const [score, setScore] = useState({ correct: 0, wrong: 0 });

    useEffect(() => { fetchPYQs(); }, []);

    const fetchPYQs = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/content/pyq');
            setPyqs(Array.isArray(data) ? data : data.data || []);
        } catch {
            setPyqs(DEMO_PYQS);
        } finally {
            setLoading(false);
        }
    };

    const filtered = useMemo(() =>
        pyqs.filter(q => {
            const matchYear = activeYear === 'all' || q.year === activeYear;
            const matchSubj = activeSubject === 'all' || q.subject === activeSubject;
            const matchExam = activeExam === 'all' || (q.examType?.toLowerCase() === activeExam.toLowerCase());
            const matchSearch = !searchQuery || q.question.toLowerCase().includes(searchQuery.toLowerCase());
            return matchYear && matchSubj && matchExam && matchSearch;
        })
    , [pyqs, activeYear, activeSubject, activeExam, searchQuery]);

    const years = useMemo(() => {
        const seen = new Set<number>();
        pyqs.forEach(q => seen.add(q.year));
        return Array.from(seen).sort((a, b) => b - a);
    }, [pyqs]);

    const subjects = useMemo(() => {
        const seen = new Set<string>();
        pyqs.forEach(q => seen.add(q.subject));
        return Array.from(seen);
    }, [pyqs]);

    const handleAnswer = (pyqId: string, optionIdx: number, correctOption: number) => {
        if (userAnswers[pyqId] !== undefined) return;
        setUserAnswers(prev => ({ ...prev, [pyqId]: optionIdx }));
        setRevealedId(pyqId);
        if (optionIdx === correctOption) {
            setScore(s => ({ ...s, correct: s.correct + 1 }));
        } else {
            setScore(s => ({ ...s, wrong: s.wrong + 1 }));
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
            {/* Header */}
            <header className="bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 text-white sticky top-0 z-40 shadow-xl shadow-purple-950/20">
                <div className="max-w-4xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-3 mb-3">
                        <button onClick={() => router.back()} className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="font-black text-xl leading-tight">Previous Year Questions (PYQs)</h1>
                            <p className="text-xs text-purple-200 font-medium">{filtered.length} questions available</p>
                        </div>
                        {(score.correct + score.wrong) > 0 && (
                            <div className="ml-auto flex items-center gap-2 bg-white/15 rounded-2xl px-3 py-1.5 backdrop-blur-md">
                                <span className="text-emerald-300 font-bold text-xs">✓ {score.correct}</span>
                                <span className="text-rose-300 font-bold text-xs">✗ {score.wrong}</span>
                            </div>
                        )}
                    </div>

                    {/* Primary Exam Category Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide border-b border-white/10 mb-3">
                        {EXAM_TABS.map(exam => (
                            <button
                                key={exam}
                                onClick={() => setActiveExam(exam)}
                                className={`shrink-0 px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    activeExam === exam
                                        ? 'bg-white text-purple-900 shadow-md scale-105'
                                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                                }`}
                            >
                                {exam === 'all' ? 'All Exams' : exam}
                            </button>
                        ))}
                    </div>

                    {/* Search bar */}
                    <div className="relative mb-3">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-purple-300" />
                        <input
                            type="text"
                            placeholder="Search questions by keyword..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-9 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-purple-300 text-sm focus:outline-none focus:bg-white/20 transition-all"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300">
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>

                    {/* Year + Subject Filters */}
                    <div className="flex flex-wrap gap-2">
                        {/* Year filter */}
                        <button
                            onClick={() => setActiveYear('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeYear === 'all' ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                        >
                            All Years
                        </button>
                        {years.slice(0, 6).map(yr => (
                            <button
                                key={yr}
                                onClick={() => setActiveYear(yr)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeYear === yr ? 'bg-purple-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                            >
                                {yr}
                            </button>
                        ))}

                        <div className="w-px h-5 bg-white/20 my-auto" />

                        {/* Subject filter */}
                        <button
                            onClick={() => setActiveSubject('all')}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSubject === 'all' ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                        >
                            All Subjects
                        </button>
                        {subjects.map(subj => (
                            <button
                                key={subj}
                                onClick={() => setActiveSubject(subj)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${activeSubject === subj ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                            >
                                {subj}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-6 rounded-3xl animate-pulse space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
                                <div className="grid grid-cols-2 gap-2 mt-4">
                                    {[1, 2, 3, 4].map(j => <div key={j} className="h-10 bg-slate-200 dark:bg-slate-800 rounded-2xl" />)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
                        <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mb-4">
                            <BookOpen className="w-8 h-8 text-purple-500" />
                        </div>
                        <h3 className="font-bold text-slate-700 dark:text-slate-300 text-base mb-1">No questions found</h3>
                        <p className="text-xs text-slate-400 max-w-xs">Try selecting "All Exams" or clearing your search term.</p>
                    </div>
                ) : (
                    filtered.map((pyq, idx) => {
                        const userAns = userAnswers[pyq._id];
                        const isAnswered = userAns !== undefined;
                        const isExpanded = expandedId === pyq._id;

                        return (
                            <div key={pyq._id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:border-purple-200 dark:hover:border-purple-900">
                                {/* Question content */}
                                <div className="p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <span className="w-7 h-7 rounded-xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">
                                            {idx + 1}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap gap-1.5 mb-2">
                                                <span className="text-[10px] font-black bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    {pyq.examType || 'RRB'}
                                                </span>
                                                <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    {pyq.subject}
                                                </span>
                                                <span className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                                                    {pyq.year}
                                                </span>
                                            </div>
                                            <p className="text-slate-800 dark:text-white font-semibold text-sm leading-relaxed">{pyq.question}</p>
                                        </div>
                                    </div>

                                    {/* Options Grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-4">
                                        {pyq.options.map((opt, optIdx) => {
                                            let className = "w-full text-left px-4 py-3 rounded-2xl text-xs font-semibold border transition-all flex items-center justify-between ";
                                            if (isAnswered) {
                                                if (optIdx === pyq.correctOption) {
                                                    className += "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm";
                                                } else if (optIdx === userAns) {
                                                    className += "bg-rose-50 dark:bg-rose-950/30 border-rose-500 text-rose-700 dark:text-rose-300 font-bold";
                                                } else {
                                                    className += "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400 opacity-60";
                                                }
                                            } else {
                                                className += "bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-200 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 active:scale-[0.99] cursor-pointer";
                                            }
                                            return (
                                                <button
                                                    key={optIdx}
                                                    className={className}
                                                    onClick={() => handleAnswer(pyq._id, optIdx, pyq.correctOption)}
                                                    disabled={isAnswered}
                                                >
                                                    <span>
                                                        <span className="font-black mr-2 text-purple-500">{String.fromCharCode(65 + optIdx)}.</span>
                                                        {opt}
                                                    </span>
                                                    {isAnswered && optIdx === pyq.correctOption && <span className="text-emerald-500 font-black">✓</span>}
                                                    {isAnswered && optIdx === userAns && optIdx !== pyq.correctOption && <span className="text-rose-500 font-black">✗</span>}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {!isAnswered && (
                                        <button
                                            onClick={() => handleAnswer(pyq._id, -1, pyq.correctOption)}
                                            className="mt-3 w-full py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                                        >
                                            Skip & Show Correct Answer
                                        </button>
                                    )}
                                </div>

                                {/* Explanation & AI Tutor */}
                                {isAnswered && (
                                    <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 p-5 space-y-4">
                                        {pyq.explanation && (
                                            <div>
                                                <button
                                                    onClick={() => setExpandedId(isExpanded ? null : pyq._id)}
                                                    className="flex items-center justify-between w-full text-xs font-bold text-indigo-600 dark:text-indigo-400"
                                                >
                                                    <span className="flex items-center gap-1.5">📚 View Text Explanation</span>
                                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                                </button>
                                                {isExpanded && (
                                                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                                                        {pyq.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {/* AI Tutor Assistant */}
                                        <div className="pt-2">
                                            <AIDoubtSolver
                                                questionText={pyq.question}
                                                options={pyq.options}
                                                correctOption={String.fromCharCode(65 + pyq.correctOption)}
                                                userSelectedOption={userAns !== undefined && userAns >= 0 ? String.fromCharCode(65 + userAns) : undefined}
                                                questionId={pyq._id}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </main>
        </div>
    );
}

const DEMO_PYQS: PYQ[] = [
    { _id: '1', question: 'A train travels 360 km in 4 hours. What is the speed of the train in m/s?', options: ['25 m/s', '22.5 m/s', '20 m/s', '30 m/s'], correctOption: 0, explanation: 'Speed = 360 km / 4 hr = 90 km/hr. To convert km/hr to m/s, multiply by 5/18. 90 × 5/18 = 25 m/s.', year: 2023, subject: 'Maths', examType: 'RRB NTPC' },
    { _id: '2', question: 'Who is known as the "Missile Man of India"?', options: ['Vikram Sarabhai', 'A.P.J. Abdul Kalam', 'Homi J. Bhabha', 'C.V. Raman'], correctOption: 1, explanation: 'Dr. A.P.J. Abdul Kalam is known as the Missile Man of India for his contributions to the development of missile technology.', year: 2022, subject: 'General Knowledge', examType: 'RRB Group D' },
    { _id: '3', question: 'Which gas is responsible for the greenhouse effect?', options: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'], correctOption: 2, explanation: 'Carbon Dioxide (CO₂) is the primary greenhouse gas responsible for the greenhouse effect and global warming.', year: 2023, subject: 'General Science', examType: 'RRB NTPC' },
    { _id: '4', question: 'If A is the brother of B, B is the sister of C, and C is the father of D, how is A related to D?', options: ['Uncle', 'Father', 'Grandfather', 'Cousin'], correctOption: 0, explanation: 'A is brother of B → A is male. B is sister of C → C is male. C is father of D. So A is brother of C, thus Uncle of D.', year: 2021, subject: 'Reasoning', examType: 'RRB Group D' },
    { _id: '5', question: 'What is the boiling point of water at standard atmospheric pressure?', options: ['90°C', '95°C', '100°C', '105°C'], correctOption: 2, explanation: 'Water boils at 100°C (212°F) at standard atmospheric pressure (1 atm or 101.325 kPa).', year: 2022, subject: 'General Science', examType: 'RRB ALP' },
    { _id: '6', question: 'The Durand Line separates which two countries?', options: ['India and China', 'Pakistan and Afghanistan', 'India and Nepal', 'China and Russia'], correctOption: 1, explanation: 'The Durand Line is the international border between Pakistan and Afghanistan, established in 1893.', year: 2023, subject: 'General Knowledge', examType: 'RRB NTPC' },
    { _id: '7', question: 'Find the LCM of 12, 18, and 24.', options: ['36', '48', '72', '96'], correctOption: 2, explanation: '12 = 2² × 3, 18 = 2 × 3², 24 = 2³ × 3. LCM = 2³ × 3² = 8 × 9 = 72.', year: 2020, subject: 'Maths', examType: 'RRB Group D' },
    { _id: '8', question: 'Which of the following is NOT a fundamental right guaranteed by the Indian Constitution?', options: ['Right to Equality', 'Right to Education', 'Right to Property', 'Right to Religion'], correctOption: 2, explanation: 'The Right to Property was removed from fundamental rights by the 44th Amendment in 1978. It is now a legal right under Article 300-A.', year: 2022, subject: 'General Knowledge', examType: 'RRB NTPC' },
];
