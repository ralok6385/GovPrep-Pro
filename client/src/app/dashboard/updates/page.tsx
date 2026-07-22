"use client";

import { useEffect, useState, useMemo } from 'react';
import api from '@/lib/api';
import { ArrowRight, Calendar, ExternalLink, Train, AlertCircle, Search, Filter } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function RailwayUpdatesPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState<string>('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(Array.isArray(data) ? data : []);
        } catch (err) {
            setError('Failed to load updates. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const filteredJobs = useMemo(() => {
        return jobs.filter(job => {
            const matchSearch = !search || job.title?.toLowerCase().includes(search.toLowerCase()) || job.summary?.toLowerCase().includes(search.toLowerCase());
            const matchCategory = filterCategory === 'all' || job.category?.toLowerCase() === filterCategory.toLowerCase();
            return matchSearch && matchCategory;
        });
    }, [jobs, search, filterCategory]);

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28">
            {/* Header */}
            <header className="bg-gradient-to-br from-indigo-800 via-indigo-900 to-purple-950 text-white sticky top-0 z-40 shadow-xl shadow-indigo-950/20">
                <div className="max-w-4xl mx-auto px-4 py-5">
                    <div className="flex items-center gap-3 mb-3">
                        <BackButton label="" className="mb-0 text-white hover:text-indigo-200" />
                        <div>
                            <h1 className="font-black text-xl leading-tight flex items-center gap-2">
                                <Train className="w-5 h-5 text-yellow-400" />
                                Railway Job & Exam Updates
                            </h1>
                            <p className="text-xs text-indigo-200 font-medium">Official RRB & RRC notifications in real-time</p>
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className="relative mt-3">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300" />
                        <input
                            type="text"
                            placeholder="Search notifications, exams, vacancies..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-indigo-300 text-sm focus:outline-none focus:bg-white/20 transition-all"
                        />
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-6">
                {error && (
                    <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-4 rounded-2xl text-rose-600 dark:text-rose-400 text-sm flex items-center gap-2 mb-6">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 animate-pulse space-y-3">
                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-full" />
                                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2" />
                            </div>
                        ))}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-8">
                        <Train className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                        <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">No updates found</h3>
                        <p className="text-xs text-slate-400">Check back later for official RRB notifications.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredJobs.map((job) => (
                            <div key={job._id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-indigo-200 dark:hover:border-indigo-800 transition-all duration-300">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                            Notification
                                        </span>
                                        <span className="text-xs text-slate-400 font-medium">
                                            {job.createdAt ? new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                                        </span>
                                    </div>

                                    <h2 className="font-bold text-slate-800 dark:text-white text-base mb-2 leading-snug">
                                        {job.title}
                                    </h2>

                                    <p className="text-slate-600 dark:text-slate-400 text-xs mb-4 leading-relaxed line-clamp-3">
                                        {job.summary}
                                    </p>

                                    <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Eligibility</p>
                                            <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{job.eligibility || 'Check PDF'}</p>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                            <p className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Last Date</p>
                                            <p className="font-bold text-rose-600 dark:text-rose-400">
                                                {job.applicationEndDate ? new Date(job.applicationEndDate).toLocaleDateString('en-IN') : 'TBA'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <a
                                        href={job.officialLink || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs text-center py-3 rounded-xl transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    >
                                        Apply Official <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                    <p className="text-center text-[9px] text-slate-400 dark:text-slate-500 mt-2">
                                        Redirects to official Railway portal
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
