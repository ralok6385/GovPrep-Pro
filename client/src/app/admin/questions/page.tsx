"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Search, Filter, Trash2, Edit, UploadCloud, Clock } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import DeleteConfirmationModal from '@/components/Admin/DeleteConfirmationModal';
import { formatDistanceToNow } from 'date-fns';

export default function QuestionsPage() {
    const [questions, setQuestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
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

    const isNew = (date: string) => {
        const added = new Date(date).getTime();
        const now = new Date().getTime();
        return (now - added) < (24 * 60 * 60 * 1000); // 24 hours
    };

    const handleDelete = (id: string) => {
        setShowDeleteModal(id);
    };

    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        try {
            await api.delete(`/questions/${showDeleteModal}`);
            setQuestions(prev => prev.filter(q => q._id !== showDeleteModal));
            toast.success('Question deleted');
            setShowDeleteModal(null);
        } catch (error) {
            toast.error('Failed to delete question');
        }
    };

    const filteredQuestions = questions.filter(q =>
        q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto h-[calc(100vh-20px)] flex flex-col">
            <DeleteConfirmationModal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                onConfirm={confirmDelete}
                title="Delete Question?"
                description="Are you sure you want to delete this question? This action cannot be undone."
            />
            <div className="flex justify-between items-center mb-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-2xl font-bold text-slate-800">Question Bank</h1>
                        {questions.filter(q => isNew(q.createdAt)).length > 0 && (
                            <span className="bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-bounce shadow-lg shadow-indigo-500/30">
                                {questions.filter(q => isNew(q.createdAt)).length} NEW TODAY
                            </span>
                        )}
                    </div>
                    <p className="text-slate-500 text-sm font-medium">Manage all your practice questions here.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/questions/upload" className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-50 transition-colors font-medium">
                        <UploadCloud className="w-4 h-4" /> Bulk Upload
                    </Link>
                    <Link href="/admin/questions/add" className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-500/20">
                        <Plus className="w-4 h-4" /> Add Question
                    </Link>
                </div>
            </div>

            {/* Config / Filters Row */}
            <div className="flex gap-4 mb-6 shrink-0">
                <div className="flex-1 relative">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search questions by text or subject..."
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="bg-white px-4 py-3 rounded-xl border border-slate-200 flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium">
                    <Filter className="w-5 h-5" /> Filters
                </button>
            </div>

            {/* Questions Table/List */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col">
                <div className="overflow-y-auto flex-1 p-2">
                    {loading ? (
                        <div className="text-center py-20 text-slate-400">Loading Question Bank...</div>
                    ) : filteredQuestions.length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            No questions found. Try adding some!
                        </div>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead className="bg-slate-50/50 text-slate-500 text-[10px] uppercase font-black tracking-widest sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                    <th className="p-4 border-b border-slate-100 rounded-tl-xl">Question Text</th>
                                    <th className="p-4 border-b border-slate-100">Subject & Topic</th>
                                    <th className="p-4 border-b border-slate-100">Difficulty</th>
                                    <th className="p-4 border-b border-slate-100 text-indigo-600">Added</th>
                                    <th className="p-4 border-b border-slate-100 text-right rounded-tr-xl">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredQuestions.map((q) => (
                                    <tr key={q._id} className="hover:bg-slate-50/80 group transition-all">
                                        <td className="p-4 w-1/3">
                                            <div className="flex items-start gap-2">
                                                {isNew(q.createdAt) && (
                                                    <span className="shrink-0 bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 animate-pulse tracking-tighter">NEW</span>
                                                )}
                                                <p className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug">{q.text}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-black text-[10px] uppercase tracking-widest text-indigo-500 bg-indigo-50/50 inline-block px-2.5 py-1 rounded-full border border-indigo-100 mb-1.5">
                                                {q.subjectId?.name || 'Uncategorized'}
                                            </p>
                                            <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                                {q.topic || 'General Topic'}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm
                                                ${q.difficulty === 'hard' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                                    q.difficulty === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                        'bg-emerald-50 text-emerald-600 border-emerald-100'}`}>
                                                {q.difficulty || 'Easy'}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                                                    <Clock className="w-3 h-3 text-slate-400" />
                                                    {formatDistanceToNow(new Date(q.createdAt), { addSuffix: true })}
                                                </span>
                                                <span className="text-[9px] text-slate-400 font-medium">
                                                    {new Date(q.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                <Link href={`/admin/questions/add?edit=${q._id}`} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-xl transition-all block">
                                                    <Edit className="w-4 h-4" />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(q._id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
                <div className="p-4 border-t bg-slate-50 text-xs text-slate-500 flex justify-between">
                    <span>Showing {filteredQuestions.length} questions</span>
                    <span>Page 1 of 1</span>
                </div>
            </div>
        </div>
    );
}
