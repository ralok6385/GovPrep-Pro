'use client';

import { useState, useEffect, useMemo } from 'react';
import { fetchContent, ContentItem } from '@/services/contentService';
import { FileText, Lock, Search, X } from 'lucide-react';

export default function StudyMaterialPage() {
    const [content, setContent] = useState<ContentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSubject, setActiveSubject] = useState<string>('all');

    const subjects = useMemo(() => {
        const seen = new Set<string>();
        const list: string[] = [];
        content.forEach(item => {
            const name = (item as any).subjectId?.name || item.topicName;
            if (name && !seen.has(name)) { seen.add(name); list.push(name); }
        });
        return list;
    }, [content]);

    const filteredContent = useMemo(() =>
        content.filter(item => {
            const subjectName = (item as any).subjectId?.name || item.topicName;
            const matchesSubject = activeSubject === 'all' || subjectName === activeSubject;
            const matchesSearch = !searchQuery ||
                item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.topicName.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesSubject && matchesSearch;
        })
    , [content, activeSubject, searchQuery]);

    useEffect(() => {
        loadContent();
    }, []);

    const loadContent = async () => {
        setLoading(true);
        try {
            const data = await fetchContent(undefined, 'pdf'); // Strictly PDF
            setContent(data || []);
        } catch (error) {
            // Silently handle - show empty state rather than error toast
            // (could be empty DB, not a true error for the user)
            setContent([]);
            console.error('Study material fetch failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-1">Study Material</h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Download premium PDF notes for your preparation.</p>
                </div>

                {/* Search */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search PDF topics..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none w-full transition-colors shadow-sm text-sm"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Subject Filter Chips */}
                {subjects.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                        <button
                            onClick={() => setActiveSubject('all')}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                activeSubject === 'all'
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                            }`}
                        >
                            All Subjects
                        </button>
                        {subjects.map(subj => (
                            <button
                                key={subj}
                                onClick={() => setActiveSubject(subj)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                    activeSubject === subj
                                        ? 'bg-indigo-600 text-white border-indigo-600'
                                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                                }`}
                            >
                                {subj}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content Grid */}
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
            ) : filteredContent.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                        <FileText className="w-9 h-9 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">No study material found</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs">
                        {searchQuery ? `No results for "${searchQuery}". Try a different search term.` : 'New study material will appear here when your admin uploads PDF notes.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-10">
                    {filteredContent.map((item) => {
                        return (
                            <a
                                key={item._id}
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex flex-col gap-3"
                            >
                                {/* Thumbnail Area */}
                                <div className="aspect-video w-full relative overflow-hidden rounded-xl bg-slate-100 flex items-center justify-center">
                                    <img
                                        src={(item as any).thumbnail || `https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=800&auto=format&fit=crop`}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        onError={(e: any) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532102235608-dc8fc689c9ab?q=80&w=800&auto=format&fit=crop'; }}
                                    />

                                    {/* Icon Overlay (Subtle) */}
                                    <div className="absolute inset-0 bg-emerald-950/20 group-hover:bg-emerald-950/40 transition-colors duration-300 flex items-center justify-center">
                                        <div className="w-12 h-12 rounded-xl bg-emerald-500/90 text-white flex items-center justify-center scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl border border-white/20">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                    </div>

                                    {item.isPremium && (
                                        <div className="absolute top-2 left-2 bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider shadow-lg flex items-center gap-1">
                                            <Lock className="w-2.5 h-2.5" /> PRO
                                        </div>
                                    )}
                                </div>

                                {/* Content Area */}
                                <div className="flex gap-3">
                                    {/* Subject Icon / Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-emerald-900/30 shrink-0 flex items-center justify-center text-emerald-600 font-black text-[10px] border border-emerald-100 dark:border-emerald-800">
                                        {(item.topicName || 'P').charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 dark:text-white text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                                            {item.title}
                                        </h3>

                                        <div className="flex flex-col text-[12px] text-slate-500 dark:text-slate-400 font-medium">
                                            <span className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                                                {item.topicName}
                                            </span>
                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                <span>PDF Notes</span>
                                                <span className="w-0.5 h-0.5 rounded-full bg-slate-300"></span>
                                                <span>
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Added Recently'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </a>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
