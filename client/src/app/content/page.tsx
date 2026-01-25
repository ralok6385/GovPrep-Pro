"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { FileText, Play, Lock } from 'lucide-react';

interface ContentItem {
    _id: string;
    title: string;
    type: 'video' | 'pdf';
    url: string;
    topicName: string;
    isPremium: boolean;
}

export default function ContentPage() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        // Need Subject IDs first? or Exam subjects?
        // /api/content/:subjectId requires subject ID.
        // I should probably have an endpoint /api/content/exam/:examId to get all content for an exam grouped by subject.
        // But I implemented `getContent` by subjectId only in `contentController`.
        // I will fetch subjects first, then fetch content for each subject.
        // Ideally user selects a subject.
        // I'll assume I list subjects first.
        // For now, I'll just show "Select Subject" UI or fetch all subjects and valid content.
        // To keep it simple: Fetch subjects for user.selectedExam, then fetch content for first subject.

        // Actually, I'll make this page a "Subject Selector" -> "Content List".
        // I'll fetch subjects.
    }, []);

    // Simplified: "All Content" page.
    // I need to fetch all subjects for the exam.
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedSubject, setSelectedSubject] = useState('');

    useEffect(() => {
        const examId = (user?.selectedExam as any)?._id;
        if (examId) {
            api.get(`/exams/${examId}/subjects`).then(res => {
                setSubjects(res.data);
                if (res.data.length > 0) setSelectedSubject(res.data[0]._id);
            });
        }
    }, [user]);

    useEffect(() => {
        if (selectedSubject) {
            setLoading(true);
            api.get(`/content/${selectedSubject}`).then(res => {
                setContent(res.data);
                setLoading(false);
            });
        }
    }, [selectedSubject]);

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Study Material</h1>

                {/* Subject Tabs */}
                <div className="flex overflow-x-auto gap-4 mb-8 pb-2">
                    {subjects.map(s => (
                        <button
                            key={s._id}
                            onClick={() => setSelectedSubject(s._id)}
                            className={`px-6 py-2 rounded-full whitespace-nowrap transition-colors ${selectedSubject === s._id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-gray-400 hover:bg-slate-700'}`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>

                {loading ? <div className="text-center py-20 text-gray-500">Loading content...</div> : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {content.length === 0 ? <p className="text-gray-500 col-span-3 text-center py-10">No content uploaded for this subject yet.</p> : content.map(item => (
                            <div key={item._id} className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-colors group cursor-pointer">
                                <div className="h-40 bg-slate-900 flex items-center justify-center relative">
                                    {item.type === 'video' ? <Play className="w-12 h-12 text-indigo-500 group-hover:scale-110 transition-transform" /> : <FileText className="w-12 h-12 text-orange-500 group-hover:scale-110 transition-transform" />}
                                    {item.isPremium && <div className="absolute top-2 right-2 bg-yellow-500/20 text-yellow-500 p-1 rounded"><Lock className="w-4 h-4" /></div>}
                                </div>
                                <div className="p-4">
                                    <span className="text-xs text-indigo-400 font-medium">{item.topicName}</span>
                                    <h3 className="font-bold text-lg mb-1 truncate">{item.title}</h3>
                                    <p className="text-gray-500 text-sm capitalize">{item.type} Lesson</p>

                                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="mt-4 block text-center w-full py-2 bg-slate-700 hover:bg-indigo-600 rounded-lg text-sm font-medium transition-colors">
                                        {item.type === 'video' ? 'Watch Now' : 'Read Notes'}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
