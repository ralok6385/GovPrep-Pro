"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function AdminJobsPage() {
    const [jobs, setJobs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const { data } = await api.get('/jobs');
            setJobs(data);
        } catch (error) {
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this job posting?')) return;

        try {
            await api.delete(`/jobs/${id}`);
            toast.success('Job deleted successfully');
            fetchJobs();
        } catch (error) {
            toast.error('Failed to delete job');
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Railway Job Management</h1>
                    <p className="text-slate-500">Post and manage official notifications.</p>
                </div>
                <Link href="/admin/jobs/add" className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Post New Job
                </Link>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-500">Loading...</div>
            ) : jobs.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                    <p className="text-slate-400">No active job postings.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {jobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h3 className="font-bold text-slate-800 text-lg">{job.title}</h3>
                                <p className="text-slate-500 text-sm mb-2">{job.summary}</p>
                                <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        Apply by: {new Date(job.applicationEndDate).toLocaleDateString()}
                                    </span>
                                    <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded font-medium">
                                        {job.eligibility}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <a
                                    href={job.officialLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                    title="View Link"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <button
                                    onClick={() => handleDelete(job._id)}
                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                    title="Delete Job"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
