"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Play, ArrowLeft, Clock, Search, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import EmptyState from '@/components/Common/EmptyState';
import ReactMarkdown from 'react-markdown';

export default function LecturesPage() {
    const { user } = useAuth();
    const [lectures, setLectures] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeSubject, setActiveSubject] = useState<string>('all');
    // In-app video player state (replaces external YouTube tabs)
    const [activeVideo, setActiveVideo] = useState<{title: string, url: string, youtubeId: string | null} | null>(null);
    const [selectedSummary, setSelectedSummary] = useState<{title: string, content: string, status: string} | null>(null);

    const getYTId = (url: string): string | null => {
        if (!url) return null;
        const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const getYTThumb = (url: string) => {
        const id = getYTId(url);
        return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
    };

    useEffect(() => { fetchLectures(); }, []);

    const subjects = useMemo(() => {
        const seen = new Set<string>();
        const list: {id: string, name: string}[] = [];
        lectures.forEach(v => {
            const id = v.subjectId?._id;
            const name = v.subjectId?.name;
            if (id && name && !seen.has(id)) { seen.add(id); list.push({ id, name }); }
        });
        return list;
    }, [lectures]);

    const fetchLectures = async () => {
        try {
            const { data } = await api.get('/content?type=video');
            setLectures(data);
        } catch (error) {
            console.error('Failed to load lectures', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredLectures = lectures.filter(video =>
        (activeSubject === 'all' || video.subjectId?._id === activeSubject) &&
        (
            video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            video.subjectId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 warm:bg-[var(--background)] pb-20">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 warm:bg-[#fffbf0] sticky top-0 z-30 shadow-sm border-b border-slate-100 dark:border-slate-800 warm:border-stone-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <Link href={user?.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 warm:text-stone-400 warm:hover:text-stone-600 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-xl text-slate-800 dark:text-white warm:text-stone-800">All Lectures</h1>
                    <div className="w-8"></div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Search */}
                <div className="relative max-w-2xl mx-auto">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search topics..."
                        className="w-full pl-10 pr-4 py-3 rounded-full border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-900 shadow-sm text-slate-800 dark:text-white placeholder:text-slate-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Subject Filter Chips */}
                {subjects.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveSubject('all')}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                activeSubject === 'all'
                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                        >
                            All Subjects
                        </button>
                        {subjects.map(s => (
                            <button
                                key={s.id}
                                onClick={() => setActiveSubject(s.id)}
                                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    activeSubject === s.id
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                            >
                                {s.name}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10 animate-pulse">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-video bg-slate-200 rounded-xl w-full"></div>
                                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                        {filteredLectures.map((video) => {
                            const youtubeId = getYTId(video.url);
                            const youtubeThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg` : null;

                            return (
                                <div key={video._id} className="group flex flex-col gap-3 relative">
                                    {/* Thumbnail — opens in-app player on click */}
                                    <button
                                        onClick={() => setActiveVideo({ title: video.title, url: video.url, youtubeId })}
                                        className="relative block w-full text-left"
                                    >
                                        {/* Thumbnail Area */}
                                        <div className="aspect-video w-full relative overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                                            <img
                                                src={youtubeThumb || (video as any).thumbnail || `https://images.unsplash.com/photo-1474487056289-622c50b76e1d?q=80&w=800&auto=format&fit=crop`}
                                                alt={video.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                                onError={(e: any) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532102235608-dc8fc689c9ab?q=80&w=800&auto=format&fit=crop'; }}
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-white/90 text-red-600 flex items-center justify-center scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                                                    <Play className="w-6 h-6 fill-current ml-1" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow-lg">
                                                <span>{video.duration || 'Watch'}</span>
                                            </div>
                                            {video.isPremium && (
                                                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-lg">PRO</div>
                                            )}
                                        </div>
                                    </button>

                                    {/* Content Area */}
                                    <div className="flex gap-3">
                                        {/* Avatar or Subject Icon (Mimicking YouTube Channel Avatar) */}
                                        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 shrink-0 flex items-center justify-center text-indigo-600 font-black text-[10px] border border-slate-200 dark:border-slate-700">
                                            {(video.subjectId?.name || 'G').charAt(0)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <a href={video.url} target="_blank" rel="noopener noreferrer">
                                                <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug mb-1 line-clamp-2 hover:text-indigo-600 transition-colors">
                                                    {video.title}
                                                </h3>
                                            </a>

                                            <div className="flex flex-col text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                                                <span className="font-bold text-slate-700 dark:text-slate-300">
                                                    By Er. Alok Sir • {video.subjectId?.name || 'General Preparation'}
                                                </span>
                                                <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                                                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">14.2k Aspirants Watched</span>
                                                    <span>•</span>
                                                    <span>
                                                        {video.createdAt ? formatDistanceToNow(new Date(video.createdAt), { addSuffix: true }) : 'Added recently'}
                                                    </span>
                                                </div>
                                            </div>

                                            {(video.processingStatus === 'completed' || video.processingStatus === 'processing' || !video.processingStatus) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setSelectedSummary({
                                                            title: video.title,
                                                            content: video.summary || '',
                                                            status: video.processingStatus || 'none'
                                                        });
                                                    }}
                                                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1.5 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors border border-indigo-100 dark:border-indigo-800 w-max"
                                                >
                                                    <Sparkles className="w-3.5 h-3.5" />
                                                    {video.processingStatus === 'processing' ? 'AI Analyzing...' : 'View AI Summary'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredLectures.length === 0 && (
                            <div className="col-span-full py-12">
                                <EmptyState
                                    title="No lectures found"
                                    description="We couldn't find any lectures matching your search. Try adjusting filters or start a practice test to sharpen your skills!"
                                    icon={Play}
                                />
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* AI Summary Modal */}
            {selectedSummary && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedSummary(null)}>
                    <div 
                        className="bg-white dark:bg-slate-900 w-full max-w-3xl max-h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-8 duration-300"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-lg text-slate-800 dark:text-white leading-tight">AI Generated Summary</h2>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md truncate">{selectedSummary.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedSummary(null)} className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto min-h-[300px]">
                            {selectedSummary.status === 'processing' || selectedSummary.status === 'pending' ? (
                                <div className="flex flex-col items-center justify-center h-full py-12">
                                    <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">AI is Analyzing...</h3>
                                    <p className="text-slate-500 text-sm mt-2 text-center max-w-sm">The AI is currently watching the video and extracting key points. Check back in 1-2 minutes!</p>
                                </div>
                            ) : selectedSummary.content ? (
                                <div className="text-slate-700 dark:text-slate-300 [&>h1]:text-2xl [&>h1]:font-black [&>h1]:mb-6 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-4 [&>p]:mb-4 [&>p]:leading-relaxed [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mb-6 [&>li]:leading-relaxed [&>strong]:text-indigo-700">
                                    <ReactMarkdown>{selectedSummary.content}</ReactMarkdown>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                        <span className="text-2xl">😞</span>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">No Summary Available</h3>
                                    <p className="text-slate-500 text-sm mt-2">We couldn't generate a summary for this video.</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
                            <button onClick={() => setSelectedSummary(null)} className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-xl text-sm transition-transform hover:scale-105">
                                Close Summary
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* In-App Video Player Modal */}
            {activeVideo && (
                <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4" onClick={() => setActiveVideo(null)}>
                    <div className="w-full max-w-4xl" onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div className="flex items-center justify-between mb-3 px-1">
                            <h2 className="font-bold text-white text-sm line-clamp-1 flex-1 mr-4">{activeVideo.title}</h2>
                            <div className="flex items-center gap-2">
                                <a
                                    href={activeVideo.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-bold text-indigo-300 hover:text-white border border-indigo-500/50 px-3 py-1.5 rounded-lg transition-colors"
                                    onClick={e => e.stopPropagation()}
                                >
                                    Open YouTube ↗
                                </a>
                                <button onClick={() => setActiveVideo(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Video Player */}
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                            {activeVideo.youtubeId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                                    title={activeVideo.title}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    allowFullScreen
                                    className="w-full h-full border-0"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                                    <Play className="w-16 h-16 opacity-40" />
                                    <p className="text-sm opacity-60">Can't embed this video</p>
                                    <a href={activeVideo.url} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-xl font-bold text-sm transition-colors">
                                        Watch on YouTube
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


