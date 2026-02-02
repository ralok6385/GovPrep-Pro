"use client";

import { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface EditTestModalProps {
    isOpen: boolean;
    onClose: () => void;
    test: any;
    onUpdate: (updatedTest: any) => void;
    exams: any[];
}

export default function EditTestModal({ isOpen, onClose, test, onUpdate, exams }: EditTestModalProps) {
    const [formData, setFormData] = useState({
        title: '',
        type: 'exam',
        examId: '',
        durationMinutes: 60,
        totalMarks: 100,
        positiveMark: 2,
        negativeMark: 0.5,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (test) {
            setFormData({
                title: test.title || '',
                type: test.type || 'exam',
                examId: test.examId?._id || test.examId || '',
                durationMinutes: test.durationMinutes || 60,
                totalMarks: test.totalMarks || 100,
                positiveMark: test.positiveMark || 2,
                negativeMark: test.negativeMark || 0.5,
            });
        }
    }, [test]);

    if (!isOpen || !test) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await api.put(`/tests/${test._id}`, formData);
            toast.success('Test updated successfully');
            onUpdate(data);
            onClose();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update test');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                    <h2 className="text-xl font-bold text-white">Edit Test Details</h2>
                    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Test Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

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
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Exam Category</label>
                        <select
                            required
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                            value={formData.examId}
                            onChange={(e) => setFormData({ ...formData, examId: e.target.value })}
                        >
                            <option value="">Select Category</option>
                            {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                        {!formData.examId && (
                            <div className="mt-2 flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase">
                                <AlertCircle className="w-3 h-3" /> Mandatory for visibility
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Duration (min)</label>
                            <input
                                type="number"
                                required
                                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.durationMinutes}
                                onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Total Marks</label>
                            <input
                                type="number"
                                required
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
                                required
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
                                required
                                className="w-full bg-slate-950 border border-red-900/30 rounded-xl p-3 text-red-400 focus:ring-2 focus:ring-red-500 outline-none"
                                value={formData.negativeMark}
                                onChange={e => setFormData({ ...formData, negativeMark: Number(e.target.value) })}
                            />
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-slate-800 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-[2] px-4 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                    >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
