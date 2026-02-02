"use client";

import { useState, useEffect } from 'react';
import { BookOpen, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function ExamsPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);

    const [newExam, setNewExam] = useState({
        name: '',
        description: '',
        slug: ''
    });

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            const { data } = await api.get('/exams');
            setExams(data);
        } catch (error) {
            toast.error('Failed to load exams');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newExam.name) return toast.error('Exam name is required');

        try {
            // Auto-generate slug if empty
            const payload = {
                ...newExam,
                slug: newExam.slug || newExam.name.toLowerCase().replace(/ /g, '-')
            };

            await api.post('/exams', payload);
            toast.success('Exam created successfully');
            setNewExam({ name: '', description: '', slug: '' });
            setShowAddForm(false);
            fetchExams();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create exam');
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/exams/${deleteId}`);
            toast.success('Exam deleted');
            setDeleteId(null);
            fetchExams();
        } catch (error) {
            toast.error('Failed to delete exam');
        } finally {
            setDeleteLoading(false);
        }
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading exams...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Exam Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Create and manage exam categories (SSC, Banking, UPSC).</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> {showAddForm ? 'Cancel' : 'Add Exam'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-200/50 mb-8 animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4">Add New Exam</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Exam Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. RRB NTPC"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={newExam.name}
                                    onChange={e => setNewExam({ ...newExam, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Description (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Technical and Non-Technical Posts"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                    value={newExam.description}
                                    onChange={e => setNewExam({ ...newExam, description: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                                Save Exam
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Exams Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {exams.map(exam => (
                    <div key={exam._id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => handleDelete(exam._id)}
                                className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
                            <BookOpen className="w-6 h-6 text-indigo-600" />
                        </div>

                        <h3 className="font-bold text-slate-800 text-lg mb-1">{exam.name}</h3>
                        <p className="text-slate-500 text-sm mb-4 line-clamp-2">{exam.description || 'No description provided.'}</p>

                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg w-max">
                            <CheckCircle2 className="w-3 h-3" /> Active
                        </div>
                    </div>
                ))}
            </div>

            {exams.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No exams found. Start by adding one!</p>
                </div>
            )}

            {/* Delete Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl border border-slate-200 transform scale-100 animate-in zoom-in-95 duration-200">
                        <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Delete Exam?</h3>
                            <p className="text-slate-500 text-sm text-center mb-6">
                                Are you sure you want to delete this exam? This will also delete all linked <strong>subjects, content, and tests</strong>.
                            </p>
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    disabled={deleteLoading}
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {deleteLoading ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
