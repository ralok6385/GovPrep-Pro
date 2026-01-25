"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Plus, Save } from 'lucide-react';

interface Subject {
    _id: string;
    name: string;
}

export default function QuestionsPage() {
    // We need to fetch Subjects first to populate dropdown.
    // But wait, getSubjects requires examId.
    // Admin might need to select Exam -> Subject -> Add Question.
    // For simplicity, I will first fetch all exams, then subjects.
    // Or I assume I pass subjectId manually or simplify.
    // I'll make a two-step selector: Select Exam -> Select Subject.

    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [formData, setFormData] = useState({
        text: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
        difficulty: 'medium'
    });

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        api.get('/exams').then(res => setExams(res.data));
    }, []);

    useEffect(() => {
        if (selectedExam) {
            api.get(`/exams/${selectedExam}/subjects`).then(res => setSubjects(res.data));
        }
    }, [selectedExam]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSubject) return toast.error('Please select a subject');
        setLoading(true);

        try {
            const payload = {
                text: formData.text,
                options: [
                    { id: 'A', text: formData.optionA },
                    { id: 'B', text: formData.optionB },
                    { id: 'C', text: formData.optionC },
                    { id: 'D', text: formData.optionD },
                ],
                correctOption: formData.correctOption,
                explanation: formData.explanation,
                subjectId: selectedSubject,
                difficulty: formData.difficulty
            };

            await api.post('/questions', payload);
            toast.success('Question added successfully!');
            // Reset form usually
            setFormData({
                ...formData,
                text: '',
                optionA: '',
                optionB: '',
                optionC: '',
                optionD: '',
                explanation: ''
            });
        } catch (error) {
            toast.error('Failed to add question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Add New Question</h1>

            <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 mb-8">
                <label className="block text-gray-400 text-sm mb-2">Category Selection</label>
                <div className="grid grid-cols-2 gap-4">
                    <select
                        className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedExam}
                        onChange={(e) => setSelectedExam(e.target.value)}
                    >
                        <option value="">Select Exam</option>
                        {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                    </select>

                    <select
                        className="bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        disabled={!selectedExam}
                    >
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-2xl border border-slate-700 space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Question Text (HTML supported)</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[100px]"
                        placeholder="e.g. What is the capital of India?"
                        value={formData.text}
                        onChange={e => setFormData({ ...formData, text: e.target.value })}
                        required
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['A', 'B', 'C', 'D'].map((opt) => (
                        <div key={opt}>
                            <label className="block text-xs font-medium text-gray-400 mb-1">Option {opt}</label>
                            <input
                                type="text"
                                className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                //@ts-ignore
                                value={formData[`option${opt}`]}
                                //@ts-ignore
                                onChange={e => setFormData({ ...formData, [`option${opt}`]: e.target.value })}
                                required
                            />
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Correct Option</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.correctOption}
                            onChange={e => setFormData({ ...formData, correctOption: e.target.value })}
                        >
                            {['A', 'B', 'C', 'D'].map(o => <option key={o} value={o}>Option {o}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Difficulty</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.difficulty}
                            onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Explanation</label>
                    <textarea
                        className="w-full bg-slate-900 border border-slate-600 rounded-lg p-4 text-white focus:ring-2 focus:ring-indigo-500 outline-none min-h-[80px]"
                        placeholder="Explain why the answer is correct..."
                        value={formData.explanation}
                        onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                    />
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : <><Save className="w-5 h-5" /> Save Question</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
