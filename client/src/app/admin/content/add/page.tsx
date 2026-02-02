"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Youtube, FileText, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function AddContentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);

    const [formData, setFormData] = useState({
        title: '',
        type: 'video', // Default
        url: '',
        file: null as File | null,
        subjectId: '',
        topicName: '',
        isPremium: false
    });

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            console.log('Fetching subjects with all=true...');
            const { data } = await api.get('/subjects', { params: { all: 'true' } });
            console.log('Fetched subjects:', data);
            setSubjects(data);
            if (data.length > 0) {
                setFormData(prev => ({ ...prev, subjectId: data[0]._id }));
            }
        } catch (error) {
            toast.error('Failed to load subjects');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            let dataToSend: any = formData;

            if (formData.type === 'pdf' || formData.type === 'image') {
                // Use FormData for file uploads
                const form = new FormData();
                form.append('title', formData.title);
                form.append('type', formData.type);
                form.append('subjectId', formData.subjectId);
                form.append('topicName', formData.topicName);
                form.append('isPremium', String(formData.isPremium));

                if (formData.file) {
                    form.append('file', formData.file);
                } else if (formData.url) {
                    form.append('url', formData.url);
                }

                dataToSend = form;
            }

            await api.post('/content', dataToSend, {
                headers: {
                    // Start multipart/form-data for files, otherwise standard json
                    'Content-Type': (formData.type === 'pdf' || formData.type === 'image') ? 'multipart/form-data' : 'application/json'
                }
            });

            toast.success('Content added successfully!');
            setFormData(prev => ({ ...prev, title: '', url: '', file: null }));
        } catch (error: any) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Failed to add content');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto pb-20">
            <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors font-medium">
                <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                <div className="bg-slate-50/50 p-8 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Add Study Material</h1>
                    <p className="text-slate-500">Upload content for students. Use <span className="font-bold text-slate-700">"Common / All Exams"</span> subjects to reach everyone.</p>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    {/* Section 1: Content Type */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">1. Select Content Type</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'video' })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${formData.type === 'video'
                                    ? 'border-red-500 bg-red-50 text-red-600 shadow-lg shadow-red-100'
                                    : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type === 'video' ? 'bg-red-100' : 'bg-white'}`}>
                                    <Youtube className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Video Lesson</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'pdf' })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${formData.type === 'pdf'
                                    ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'
                                    : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type === 'pdf' ? 'bg-blue-100' : 'bg-white'}`}>
                                    <FileText className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">PDF Notes</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, type: 'image' })}
                                className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${formData.type === 'image'
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-600 shadow-lg shadow-emerald-100'
                                    : 'border-slate-100 hover:border-slate-300 text-slate-400 hover:text-slate-600 bg-slate-50'
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${formData.type === 'image' ? 'bg-emerald-100' : 'bg-white'}`}>
                                    <ImageIcon className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-sm">Infographic / Image</span>
                            </button>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 2: Categorization */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">2. Categorization</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Target Subject & Group</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 appearance-none"
                                        value={formData.subjectId}
                                        onChange={e => setFormData({ ...formData, subjectId: e.target.value })}
                                    >
                                        {subjects.map(s => (
                                            <option key={s._id} value={s._id}>
                                                {s.name} — {s.examId?.name || 'Globally Visible (All Exams)'}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Select "Globally Visible" subjects to show this content to all students instantly.
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-2">Topic Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Percentage Part 1"
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                    value={formData.topicName}
                                    onChange={e => setFormData({ ...formData, topicName: e.target.value })}
                                    list="recent-topics"
                                />
                                <datalist id="recent-topics">
                                    <option value="Quantitative Aptitude" />
                                    <option value="Reasoning" />
                                    <option value="General Science" />
                                    <option value="Current Affairs" />
                                </datalist>
                                <p className="text-xs text-slate-400 mt-2">
                                    Group related videos under the same Topic Name.
                                </p>
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    {/* Section 3: Details */}
                    <div className="space-y-4">
                        <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">3. Content Details</label>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">Title / Description</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Basics of Percentage with Tricks"
                                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-600 mb-2">
                                {formData.type === 'video' ? 'YouTube URL' : formData.type === 'pdf' ? 'Upload PDF / Enter Link' : 'Upload Image / Enter Link'}
                            </label>

                            {(formData.type === 'pdf' || formData.type === 'image') ? (
                                <div className="space-y-3">
                                    <input
                                        type="file"
                                        accept={formData.type === 'pdf' ? '.pdf' : 'image/*'}
                                        className="block w-full text-sm text-slate-500
                                            file:mr-4 file:py-2.5 file:px-4
                                            file:rounded-full file:border-0
                                            file:text-sm file:font-semibold
                                            file:bg-indigo-50 file:text-indigo-700
                                            hover:file:bg-indigo-100"
                                        onChange={e => {
                                            const file = e.target.files ? e.target.files[0] : null;
                                            setFormData({ ...formData, file: file, url: '' });
                                        }}
                                    />
                                    <div className="text-center text-xs text-slate-400 font-medium">- OR -</div>
                                    <input
                                        type="url"
                                        placeholder={formData.type === 'pdf' ? "Or paste Google Drive link..." : "Or paste Image URL..."}
                                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-slate-600"
                                        value={formData.url}
                                        onChange={e => setFormData({ ...formData, url: e.target.value, file: null })}
                                    />
                                </div>
                            ) : (
                                <input
                                    type="url"
                                    required
                                    placeholder="https://..."
                                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm text-slate-600"
                                    value={formData.url}
                                    onChange={e => setFormData({ ...formData, url: e.target.value })}
                                />
                            )}
                        </div>

                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100 flex items-center justify-between">
                            <div>
                                <h4 className="font-bold text-indigo-900 text-sm">Premium Content</h4>
                                <p className="text-xs text-indigo-700">Lock this content for paid users only?</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.isPremium}
                                    onChange={e => setFormData({ ...formData, isPremium: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-indigo-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full font-bold py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 text-white text-lg transform hover:scale-[1.01] active:scale-[0.99]
                            ${formData.type === 'video' ? 'bg-red-600 hover:bg-red-700 shadow-red-500/20' :
                                formData.type === 'pdf' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20' :
                                    'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20'}
                        `}
                    >
                        {loading ? 'Publishing...' : <><Save className="w-6 h-6" /> Publish Content</>}
                    </button>
                </form>
            </div>
        </div>
    );
}
