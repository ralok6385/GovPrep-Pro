"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { ArrowRight, Calendar, ExternalLink, Train, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import BackButton from '@/components/BackButton';

export default function RailwayUpdatesPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (err) {
            setError('Failed to load updates. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 text-slate-500">Loading updates...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <header className="bg-blue-800 text-white sticky top-0 z-40 shadow-md">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center gap-3">
                    <BackButton label="" className="mb-0 text-white hover:text-blue-200" />
                    <h1 className="font-bold text-lg flex items-center gap-2">
                        <Train className="w-5 h-5 text-yellow-400" />
                        Railway Job Updates
                    </h1>
                </div>
            </header>

            <main className="max-w-md mx-auto px-4 py-6 space-y-4">
                {error && (
                    <div className="bg-red-50 p-4 rounded-xl text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}

                {jobs.length === 0 && !loading && !error && (
                    <div className="text-center py-10 text-slate-400">
                        <Train className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No new updates currently.</p>
                        <p className="text-xs">Check back later for vacancy news.</p>
                    </div>
                )}

                {jobs.map((job) => (
                    <div key={job._id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-fade-in-up">
                        <div className="flex justify-between items-start mb-2">
                            <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                Notification
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                                {new Date(job.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                        </div>

                        <h2 className="font-bold text-slate-800 text-lg mb-2 leading-snug">
                            {job.title}
                        </h2>

                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                            {job.summary}
                        </p>

                        <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-slate-400 mb-0.5">Eligibility</p>
                                <p className="font-semibold text-slate-700 truncate">{job.eligibility}</p>
                            </div>
                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                                <p className="text-slate-400 mb-0.5">Last Date</p>
                                <p className="font-semibold text-red-600">
                                    {new Date(job.applicationEndDate).toLocaleDateString('en-IN')}
                                </p>
                            </div>
                        </div>

                        <a
                            href={job.officialLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-center py-3 rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
                        >
                            Apply Official <ExternalLink className="w-4 h-4" />
                        </a>
                        <p className="text-center text-[10px] text-slate-400 mt-2">
                            Redirects to official Railway website
                        </p>
                    </div>
                ))}
            </main>
        </div>
    );
}
