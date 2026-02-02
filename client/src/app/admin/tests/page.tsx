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
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            {/* Delete Confirmation Modal */}
            <DeleteConfirmationModal
                isOpen={!!showDeleteModal}
                onClose={() => setShowDeleteModal(null)}
                onConfirm={confirmDelete}
                title="Delete Test?"
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
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-white mb-2">Manage Tests</h1>
                    <p className="text-slate-400 text-sm">Create, publish, and monitor your mock tests.</p>
                </div>
                <div className="flex gap-3">
                    <Link
                        href="/admin/tests/builder"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                    >
                        <Plus className="w-5 h-5" /> Visual Builder
                    </Link>
                    <Link
                        href="/admin/tests/create"
                        className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold px-6 py-3 rounded-xl border border-slate-700 flex items-center gap-2 transition-all"
                    >
                        Legacy Creator
                    </Link>
                </div>
            </div>

            {/* Metrics */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><CheckCircle2 className="w-6 h-6" /></div>
                        <h3 className="font-bold text-slate-300">Published</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{tests.filter(t => t.isPublished).length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-slate-700/50 rounded-lg text-slate-400"><Edit2 className="w-6 h-6" /></div>
                        <h3 className="font-bold text-slate-300">Drafts</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{tests.filter(t => !t.isPublished).length}</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-500"><BarChart3 className="w-6 h-6" /></div>
                        <h3 className="font-bold text-slate-300">Total Exams</h3>
                    </div>
                    <p className="text-3xl font-bold text-white">{tests.length}</p>
                </div>
            </div>

            {/* List */}
            <div className="max-w-7xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex items-center gap-4">
                    <Search className="w-5 h-5 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search tests..."
                        className="bg-transparent border-none outline-none text-white placeholder:text-slate-600 flex-1"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-950/50 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-800">
                                <th className="p-4">Test Title</th>
                                <th className="p-4">Configuration</th>
                                <th className="p-4">Questions</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {loading ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading tests...</td></tr>
                            ) : filteredTests.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-500">No tests found.</td></tr>
                            ) : filteredTests.map(test => (
                                <tr key={test._id} className="hover:bg-slate-800/50 transition-colors group">
                                    <td className="p-4">
                                        <p className="font-bold text-white">{test.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
                                                {test.examId?.name || (test.exam?.name) || 'No Exam'}
                                            </span>
                                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded uppercase">{test.type}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-slate-400">
                                        <div className="flex items-center gap-4">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}m</span>
                                            {/* <span className="flex items-center gap-1"><Award className="w-3 h-3" /> {test.totalMarks}</span> */}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {test.questionsCount > 0 ? (
                                            <span className="text-sm font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg">
                                                {test.questionsCount} Qs
                                            </span>
                                        ) : (
                                            <span className="text-sm font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-lg flex items-center gap-1 w-fit">
                                                <AlertCircle className="w-3 h-3" /> 0 Qs
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => togglePublish(test._id, test.isPublished)}
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border
                                                ${test.isPublished
                                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'}`}
                                        >
                                            {test.isPublished ? <><Eye className="w-3 h-3" /> Published</> : <><EyeOff className="w-3 h-3" /> Draft</>}
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
