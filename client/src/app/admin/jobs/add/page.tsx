"use client";

import { useState } from 'react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

export default function AddJobPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        summary: '',
        officialLink: '',
        applicationStartDate: '',
        applicationEndDate: '',
        eligibility: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/jobs', formData);
            toast.success('Job posted successfully!');
            router.push('/admin/jobs');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to post job');
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <Link href="/admin/jobs" className="inline-flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Jobs
            </Link>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
                <h1 className="text-2xl font-bold text-slate-800 mb-6">Post New Job</h1>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Job Title</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. RRB NTPC 2025 Recruitment"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Summary (Short Description)</label>
                        <textarea
                            required
                            rows={3}
                            placeholder="e.g. 15,000 vacancies for Graduate and Undergraduate posts..."
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.summary}
                            onChange={e => setFormData({ ...formData, summary: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Official Application Link</label>
                        <input
                            type="url"
                            required
                            placeholder="https://indianrailways.gov.in/..."
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-mono text-sm"
                            value={formData.officialLink}
                            onChange={e => setFormData({ ...formData, officialLink: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Application Start Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.applicationStartDate}
                                onChange={e => setFormData({ ...formData, applicationStartDate: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Application End Date</label>
                            <input
                                type="date"
                                required
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={formData.applicationEndDate}
                                onChange={e => setFormData({ ...formData, applicationEndDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Eligibility Criteria</label>
                        <input
                            type="text"
                            required
                            placeholder="e.g. 10th Pass / ITI / Graduation"
                            className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.eligibility}
                            onChange={e => setFormData({ ...formData, eligibility: e.target.value })}
                        />
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? 'Posting...' : <><Save className="w-5 h-5" /> Publish Notification</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
