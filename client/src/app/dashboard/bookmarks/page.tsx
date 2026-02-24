"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Bookmark, BookmarkX, Search, ChevronRight, Sparkles, FileText, Trash2, Filter } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface BookmarkItem {
    _id: string;
    question: {
        _id: string;
        text: string;
        options: { id: string; text: string }[];
        correctOption: string;
        explanation?: string;
        subjectId?: { _id: string; name: string };
        difficulty?: string;
    };
    createdAt: string;
}

export default function BookmarksPage() {
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [subjectFilter, setSubjectFilter] = useState<string>('all');

    useEffect(() => {
        fetchBookmarks();
    }, []);

    const fetchBookmarks = async () => {
        try {
            const { data } = await api.get('/bookmarks');
            setBookmarks(data);
        } catch (error) {
            console.error('Failed to load bookmarks', error);
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (questionId: string) => {
        try {
            await api.post('/bookmarks/toggle', { questionId });
            setBookmarks(prev => prev.filter(b => b.question._id !== questionId));
            toast.success('Bookmark removed');
        } catch {
            toast.error('Failed to remove bookmark');
        }
    };

    const subjects = [...new Set(bookmarks.map(b => b.question?.subjectId?.name).filter(Boolean))];

    const filtered = bookmarks.filter(b => {
        const q = b.question;
        if (!q) return false;
        const matchesSearch = !search || q.text.toLowerCase().includes(search.toLowerCase());
        const matchesSubject = subjectFilter === 'all' || q.subjectId?.name === subjectFilter;
        return matchesSearch && matchesSubject;
    });

    // Strip HTML tags for display
    const stripHtml = (html: string) => html?.replace(/<[^>]*>/g, '') || '';

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white px-6 py-10 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>
                <div className="relative z-10 max-w-3xl mx-auto">
                    <div className="flex items-center gap-2 mb-1">
                        <Bookmark className="w-5 h-5 text-amber-200" />
                        <span className="text-xs font-bold text-amber-200 uppercase tracking-widest">Revision Bank</span>
                    </div>
                    <h1 className="text-3xl font-black tracking-tight mb-2">My Bookmarks</h1>
                    <p className="text-amber-100 text-sm font-medium opacity-80">
                        Your saved questions for quick revision before exams.
                    </p>

                    {bookmarks.length > 0 && (
                        <div className="flex gap-4 mt-6">
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-2xl font-black">{bookmarks.length}</p>
                                <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">Saved</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/20">
                                <p className="text-2xl font-black">{subjects.length}</p>
                                <p className="text-[10px] text-amber-200 font-bold uppercase tracking-widest">Subjects</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Search & Filters */}
                {bookmarks.length > 0 && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search saved questions..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all text-slate-700 dark:text-white"
                            />
                        </div>
                        {subjects.length > 1 && (
                            <select
                                value={subjectFilter}
                                onChange={(e) => setSubjectFilter(e.target.value)}
                                className="px-4 py-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 cursor-pointer"
                            >
                                <option value="all">All Subjects</option>
                                {subjects.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                {/* Bookmark List */}
                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-28 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800"></div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4">
                            <Bookmark className="w-9 h-9 text-amber-300 dark:text-amber-600" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-500 dark:text-slate-400 mb-1">
                            {search || subjectFilter !== 'all' ? 'No matching bookmarks' : 'No bookmarks yet'}
                        </h3>
                        <p className="text-sm text-slate-400 dark:text-slate-500 max-w-xs mb-6">
                            {search ? 'Try a different search term.' : 'Save questions during tests or analysis to build your revision bank.'}
                        </p>
                        <Link href="/dashboard/tests" className="px-6 py-3 bg-amber-500 text-white font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-colors">
                            Start a Test
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((bm) => {
                            const q = bm.question;
                            const isExpanded = expandedId === bm._id;

                            return (
                                <div key={bm._id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    <div
                                        className="p-5 cursor-pointer"
                                        onClick={() => setExpandedId(isExpanded ? null : bm._id)}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                    {q.subjectId?.name && (
                                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 uppercase tracking-wider">
                                                            {q.subjectId.name}
                                                        </span>
                                                    )}
                                                    {q.difficulty && (
                                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${q.difficulty === 'hard' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-800' :
                                                                q.difficulty === 'medium' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800' :
                                                                    'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800'
                                                            }`}>
                                                            {q.difficulty}
                                                        </span>
                                                    )}
                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                                        Saved {formatDistanceToNow(new Date(bm.createdAt), { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <p className="font-bold text-slate-800 dark:text-white text-sm leading-relaxed line-clamp-2">
                                                    {stripHtml(q.text)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0 mt-1">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeBookmark(q._id); }}
                                                    className="p-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 transition-colors"
                                                    title="Remove bookmark"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded view with options + explanation */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5 space-y-3 border-t border-slate-100 dark:border-slate-800 pt-4">
                                            <div className="grid gap-2">
                                                {q.options?.map((opt) => (
                                                    <div
                                                        key={opt.id}
                                                        className={`p-3 rounded-xl text-sm font-medium border ${opt.id === q.correctOption
                                                                ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                                                                : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                                                            }`}
                                                    >
                                                        <span className="font-bold mr-2">{opt.id}.</span>
                                                        {stripHtml(opt.text)}
                                                    </div>
                                                ))}
                                            </div>
                                            {q.explanation && (
                                                <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                                                    <p className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-1">Explanation</p>
                                                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                                        {stripHtml(q.explanation)}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
