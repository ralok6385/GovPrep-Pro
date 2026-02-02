"use client";

import { useEffect, useState, Suspense } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams } from 'next/navigation';
import { FileText, Play, Lock, Search } from 'lucide-react';
import BackButton from '@/components/BackButton';

interface ContentItem {
    _id: string;
    title: string;
    type: 'video' | 'pdf' | 'image';
    url: string;
    topicName: string;
    isPremium: boolean;
}

function ContentPageContent() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);

    // Helper to resolve full URL for local uploads
    const getContentUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        // Assuming backend is at 5002 based on api.ts
        // Ideally we should use env var, but for now matching existing config
        if (url.startsWith('/uploads') || url.startsWith('uploads')) {
            const cleanPath = url.startsWith('/') ? url : `/${url}`;
            return `http://localhost:5002${cleanPath}`;
        }
        return url;
    };
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const { user } = useAuth();

    // Simplified: "All Content" page.
    // I need to fetch all subjects for the exam.
    const [subjects, setSubjects] = useState<any[]>([]);
    const searchParams = useSearchParams();
    const urlSubjectId = searchParams.get('subjectId');

    // Initialize with URL param if valid, or empty (will be set after subjects fetch)
    const [selectedSubject, setSelectedSubject] = useState(urlSubjectId || '');

    useEffect(() => {
        const examId = (user?.selectedExam as any)?._id || 'global';
        api.get(`/exams/${examId}/subjects`).then(res => {
            setSubjects(res.data);

            // If URL has a subject ID, try to use it. 
            // If not (or invalid), fallback to first available subject.
            if (!urlSubjectId && res.data.length > 0) {
                setSelectedSubject(res.data[0]._id);
            } else if (urlSubjectId && !res.data.find((s: any) => s._id === urlSubjectId)) {
                // Handle case where URL subject ID is not in the allowed list for this user?
                // For now, let's allow it (maybe they clicked a direct link to a global subject)
                // or fallback if it fails.
                if (res.data.length > 0) setSelectedSubject(res.data[0]._id);
            }

            if (res.data.length === 0) {
                setLoading(false); // Stop loading if no subjects at all
            }
        }).catch(() => setLoading(false));
    }, [user, urlSubjectId]);

    useEffect(() => {
        if (selectedSubject) {
            setLoading(true);
            api.get('/content', { params: { subjectId: selectedSubject } }).then(res => {
                setContent(res.data);
            }).catch(err => {
                console.error("Failed to load content", err);
            }).finally(() => {
                setLoading(false);
            });
        }
    }, [selectedSubject]);

    return (
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-20">
            <div className="max-w-6xl mx-auto">
                <BackButton label="Back to Dashboard" />

                <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Study Material
                        </h1>
                        <p className="text-slate-400 mt-2">Access high-quality notes and video lectures.</p>
                    </div>
                </div>

                {/* Subject Tabs */}
                {subjects.length > 0 ? (
                    <div className="flex overflow-x-auto gap-3 mb-8 pb-2 scrollbar-hide">
                        {subjects.map(s => (
                            <button
                                key={s._id}
                                onClick={() => setSelectedSubject(s._id)}
                                className={`px-5 py-2.5 rounded-xl whitespace-nowrap transition-all font-medium text-sm ${selectedSubject === s._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                ) : (
                    !loading && <div className="p-4 bg-yellow-500/10 text-yellow-500 rounded-xl mb-6 text-sm border border-yellow-500/20">
                        Please setup your exam preference in profile to see subjects.
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-900 rounded-2xl"></div>)}
                    </div>
                ) : (
                    <div className="space-y-12">
                        {content.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-900/50 rounded-3xl border border-dashed border-slate-800">
                                <Search className="w-12 h-12 mb-4 opacity-20" />
                                <p>No content uploaded for this subject yet.</p>
                            </div>
                        ) : (
                            // Group content by Topic
                            Object.entries(content.reduce((acc: Record<string, ContentItem[]>, item) => {
                                const topic = item.topicName || 'General';
                                if (!acc[topic]) acc[topic] = [];
                                acc[topic].push(item);
                                return acc;
                            }, {} as Record<string, ContentItem[]>)).map(([topic, items]) => (
                                <div key={topic} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-px bg-slate-800 flex-1"></div>
                                        <h2 className="text-xl font-bold text-indigo-400 uppercase tracking-widest">{topic}</h2>
                                        <div className="h-px bg-slate-800 flex-1"></div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {items.map(item => (
                                            <div key={item._id} className="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/50 transition-all group hover:shadow-2xl hover:shadow-indigo-500/10">
                                                <div className="h-44 bg-slate-950 flex items-center justify-center relative group-hover:bg-slate-900 transition-colors">
                                                    {item.type === 'video' ?
                                                        <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                            <Play className="w-8 h-8 text-indigo-500 fill-indigo-500" />
                                                        </div>
                                                        : item.type === 'image' ?
                                                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <FileText className="w-8 h-8 text-emerald-500" />
                                                            </div>
                                                            :
                                                            <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                                                <FileText className="w-8 h-8 text-orange-500" />
                                                            </div>
                                                    }
                                                    {item.isPremium && <div className="absolute top-3 right-3 bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded-lg text-xs font-bold border border-yellow-500/20 flex items-center gap-1 backdrop-blur-md"><Lock className="w-3 h-3" /> PRO</div>}
                                                </div>
                                                <div className="p-5">
                                                    <h3 className="font-bold text-lg text-white mb-2 truncate leading-tight mt-1">{item.title}</h3>
                                                    <p className="text-slate-500 text-sm capitalize mb-5">{item.type} Lesson</p>

                                                    {/* Action Button */}
                                                    <button
                                                        onClick={() => setSelectedContent(item)}
                                                        className={`block text-center w-full py-3 rounded-xl text-sm font-bold transition-all ${item.type === 'video' ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-800 hover:bg-slate-700 text-white'}`}
                                                    >
                                                        {item.type === 'video' ? 'Watch Lesson' : 'Read Notes'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Content Reader Modal */}
            {selectedContent && (
                <div className="fixed inset-0 z-50 bg-black animate-in fade-in duration-200">
                    <div className="w-full h-full bg-white flex flex-col relative">
                        {/* Modal Header */}
                        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center border-b border-slate-800 shadow-xl z-10">
                            <div>
                                <h3 className="font-bold text-lg">{selectedContent.title}</h3>
                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                    <span className="uppercase tracking-wider font-bold text-indigo-400">{selectedContent.topicName}</span>
                                    <span>•</span>
                                    <span className="capitalize">{selectedContent.type}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedContent(null)}
                                className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                            </button>
                        </div>

                        {/* Modal Body (Embed) */}
                        <div className="flex-1 bg-slate-100 relative flex items-center justify-center bg-black/5">
                            {selectedContent.type === 'video' ? (
                                <iframe
                                    src={selectedContent.url.replace("watch?v=", "embed/")}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            ) : selectedContent.type === 'image' ? (
                                <div className="w-full h-full p-4 flex items-center justify-center overflow-auto">
                                    <img
                                        src={getContentUrl(selectedContent.url)}
                                        alt={selectedContent.title}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                                    />
                                </div>
                            ) : (
                                /* PDF / Doc Embed */
                                <iframe
                                    src={selectedContent.url.includes('drive.google.com')
                                        ? selectedContent.url.replace('/view', '/preview').replace('/edit', '/preview')
                                        : getContentUrl(selectedContent.url)}
                                    className="w-full h-full"
                                    title="PDF Reader"
                                ></iframe>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ContentPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">Loading Content...</div>}>
            <ContentPageContent />
        </Suspense>
    );
}
