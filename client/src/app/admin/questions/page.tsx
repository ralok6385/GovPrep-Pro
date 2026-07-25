"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search, Filter, Trash2, Edit, UploadCloud, Clock, CheckCircle, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/Admin/DeleteConfirmationModal';
import { formatDistanceToNow } from 'date-fns';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            const { data } = await api.get('/questions?limit=200');
            setQuestions(Array.isArray(data) ? data : data.questions || []);
        } catch (error) {
            console.error('Failed to load questions', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setShowDeleteModal(id);
    };

    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        try {
            await api.delete(`/questions/${showDeleteModal}`);
            setQuestions(prev => prev.filter(q => q._id !== showDeleteModal));
            toast.success('Question deleted successfully');
            setShowDeleteModal(null);
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const filteredQuestions = questions.filter(q => {
        const matchesSearch = q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDifficulty = difficultyFilter === 'all' || q.difficulty?.toLowerCase() === difficultyFilter.toLowerCase();
        return matchesSearch && matchesDifficulty;
    });

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            <DeleteConfirmationModal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                onConfirm={confirmDelete}
                title="Delete Question?"
                description="Are you sure you want to delete this question? This will permanently remove it from all test series."
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Question Bank Repository</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Manage TCS pattern questions, explanations, and subject tags.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/admin/questions/upload" className="px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-2 hover:border-indigo-500 transition-all shadow-sm">
                        <UploadCloud className="w-4 h-4 text-indigo-600" /> Bulk CSV/JSON Import
                    </Link>
                    <Link href="/admin/questions/add" className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all">
                        <Plus className="w-4 h-4" /> Add New Question
                    </Link>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search question content or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'easy', 'medium', 'hard'].map(level => (
                        <button
                            key={level}
                            onClick={() => setDifficultyFilter(level)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                                difficultyFilter === level
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-800 hover:border-indigo-400'
                            }`}
                        >
                            {level}
                        </button>
                    ))}
                </div>
            </div>

            {/* Questions Table List */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                </div>
            ) : filteredQuestions.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200/80 dark:border-slate-800">
                    <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Questions Found</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Try resetting your search filter or click "Add New Question".</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
                    <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
                        {filteredQuestions.map((q, idx) => (
                            <div key={q._id} className="p-4 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors flex items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                            {q.subjectId?.name || 'General'}
                                        </span>
                                        {q.difficulty && (
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase ${
                                                q.difficulty.toLowerCase() === 'easy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400' :
                                                q.difficulty.toLowerCase() === 'medium' ? 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400' :
                                                'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400'
                                            }`}>
                                                {q.difficulty}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                                        {q.text}
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleDelete(q._id)}
                                        aria-label="Delete question"
                                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
