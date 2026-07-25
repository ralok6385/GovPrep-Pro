"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import {
    Plus, Search, Edit2, Trash2, Eye, EyeOff,
    CheckCircle2, AlertCircle, FileText, Clock, BarChart3
} from 'lucide-react';
import Link from 'next/link';
import DeleteConfirmationModal from '@/components/Admin/DeleteConfirmationModal';
import EditTestModal from '@/components/Admin/EditTestModal';

export default function TestManagerPage() {
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
    const [editingTest, setEditingTest] = useState<any>(null);
    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        fetchTests();
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/exams');
            setExams(data);
        } catch (error) {
            console.error('Failed to load exams', error);
        }
    };

    const fetchTests = async () => {
        try {
            const { data } = await api.get('/tests'); // Now returns ALL tests for admin
            setTests(data);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load tests');
        } finally {
            setLoading(false);
        }
    };

    const togglePublish = async (testId: string, currentStatus: boolean) => {
        try {
            const { data } = await api.put(`/tests/${testId}`, { isPublished: !currentStatus });
            setTests(tests.map(t => t._id === testId ? { ...t, isPublished: data.isPublished } : t));
            toast.success(data.isPublished ? 'Test Published!' : 'Test Un-published (Draft Mode)');
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const confirmDelete = async () => {
        if (!showDeleteModal) return;
        try {
            await api.delete(`/tests/${showDeleteModal}`);
            setTests(tests.filter(t => t._id !== showDeleteModal));
            toast.success('Test deleted');
            setShowDeleteModal(null);
        } catch (error) {
            toast.error('Failed to delete test');
        }
    };

    const filteredTests = tests.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (t.examId?.name && t.examId.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                onConfirm={confirmDelete}
                title="Delete Test Series?"
                description="This action cannot be undone. All student results for this test will be lost."
            />

            <EditTestModal
                isOpen={!!editingTest}
                onClose={() => setEditingTest(null)}
                test={editingTest}
                exams={exams}
                onUpdate={(updatedTest) => {
                    setTests(tests.map(t => t._id === updatedTest._id ? updatedTest : t));
                }}
            />

            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Test Series Builder</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Create, publish, and manage full mock exams and daily quizzes.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/tests/builder"
                        className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Visual Test Builder
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Published Exams</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{tests.filter(t => t.isPublished).length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                        <CheckCircle2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Draft Exams</p>
                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{tests.filter(t => !t.isPublished).length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                        <Edit2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Test Series</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{tests.length}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <BarChart3 className="w-5 h-5" />
                    </div>
                </div>
            </div>


            {/* List */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
                    <Search className="w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search tests by title or exam..."
                        className="bg-transparent border-none outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-400 flex-1"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/80 dark:bg-slate-950/50 text-slate-500 text-[10px] font-black uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                                <th className="p-4">Test Title</th>
                                <th className="p-4">Configuration</th>
                                <th className="p-4">Questions</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">

                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading tests...</td></tr>
                            ) : filteredTests.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No tests found.</td></tr>
                            ) : filteredTests.map(test => (
                                <tr key={test._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200">{test.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-semibold">
                                                {test.examId?.name || (test.exam?.name) || 'No Exam'}
                                            </span>
                                            <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded font-black uppercase">{test.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-xs text-slate-600 dark:text-slate-400 font-medium">
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-400" /> {test.duration}m</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {test.questionsCount > 0 ? (
                                            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-900">
                                                {test.questionsCount} Qs
                                            </span>
                                        ) : (
                                            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-lg border border-rose-200 dark:border-rose-900 flex items-center gap-1 w-fit">
                                                <AlertCircle className="w-3 h-3" /> 0 Qs
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePublish(test._id, test.isPublished)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
                                                test.isPublished
                                                    ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900'
                                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700'
                                            }`}
                                        >
                                            {test.isPublished ? <><Eye className="w-3.5 h-3.5" /> Published</> : <><EyeOff className="w-3.5 h-3.5" /> Draft</>}
                                        </button>
                                    </td>

                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditingTest(test)}
                                                className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                                                title="Edit Details"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setShowDeleteModal(test._id)}
                                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                title="Delete Test"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
