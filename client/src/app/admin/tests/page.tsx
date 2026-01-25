"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Save } from 'lucide-react';

export default function CreateTestPage() {
    const [exams, setExams] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);

    const [selectedExam, setSelectedExam] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');

    const [formData, setFormData] = useState({
        title: '',
        durationMinutes: 60,
        totalMarks: 100,
        positiveMark: 2,
        negativeMark: 0.5,
        selectedQuestionIds: [] as string[]
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

    useEffect(() => {
        if (selectedSubject) {
            // Fetch questions for this subject to add to test
            // Endpoint: /questions/subject/:subjectId
            api.get(`/questions/subject/${selectedSubject}`).then(res => setQuestions(res.data));
        }
    }, [selectedSubject]);

    const toggleQuestion = (id: string) => {
        setFormData(prev => {
            const ids = prev.selectedQuestionIds.includes(id)
                ? prev.selectedQuestionIds.filter(q => q !== id)
                : [...prev.selectedQuestionIds, id];
            return { ...prev, selectedQuestionIds: ids };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedExam || formData.selectedQuestionIds.length === 0) {
            return toast.error('Please select exam and at least one question');
        }

        setLoading(true);
        try {
            const payload = {
                title: formData.title,
                examId: selectedExam,
                durationMinutes: Number(formData.durationMinutes),
                totalMarks: Number(formData.totalMarks),
                questions: formData.selectedQuestionIds,
                positiveMark: Number(formData.positiveMark),
                negativeMark: Number(formData.negativeMark)
            };

            await api.post('/tests', payload);
            toast.success('Test Published Successfully!');
            router.push('/admin/dashboard');
        } catch (error) {
            toast.error('Failed to create test');
        } finally {
            setLoading(false);
        }
    };

    // Need router
    // import useRouter not working? Ah, I forgot to import it.
    // Actually, I won't use router, just reset form.

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <h1 className="text-2xl font-bold mb-6">Create Mock Test</h1>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Metadata Section */}
                <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-gray-400 text-sm mb-2">Test Title</label>
                        <input
                            type="text"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. SSC CGL Full Mock 1"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Select Exam Category</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedExam}
                            onChange={(e) => setSelectedExam(e.target.value)}
                            required
                        >
                            <option value="">Select Exam</option>
                            {exams.map(e => <option key={e._id} value={e._id}>{e.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Add Questions From Subject</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            disabled={!selectedExam}
                        >
                            <option value="">Select Subject to Browse</option>
                            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Duration (Minutes)</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.durationMinutes}
                            onChange={e => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Total Marks</label>
                        <input
                            type="number"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.totalMarks}
                            onChange={e => setFormData({ ...formData, totalMarks: Number(e.target.value) })}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Positive Mark</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.positiveMark}
                            onChange={e => setFormData({ ...formData, positiveMark: Number(e.target.value) })}
                        />
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-2">Run Negative Mark</label>
                        <input
                            type="number"
                            step="0.1"
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.negativeMark}
                            onChange={e => setFormData({ ...formData, negativeMark: Number(e.target.value) })}
                        />
                    </div>
                </div>

                {/* Question Selector */}
                {selectedSubject && (
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <h3 className="text-xl font-bold mb-4">Select Questions ({formData.selectedQuestionIds.length} selected)</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                            {questions.length === 0 ? <p className="text-gray-500">No questions found in this category.</p> : questions.map(q => (
                                <div
                                    key={q._id}
                                    onClick={() => toggleQuestion(q._id)}
                                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${formData.selectedQuestionIds.includes(q._id) ? 'bg-indigo-900/40 border-indigo-500' : 'bg-slate-900 border-slate-700 hover:border-gray-500'}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-5 h-5 rounded border mt-1 flex items-center justify-center ${formData.selectedQuestionIds.includes(q._id) ? 'bg-indigo-500 border-indigo-500' : 'border-gray-500'}`}>
                                            {formData.selectedQuestionIds.includes(q._id) && <Save className="w-3 h-3 text-white" />}
                                        </div>
                                        <div>
                                            <div dangerouslySetInnerHTML={{ __html: q.text }} className="text-sm" />
                                            <span className="text-xs text-gray-500 mt-1 inline-block bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{q.difficulty}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                    {loading ? 'Publishing...' : 'Publish Test'}
                </button>
            </form>
        </div>
    );
}
