"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Video, Save, CheckCircle2 } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Exam {
    _id: string;
    name: string;
}

interface Subject {
    _id: string;
    name: string;
}

export default function AddVideo() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [exams, setExams] = useState<Exam[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);

    // Form selections
    const [selectedExam, setSelectedExam] = useState<Exam | null>(null);

    const [formData, setFormData] = useState({
        subjectId: '',
        chapter: '',
        title: '',
        videoUrl: '',
        description: ''
    });

    // Fetch Exams on Mount
    useEffect(() => {
        const fetchExams = async () => {
            try {
                const { data } = await api.get('/exams');
                setExams(data);
            } catch (error) {
                console.error('Failed to load exams');
            }
        };
        fetchExams();
    }, []);

    // Fetch Subjects when Exam Changes
    useEffect(() => {
        if (selectedExam) {
            const fetchSubjects = async () => {
                try {
                    if (!selectedExam._id) return;
                    const { data } = await api.get(`/subjects?examId=${selectedExam._id}`);
                    setSubjects(data);
                    setFormData(prev => ({ ...prev, subjectId: '' })); // Reset subject
                } catch (error) {
                    console.error('Failed to load subjects', error);
                }
            };
            fetchSubjects();
        } else {
            setSubjects([]);
        }
    }, [selectedExam]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/content', {
                title: formData.title,
                type: 'video',
                url: formData.videoUrl, // "https://www.youtube.com/watch?v=..."
                topicName: formData.chapter,
                subjectId: formData.subjectId,
                // examId is implicit via subject usually, or we can send it if backend needs it (Backend currently only needs subjectId)
            });

            toast.success('Video uploaded successfully!');
            router.push('/admin/videos');
        } catch (error) {
            console.error(error);
            toast.error('Failed to upload video');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto p-8">
            <button onClick={() => router.back()} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4 mr-1" /> Back to Videos
            </button>

            <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-indigo-600 p-6 text-white text-center">
                    <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm">
                        <Video className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-bold">Upload New Video</h1>
                    <p className="text-indigo-200 text-sm mt-1">Follow the 3 simple steps below</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                    {/* Step Indicators */}
                    <div className="flex items-center justify-between mb-8 px-4">
                        {[1, 2, 3].map((s) => (
                            <div key={s} className="flex flex-col items-center relative">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                                    {step > s ? <CheckCircle2 className="w-5 h-5" /> : s}
                                </div>
                                <span className={`text-xs mt-2 font-medium ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    {s === 1 ? 'Exam & Subject' : s === 2 ? 'Topic Info' : 'Paste Link'}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Select Exam</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {exams.length > 0 ? exams.map((exam) => (
                                            <div
                                                key={exam._id}
                                                onClick={() => setSelectedExam(exam)}
                                                className={`p-3 rounded-xl border border-2 cursor-pointer transition-all text-sm font-medium text-center ${selectedExam?._id === exam._id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-100 hover:border-indigo-200 text-slate-600'}`}
                                            >
                                                {exam.name}
                                            </div>
                                        )) : <p className="col-span-3 text-sm text-slate-500">Loading exams...</p>}
                                    </div>
                                </div>

                                {selectedExam && (
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Select Subject</label>
                                        <select
                                            value={formData.subjectId}
                                            onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                        >
                                            <option value="">-- Choose Subject --</option>
                                            {subjects.map(sub => <option key={sub._id} value={sub._id}>{sub.name}</option>)}
                                        </select>
                                    </div>
                                )}
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Chapter / Topic Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Ratio and Proportion"
                                        value={formData.chapter}
                                        onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Video Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Introduction to Ratios - Part 1"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4 animate-fade-in">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Paste Video Link (YouTube/Vimeo)</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="url"
                                            placeholder="https://www.youtube.com/watch?v=..."
                                            value={formData.videoUrl}
                                            onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                            className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Supports YouTube, Vimeo, and direct MP4 links.
                                    </p>
                                </div>
                                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                    <p className="text-xs text-orange-700 font-medium">
                                        Note: We do not upload heavy video files directly to keep the server fast. Please host videos on YouTube (Unlisted) or Vimeo and paste the link here.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between">
                        <button
                            type="button"
                            disabled={step === 1}
                            onClick={() => setStep(step - 1)}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-colors ${step === 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Back
                        </button>

                        {step < 3 ? (
                            <button
                                type="button"
                                disabled={(step === 1 && (!selectedExam || !formData.subjectId)) || (step === 2 && (!formData.chapter || !formData.title))}
                                onClick={() => setStep(step + 1)}
                                className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                Next Step
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading || !formData.videoUrl}
                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all disabled:opacity-70"
                            >
                                {loading ? 'Saving...' : <><Save className="w-4 h-4" /> Save Video</>}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
