"use client";

import { useState, useEffect } from 'react';
import { Library, Plus, Trash2, Search, BookOpen } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<any[]>([]);
    const [exams, setExams] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [showAddForm, setShowAddForm] = useState(false);
    const [newSubject, setNewSubject] = useState({ name: '', examId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [subjectsRes, examsRes] = await Promise.all([
                api.get('/subjects?all=true'),
                api.get('/exams')
            ]);
            setSubjects(subjectsRes.data);
            setExams(examsRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newSubject.name) {
            return toast.error('Please enter subject name');
        }

        // Sanitize name (Title Case)
        const sanitizedName = newSubject.name.trim().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');

        const payload = {
            name: sanitizedName,
            examId: newSubject.examId === '' ? null : newSubject.examId
        };

        try {
            await api.post('/subjects', payload);
            toast.success(payload.examId ? 'Subject added to exam!' : 'Common subject added!');
            setNewSubject({ name: '', examId: '' });
            setShowAddForm(false);
            fetchData(); // Refresh list
        } catch (error: any) {
            console.error('Create failed:', error);
            const msg = error?.response?.data?.message || 'Failed to create subject';
            toast.error(msg);
        }
    };

    const [deleteModal, setDeleteModal] = useState<{ show: boolean, id: string | null }>({ show: false, id: null });

    const handleDeleteClick = (id: string, e: any) => {
        e.stopPropagation();
        setDeleteModal({ show: true, id });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;

        try {
            await api.delete(`/subjects/${deleteModal.id}`);
            toast.success('Subject deleted successfully');
            setDeleteModal({ show: false, id: null });
            fetchData();
        } catch (error: any) {
            console.error('Delete failed:', error);
            const msg = error?.response?.data?.message || 'Failed to delete subject';
            alert(`Error: ${msg}`); // Fallback
            toast.error(msg);
        }
    };

    const getExamName = (subject: any) => {
        // If subject.examId is populated object
        if (subject.examId && typeof subject.examId === 'object' && subject.examId.name) {
            return subject.examId.name;
        }
        // Fallback for older data or if population failed
        return 'Global Subject';
    };

    if (loading) return <div className="p-12 text-center text-slate-500">Loading modules...</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 relative">
            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl scale-100 transform transition-all">
                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                            <Trash2 className="w-6 h-6" />
                        </div>
                        <h3 className="text-xl font-bold text-center text-slate-800 mb-2">Delete Subject?</h3>
                        <p className="text-slate-500 text-center text-sm mb-6">
                            Are you sure you want to remove this subject? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteModal({ show: false, id: null })}
                                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-500/30 transition-colors"
                            >
                                Yes, Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Subject Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Organize study topics by exam category.</p>
                </div>
                <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all"
                >
                    <Plus className="w-5 h-5" /> {showAddForm ? 'Cancel' : 'Add Subject'}
                </button>
            </div>

            {/* Add Form */}
            {showAddForm && (
                <div className="bg-white p-6 rounded-2xl border border-indigo-100 shadow-lg shadow-indigo-200/50 mb-8 animate-fade-in">
                    <h3 className="font-bold text-slate-800 mb-4">Add New Subject</h3>
                    <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-1/3">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Parent Exam</label>
                            <select
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={newSubject.examId}
                                onChange={e => setNewSubject({ ...newSubject, examId: e.target.value })}
                            >
                                <option value="">Select Exam Category</option>
                                <option value="" className="text-indigo-600 font-bold">🌍 Global / Common to All Exams</option>
                                {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                            </select>
                        </div>
                        <div className="w-full sm:w-1/2">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Subject Name</label>
                            <input
                                type="text"
                                placeholder="e.g. Ancient History"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                                value={newSubject.name}
                                onChange={e => setNewSubject({ ...newSubject, name: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20">
                            Save
                        </button>
                    </form>
                </div>
            )}

            {/* Subjects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map(subject => (
                    <div key={subject._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-indigo-600" />
                            </div>
                            <button
                                type="button"
                                onClick={(e) => handleDeleteClick(subject._id, e)}
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-50 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all border border-slate-100"
                                title="Delete Subject"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg mb-1">{subject.name}</h3>
                        <div className={`inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${!subject.examId ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-slate-50 text-slate-500 border-slate-100'}`}>
                            {getExamName(subject)}
                        </div>
                    </div>
                ))}
            </div>

            {subjects.length === 0 && !loading && (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-medium">No subjects found. Add one above!</p>
                </div>
            )}
        </div>
    );
}
