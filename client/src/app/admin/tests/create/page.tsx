"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import AIModal from '@/components/Admin/AIQuestionModal';
import { Save, Search, Filter, Shuffle, CheckSquare, AlertCircle, Award, Sparkles, UploadCloud } from 'lucide-react';
import Link from 'next/link';
import ManualQuestionSelector from '@/components/Admin/ManualQuestionSelector';

export default function CreateTestPage() {
    const router = useRouter();
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);

    // AI Modal State
    const [isAIModalOpen, setIsAIModalOpen] = useState(false);
    const [isManualSelectorOpen, setIsManualSelectorOpen] = useState(false);

    // Selection States
    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>([]);

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);

    // Form Data
    interface TestFormData {
        type: 'exam' | 'quiz';
        title: string;
        durationMinutes: number | string;
        totalMarks: number | string;
        positiveMark: number | string;
        negativeMark: number | string;
    }

    const [formData, setFormData] = useState<TestFormData>({
        type: 'exam',
        title: '',
        durationMinutes: 60,
        totalMarks: 100,
        positiveMark: 2,
        negativeMark: 0.5,
    });

    const [loading, setLoading] = useState(false);

    // Initial Fetch
    useEffect(() => {
        api.get('/exams').then(res => setExams(res.data));
    }, []);

    // Fetch Subjects when Exam Changes
    useEffect(() => {
        if (selectedExam) {
            api.get(`/exams/${selectedExam}/subjects`).then(res => setSubjects(res.data));
            setSelectedSubject(''); // Reset subject
            setQuestions([]); // Reset questions
        }
    }, [selectedExam]);

    // Fetch Questions when Subject Changes
    useEffect(() => {
        if (selectedSubject) {
            api.get(`/questions/subject/${selectedSubject}`).then(res => {
                setQuestions(res.data);
                setFilteredQuestions(res.data);
            });
        }
    }, [selectedSubject]);

    // Filter Questions Effect
    useEffect(() => {
        if (!searchQuery) {
            setFilteredQuestions(questions);
        } else {
            const lowerQuery = searchQuery.toLowerCase();
            setFilteredQuestions(questions.filter(q =>
                q.text.toLowerCase().includes(lowerQuery) ||
                q.difficulty.toLowerCase().includes(lowerQuery)
            ));
        }
    }, [searchQuery, questions]);

    const toggleQuestion = (id: string) => {
        setSelectedQuestionIds(prev =>
            prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        const idsToAdd = filteredQuestions.map(q => q._id);
        // Add only ones not already selected
        const uniqueIds = Array.from(new Set([...selectedQuestionIds, ...idsToAdd]));
        setSelectedQuestionIds(uniqueIds);
        toast.success(`Selected ${filteredQuestions.length} questions`);
    };

    const handleRandomPick = async (count: number, subjectId?: string) => {
        let pool = questions;

        // If subjectId is provided, pick only from that subject
        if (subjectId) {
            try {
                const { data } = await api.get(`/questions/subject/${subjectId}`);
                pool = data;
            } catch (error) {
                console.error('Failed to fetch subject questions for random pick', error);
                return;
            }
        }

        if (pool.length === 0) {
            toast.error('No questions available to pick from');
            return;
        }

        // Shuffle and pick
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        const newlySelected = shuffled.slice(0, count).map(q => q._id);

        // Add to existing selection, ensuring uniqueness
        setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...newlySelected])));
        toast.success(`Allocated ${Math.min(count, newlySelected.length)} questions`);
    };

    const handleAIQuestions = (newQuestions: any[]) => {
        // Backend now saves questions and returns them with _id and id

        // Add valid questions to state
        setQuestions(prev => [...newQuestions, ...prev]);
        setFilteredQuestions(prev => [...newQuestions, ...prev]);

        // Auto-select them using _id or id
        const newIds = newQuestions.map(q => q._id || q.id);
        setSelectedQuestionIds(prev => [...prev, ...newIds]);

        toast.success(`Allocated ${newQuestions.length} AI questions!`);
    };

    const handleManualSelection = (newQuestions: any[]) => {
        setQuestions(prev => {
            const existingIds = prev.map(q => q._id);
            const uniqueNew = newQuestions.filter(q => !existingIds.includes(q._id));
            return [...prev, ...uniqueNew];
        });

        const newIds = newQuestions.map(q => q._id);
        setSelectedQuestionIds(prev => Array.from(new Set([...prev, ...newIds])));
        toast.success(`Added ${newQuestions.length} questions from bank`);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam || selectedQuestionIds.length === 0) {
            return toast.error('Please select exam and at least one question');
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                examId: selectedExam,
                questions: selectedQuestionIds,
                durationMinutes: Number(formData.durationMinutes),
                totalMarks: Number(formData.totalMarks),
                positiveMark: Number(formData.positiveMark),
                negativeMark: Number(formData.negativeMark)
            };

            await api.post('/tests', payload);
            toast.success('Test Published Successfully!');
            // Redirect to tests list after publishing
            router.push('/admin/tests');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <AIModal
                isOpen={isAIModalOpen}
                onClose={() => setIsAIModalOpen(false)}
                subjectId={selectedSubject}
                onQuestionsGenerated={handleAIQuestions}
            />
            <ManualQuestionSelector
                isOpen={isManualSelectorOpen}
                onClose={() => setIsManualSelectorOpen(false)}
                onQuestionsSelected={handleManualSelection}
                alreadySelectedIds={selectedQuestionIds}
            />
            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                        Test Creator Studio
                    </h1>
                    <div className="flex items-center gap-4 text-sm font-medium">
                        <div className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                            {selectedQuestionIds.length} Questions Selected
                        </div>
                        <Link
                            href="/admin/questions/upload"
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 border border-slate-700 text-xs font-bold"
                        >
                            <UploadCloud className="w-4 h-4" /> Bulk Upload
                        </Link>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                            Publish Test
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left Column: Configuration (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 space-y-6 sticky top-24">
                        <div>
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Award className="w-5 h-5 text-indigo-400" />
                                Test Configurations
                            </h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Test Type</label>
                                    <div className="flex gap-2 p-1 bg-slate-950 border border-slate-700 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'exam' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'exam' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                                        >
                                            Full Exam
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'quiz' })}
                                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'quiz' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-800'}`}
                                        >
                                            Speed Quiz
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Test Title</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. SSC CGL Full Mock 1"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Target Exam</label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                                        value={selectedExam}
                                        onChange={(e) => setSelectedExam(e.target.value)}
                                    >
                                        <option value="">Select Exam Category</option>
                                        {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                                    </select>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Duration (min)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.durationMinutes}
                                            onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Total Marks</label>
                                        <input
                                            type="number"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={formData.totalMarks}
                                            onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-green-500/70 uppercase tracking-wider mb-1 block">Correct (+)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-slate-950 border border-green-900/30 rounded-xl p-3 text-green-400 focus:ring-2 focus:ring-green-500 outline-none"
                                            value={formData.positiveMark}
                                            onChange={e => setFormData({ ...formData, positiveMark: Number(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-red-500/70 uppercase tracking-wider mb-1 block">Wrong (-)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            className="w-full bg-slate-950 border border-red-900/30 rounded-xl p-3 text-red-400 focus:ring-2 focus:ring-red-500 outline-none"
                                            value={formData.negativeMark}
                                            onChange={e => setFormData({ ...formData, negativeMark: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Automated Blueprint Strategy (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-8 flex flex-col items-center justify-center text-center min-h-[600px]">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/10">
                            <Sparkles className="w-10 h-10 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Automated Test Generator</h2>
                        <p className="text-slate-400 max-w-md mb-8">
                            Instead of manually picking questions, define a blueprint and let our AI assemble the perfect test for you.
                        </p>

                        <div className="w-full max-w-lg space-y-4">
                            {!selectedExam ? (
                                <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-200 text-sm font-bold flex items-center gap-2 justify-center">
                                    <AlertCircle className="w-4 h-4" /> Please select a Target Exam first
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-950 border border-slate-700 rounded-xl p-4 text-left">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block">Question Distribution</label>
                                        <div className="space-y-3">
                                            {subjects.map(s => (
                                                <div key={s._id} className="flex items-center justify-between">
                                                    <span className="text-slate-300 font-medium">{s.name}</span>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            className="w-20 bg-slate-800 border-slate-700 rounded-lg p-2 text-center text-white text-sm font-bold focus:ring-1 focus:ring-indigo-500 outline-none"
                                                            onChange={(e) => {
                                                                const count = parseInt(e.target.value) || 0;
                                                                // Logic to auto-fetch 'count' random questions from this subject would go here
                                                                // For UI, we just simulate
                                                                if (count > 0) handleRandomPick(count, s._id);
                                                            }}
                                                        />
                                                        <span className="text-xs text-slate-600 font-bold">Qs</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-4 mb-3">
                                        <button
                                            onClick={() => setIsManualSelectorOpen(true)}
                                            className="p-4 bg-emerald-600 hover:bg-emerald-500 border border-emerald-500 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 group col-span-2"
                                        >
                                            <CheckSquare className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                            <span className="text-sm font-bold text-white">Browse Question Bank (PDF Uploads)</span>
                                            <span className="text-xs text-emerald-200">Pick specific questions from your library</span>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <button onClick={() => handleRandomPick(50)} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex flex-col items-center gap-2 transition-colors group">
                                            <Shuffle className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-slate-300">Random 50</span>
                                        </button>
                                        <button onClick={() => handleRandomPick(100)} className="p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex flex-col items-center gap-2 transition-colors group">
                                            <Shuffle className="w-6 h-6 text-purple-400 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-slate-300">Random 100</span>
                                        </button>
                                        <button onClick={() => setIsAIModalOpen(true)} className="p-4 bg-indigo-600 hover:bg-indigo-500 border border-indigo-500 rounded-xl flex flex-col items-center gap-2 transition-colors shadow-lg shadow-indigo-500/20 group">
                                            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
                                            <span className="text-xs font-bold text-white">AI Generator</span>
                                        </button>
                                    </div>

                                    {selectedQuestionIds.length > 0 && (
                                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <CheckSquare className="w-5 h-5" />
                                                <span className="font-bold">{selectedQuestionIds.length} Questions Ready</span>
                                            </div>
                                            <button onClick={() => setSelectedQuestionIds([])} className="text-xs underline hover:text-emerald-300">Clear</button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
