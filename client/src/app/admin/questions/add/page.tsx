"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { ArrowLeft, Save, Plus, X, Languages, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AddQuestionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const isEditMode = !!editId;

    const [loading, setLoading] = useState(false);
    const [translating, setTranslating] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        text: '',
        textHindi: '',
        subject: '',
        topic: '',
        difficulty: 'medium',
        options: ['', '', '', ''],
        optionsHindi: ['', '', '', ''],
        correctOption: 0,
        explanation: '',
        explanationHindi: ''
    });

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const { data } = await api.get('/subjects?all=true');
                setSubjects(data);
                // Only default if NOT editing
                if (data.length > 0 && !editId) setFormData(prev => ({ ...prev, subject: data[0]._id }));
            } catch (e) {
                console.error(e);
            }
        };
        fetchSubjects();
    }, [editId]);

    // Fetch Question Data for Edit Mode
    useEffect(() => {
        if (!editId) return;
        const fetchQuestion = async () => {
            try {
                const { data } = await api.get(`/questions/${editId}`);
                // Transform API data to Form Data
                setFormData({
                    text: data.text,
                    textHindi: data.textHindi || '',
                    subject: data.subjectId?._id || data.subjectId || '',
                    topic: data.topic || '',
                    difficulty: data.difficulty || 'medium',
                    options: data.options.map((o: any) => o.text),
                    optionsHindi: data.options.map((o: any) => o.textHindi || ''),
                    correctOption: data.correctOption.charCodeAt(0) - 65, // "A" -> 0
                    explanation: data.explanation || '',
                    explanationHindi: data.explanationHindi || ''
                });
            } catch (error) {
                toast.error('Failed to load question for editing');
                router.push('/admin/questions');
            }
        };
        fetchQuestion();
    }, [editId, router]);

    const handleOptionChange = (value: string, index: number, isHindi = false) => {
        if (isHindi) {
            const newOptions = [...formData.optionsHindi];
            newOptions[index] = value;
            setFormData({ ...formData, optionsHindi: newOptions });
        } else {
            const newOptions = [...formData.options];
            newOptions[index] = value;
            setFormData({ ...formData, options: newOptions });
        }
    };

    const handleTranslate = async () => {
        if (!formData.text) {
            toast.error('Please enter English Question Text first');
            return;
        }

        setTranslating(true);
        const toastId = toast.loading('Translating to Hindi...');

        try {
            const payload = {
                sourceLang: 'en',
                targetLang: 'hi',
                content: {
                    text: formData.text,
                    options: formData.options,
                    explanation: formData.explanation
                }
            };

            const { data } = await api.post('/ai/translate', payload);

            setFormData(prev => ({
                ...prev,
                textHindi: data.text || prev.textHindi,
                optionsHindi: data.options || prev.optionsHindi,
                explanationHindi: data.explanation || prev.explanationHindi
            }));

            toast.success('Translated successfully!', { id: toastId });
        } catch (error) {
            console.error(error);
            toast.error('Translation failed', { id: toastId });
        } finally {
            setTranslating(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Construct payload matching the new Schema
            const payload = {
                text: formData.text,
                textHindi: formData.textHindi,
                subject: formData.subject,
                topic: formData.topic,
                difficulty: formData.difficulty,
                options: formData.options.map((opt, i) => ({
                    id: String.fromCharCode(65 + i), // A, B, C, D
                    text: opt,
                    textHindi: formData.optionsHindi[i] // Merge Hindi
                })),
                correctOption: String.fromCharCode(65 + formData.correctOption), // "A", "B"...
                explanation: formData.explanation,
                explanationHindi: formData.explanationHindi
            };

            if (isEditMode) {
                await api.put(`/questions/${editId}`, payload);
                toast.success('Question updated successfully!');
                router.push('/admin/questions'); // Go back after edit
            } else {
                await api.post('/questions', payload);
                toast.success('Question added successfully!');

                // Reset form ONLY for Add Mode
                setFormData(prev => ({
                    ...prev,
                    text: '',
                    textHindi: '',
                    options: ['', '', '', ''],
                    optionsHindi: ['', '', '', ''],
                    correctOption: 0,
                    explanation: '',
                    explanationHindi: ''
                }));
            }
        } catch (error) {
            toast.error(isEditMode ? 'Failed to update question' : 'Failed to add question');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <Link href="/admin/questions" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Bank
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Side */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-xl font-bold text-slate-800">{isEditMode ? 'Edit Question' : 'Add New Question'}</h1>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleTranslate}
                                    disabled={translating}
                                    type="button"
                                    className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg text-xs font-bold shadow-md hover:opacity-90 transition-all disabled:opacity-50"
                                >
                                    {translating ? <Sparkles className="w-3 h-3 animate-spin" /> : <Languages className="w-3 h-3" />}
                                    {translating ? 'Translating...' : 'Auto Translate'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        const raw = formData.text;
                                        // Regex to find options pattern like "A) ", "A. ", "(A) "
                                        const optionRegex = /(?:^|\n)\s*(?:[A-D]|[a-d])[\.)\s]\s*/g;
                                        const parts = raw.split(optionRegex);

                                        if (parts.length > 1) {
                                            const questionText = parts[0].trim();
                                            // Extract potential options (up to 4)
                                            // The split removes the delimiters, so we need to be careful.
                                            // Better approach: Match strictly lines starting with A, B, C, D

                                            // Let's try a line-by-line parser
                                            const lines = raw.split('\n');
                                            let q = "";
                                            const opts = ["", "", "", ""];
                                            let currentOptIdx = -1;

                                            lines.forEach(line => {
                                                const trimLine = line.trim();
                                                const match = trimLine.match(/^([A-Da-d])[\.\)]\s+(.*)/);

                                                if (match) {
                                                    // It's an option
                                                    const letter = match[1].toUpperCase();
                                                    const content = match[2];
                                                    const map: { [key: string]: number } = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 };
                                                    if (map[letter] !== undefined) {
                                                        currentOptIdx = map[letter];
                                                        opts[currentOptIdx] = content;
                                                    }
                                                } else {
                                                    // It's part of the previous bucket
                                                    if (currentOptIdx === -1) {
                                                        q += line + "\n";
                                                    } else {
                                                        opts[currentOptIdx] += " " + trimLine;
                                                    }
                                                }
                                            });

                                            setFormData({
                                                ...formData,
                                                text: q.trim(),
                                                options: opts.map(o => o.trim() || "")
                                            });
                                            toast.success("Smart Parsed Question & Options!");
                                        } else {
                                            toast.error("No options format (A. B. C. D.) found in text.");
                                        }
                                    }}
                                    className="flex items-center gap-2 px-3 py-1.5 bg-white border border-indigo-200 text-indigo-700 rounded-lg text-xs font-bold shadow-sm hover:bg-indigo-50 transition-all"
                                >
                                    ✨ Smart Parse
                                </button>
                                <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded font-medium">Single Entry</span>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Question Text */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Question (English)</label>
                                    <textarea
                                        required
                                        rows={4}
                                        placeholder="Type question in English..."
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg"
                                        value={formData.text}
                                        onChange={e => setFormData({ ...formData, text: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Question (Hindi) <span className="text-xs font-normal text-slate-400">Optional</span></label>
                                    <textarea
                                        rows={4}
                                        placeholder="प्रश्न हिंदी में टाइप करें..."
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-hindi"
                                        value={formData.textHindi}
                                        onChange={e => setFormData({ ...formData, textHindi: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                <label className="block text-sm font-bold text-slate-700 mb-2">Options</label>
                                {formData.options.map((opt, idx) => (
                                    <div key={idx} className="flex flex-col md:flex-row gap-2 items-start md:items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div
                                            onClick={() => setFormData({ ...formData, correctOption: idx })}
                                            className={`w-8 h-8 rounded-full border-2 flex shrink-0 items-center justify-center cursor-pointer transition-colors
                                                ${formData.correctOption === idx
                                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 font-bold'
                                                    : 'border-slate-200 text-slate-400 hover:border-slate-300'}`}
                                        >
                                            {String.fromCharCode(65 + idx)}
                                        </div>
                                        <input
                                            type="text"
                                            required
                                            placeholder={`Option ${String.fromCharCode(65 + idx)} (English)`}
                                            className="flex-1 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                                            value={opt}
                                            onChange={e => handleOptionChange(e.target.value, idx)}
                                        />
                                        <input
                                            type="text"
                                            placeholder={`विकल्प ${String.fromCharCode(65 + idx)} (Hindi)`}
                                            className="flex-1 w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-hindi"
                                            value={formData.optionsHindi[idx]}
                                            onChange={e => handleOptionChange(e.target.value, idx, true)}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Explanation */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Explanation (English)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="Explain the answer..."
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                                        value={formData.explanation}
                                        onChange={e => setFormData({ ...formData, explanation: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Explanation (Hindi)</label>
                                    <textarea
                                        rows={3}
                                        placeholder="उत्तर की व्याख्या करें..."
                                        className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm font-hindi"
                                        value={formData.explanationHindi}
                                        onChange={e => setFormData({ ...formData, explanationHindi: e.target.value })}
                                    />
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-50">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Subject</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        value={formData.subject}
                                        onChange={e => setFormData({ ...formData, subject: e.target.value })}
                                    >
                                        {subjects.map(s => <option key={s._id} value={s._id}>{s.name} ({s.examId?.name || 'General'})</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Topic</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Algebra"
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        value={formData.topic}
                                        onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 mb-1">Difficulty</label>
                                    <select
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        value={formData.difficulty}
                                        onChange={e => setFormData({ ...formData, difficulty: e.target.value })}
                                    >
                                        <option value="easy">Easy</option>
                                        <option value="medium">Medium</option>
                                        <option value="hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? 'Saving...' : <><Save className="w-5 h-5" /> {isEditMode ? 'Update Question' : 'Save Question'}</>}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Preview / Tips Side */}
                <div className="space-y-6">
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
                        <h3 className="font-bold text-indigo-900 mb-2">Rapid Entry Mode ⚡</h3>
                        <p className="text-sm text-indigo-700 mb-4">
                            The form stays open after saving so you can quickly add the next question.
                        </p>
                        <div className="text-xs text-indigo-600 space-y-2">
                            <p>• Use <strong>Tab</strong> to move between fields.</p>
                            <p>• Click the circle A/B/C/D to mark correct answer.</p>
                            <p>• <strong>Hindi Text</strong> is optional but recommended.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
