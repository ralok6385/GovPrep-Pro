"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { BarChart2, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Edit2, Trash2, Medal, Save, X, Eye, RotateCcw, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function ResultsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Filtering State
    // Pagination State
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [testFilter, setTestFilter] = useState('all');

    // Delete State
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editScore, setEditScore] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    // Review Modal State
    const [reviewId, setReviewId] = useState<string | null>(null);
    const [reviewData, setReviewData] = useState<any>(null);
    const [reviewLoading, setReviewLoading] = useState(false);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            fetchResults();
        }, 500); // Debounce search
        return () => clearTimeout(timeoutId);
    }, [page, searchQuery, testFilter]);

    const fetchResults = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 15 };
            if (searchQuery) params.search = searchQuery;
            if (testFilter !== 'all') params.testId = testFilter;

            const { data } = await api.get('/tests/results/all', { params });
            setStats(data);
            setTotalPages(data.totalPages);
        } catch (error) {
            console.error('Failed to fetch results', error);
            toast.error('Failed to load results');
        } finally {
            setLoading(false);
        }
    };

    // ... (keep fetchReview, handleDelete, confirmDelete, startEdit, saveEdit) ...
    const fetchReview = async (id: string) => {
        setReviewId(id);
        setReviewLoading(true);
        try {
            const { data } = await api.get(`/tests/results/${id}`);
            setReviewData(data);
        } catch (error) {
            toast.error('Failed to load details');
            setReviewId(null);
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDelete = (id: string) => {
        setDeleteId(id);
    };

    const confirmDelete = async () => {
        if (!deleteId) return;
        setDeleteLoading(true);
        try {
            await api.delete(`/tests/results/${deleteId}`);
            toast.success('Result deleted');
            setDeleteId(null);
            fetchResults(); // Refresh
        } catch (error) {
            toast.error('Delete failed');
        } finally {
            setDeleteLoading(false);
        }
    };

    const startEdit = (result: any) => {
        setEditingId(result._id);
        setEditScore(result.score.toString());
    };

    const saveEdit = async () => {
        if (!editingId) return;
        setEditLoading(true);
        try {
            await api.put(`/tests/results/${editingId}`, { score: Number(editScore) });
            toast.success('Score updated');
            setEditingId(null);
            fetchResults(); // Refresh
        } catch (error) {
            toast.error('Update failed');
        } finally {
            setEditLoading(false);
        }
    };

    // Use results directly from API
    const filteredResults = stats?.results || [];

    // Note: We lost 'uniqueTests' from full data. We need to fetch it.
    // For now, I'll comment out the dynamic options or fetch them.
    // Let's add a separate effect to fetch available tests for the filter.
    const [availableTests, setAvailableTests] = useState<any[]>([]);
    useEffect(() => {
        api.get('/tests').then(({ data }) => setAvailableTests(data)).catch(() => { });
    }, []);


    if (loading && !stats) { // Only full screen load on first fetch
        return (
            <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-bold animate-pulse">Loading analytics...</p>
            </div>
        );
    }

    if (!stats && !loading) return <div className="p-8 text-center bg-slate-50 min-h-screen pt-20 font-bold text-slate-400">Failed to connect to analytics server.</div>;

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 pb-32">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3 tracking-tight">
                        <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
                            <BarChart2 className="w-6 h-6 text-white" />
                        </div>
                        Results & Analytics
                    </h1>
                    <p className="text-slate-500 text-sm mt-1.5 font-medium ml-1">Monitor student performance and exam metrics.</p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Users className="w-7 h-7 text-indigo-600" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Total Attempts</p>
                        <p className="text-3xl font-black text-slate-800">{stats?.totalTests || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <TrendingUp className="w-7 h-7 text-emerald-600" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Avg. Score</p>
                        <p className="text-3xl font-black text-slate-800">{stats?.avgScore || 0}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5 group hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Clock className="w-7 h-7 text-amber-600" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-0.5">Last Activity</p>
                        <p className="text-xl font-black text-slate-800">
                            {filteredResults.length > 0 ? new Date(filteredResults[0].createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'N/A'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Filtering & Table Section */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
                <div className="px-8 py-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
                    <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Recent Test Submissions</h2>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Input */}
                        <div className="relative">
                            <Save className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search student..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                                className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none w-48 transition-all"
                            />
                        </div>

                        {/* Exam Filter */}
                        <select
                            value={testFilter}
                            onChange={(e) => { setTestFilter(e.target.value); setPage(1); }}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all cursor-pointer max-w-[200px]"
                        >
                            <option value="all">All Exams</option>
                            {availableTests.map((t: any) => (
                                <option key={t._id} value={t._id}>{t.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/80 border-b border-slate-200">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Info</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Test Title</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Performance</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Security</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-10 text-center">
                                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    </td>
                                </tr>
                            )}
                            {!loading && filteredResults.map((result: any) => (
                                <tr key={result._id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-black text-xs">
                                                {result.studentId?.name?.[0] || '?'}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm leading-none mb-1">{result.studentId?.name || 'Unknown'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{result.studentId?.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-black text-indigo-600 truncate max-w-xs">{result.testId?.title || 'Deleted Test'}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                {new Date(result.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center gap-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Score</p>
                                                <span className={`text-lg font-black ${result.score >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                                    {result.score}
                                                </span>
                                            </div>
                                            <div className="hidden sm:block">
                                                <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Rank</p>
                                                <div className="flex items-center gap-1 font-black text-slate-700">
                                                    <Medal className={`w-3 h-3 ${result.rank === 1 ? 'text-amber-400' : result.rank === 2 ? 'text-slate-400' : 'text-amber-700'}`} />
                                                    #{result.rank || '-'}
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-300 uppercase leading-none mb-1">Accuracy</p>
                                                <span className="text-xs font-black text-slate-600">{Math.round(result.accuracy || 0)}%</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4">
                                        {result.tabSwitchWarnings > 0 ? (
                                            <div className="flex flex-col">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase text-center w-fit ${result.isAutoSubmitted ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                                                    {result.tabSwitchWarnings} Switches {result.isAutoSubmitted && "🚩"}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-200 text-[10px] font-black uppercase">Secure</span>
                                        )}
                                    </td>
                                    <td className="px-8 py-4">
                                        <div className="flex items-center justify-end gap-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => fetchReview(result._id)}
                                                className="p-2 hover:bg-emerald-50 text-emerald-600 rounded-xl transition-all hover:scale-110" title="Review Incorrect Questions"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => startEdit(result)}
                                                className="p-2 hover:bg-indigo-50 text-indigo-600 rounded-xl transition-all hover:scale-110" title="Update Score"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(result._id)}
                                                className="p-2 hover:bg-rose-50 text-rose-500 rounded-xl transition-all hover:scale-110" title="Reset Entire Attempt"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filteredResults.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center">
                                                <X className="w-8 h-8 text-slate-200" />
                                            </div>
                                            <p className="font-black text-slate-300 uppercase tracking-widest text-xs">No matching results found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-8 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                    <p className="text-xs font-bold text-slate-400">
                        Page {page} of {totalPages}
                    </p>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            Previous
                        </button>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Review Modal (Showing Incorrect Questions) */}
            {reviewId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 border-l border-slate-200">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800 tracking-tight">Performance Breakdown</h3>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Analyzing mistakes for {reviewData?.studentId?.name}</p>
                            </div>
                            <button
                                onClick={() => { setReviewId(null); setReviewData(null); }}
                                className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-400"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {reviewLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4">
                                    <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching responses...</p>
                                </div>
                            ) : reviewData ? (
                                <>
                                    {/* Stats Summary In Modal */}
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Correct</p>
                                            <p className="text-2xl font-black text-emerald-700">{reviewData.responses?.filter((r: any) => r.isCorrect).length}</p>
                                        </div>
                                        <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100">
                                            <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1">Incorrect</p>
                                            <p className="text-2xl font-black text-rose-700">{reviewData.responses?.filter((r: any) => !r.isCorrect && r.selectedOption).length}</p>
                                        </div>
                                        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Skipped</p>
                                            <p className="text-2xl font-black text-slate-600">{reviewData.responses?.filter((r: any) => !r.selectedOption).length}</p>
                                        </div>
                                    </div>

                                    {/* Incorrect Questions List */}
                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3 text-rose-500" />
                                            Mistakes Analysis
                                        </h4>

                                        {reviewData.responses?.filter((r: any) => !r.isCorrect && r.selectedOption).length > 0 ? (
                                            reviewData.responses.filter((r: any) => !r.isCorrect && r.selectedOption).map((resp: any, idx: number) => (
                                                <div key={resp._id} className="bg-white border-2 border-slate-100 rounded-3xl p-6 hover:border-rose-200 transition-colors shadow-sm">
                                                    <div className="flex gap-4 mb-4">
                                                        <span className="shrink-0 w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-black text-sm border border-rose-100">
                                                            {idx + 1}
                                                        </span>
                                                        <p className="text-sm font-black text-slate-700 leading-relaxed pt-1" dangerouslySetInnerHTML={{ __html: resp.questionId?.text }}></p>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3 ">
                                                        <div className="bg-rose-50/50 p-3 rounded-2xl border border-rose-100">
                                                            <p className="text-[9px] font-black text-rose-400 uppercase tracking-tight mb-1">Student Picked</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-md bg-rose-500 text-white flex items-center justify-center text-[10px] font-black">{resp.selectedOption}</span>
                                                                <span className="text-xs font-bold text-rose-700">{resp.questionId?.[`option${resp.selectedOption}`]}</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                                                            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-tight mb-1">Correct Answer</p>
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-5 h-5 rounded-md bg-emerald-500 text-white flex items-center justify-center text-[10px] font-black">{resp.questionId?.correctOption}</span>
                                                                <span className="text-xs font-bold text-emerald-700">{resp.questionId?.[`option${resp.questionId?.correctOption}`]}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {resp.questionId?.explanation && (
                                                        <div className="mt-4 pt-4 border-t border-slate-50">
                                                            <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                                                                <Sparkles className="w-3 h-3 fill-amber-500" /> Explanation
                                                            </p>
                                                            <p className="text-xs font-bold text-slate-500 leading-relaxed italic">{resp.questionId?.explanation}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="bg-emerald-50 py-12 rounded-[2rem] border-2 border-dashed border-emerald-200 flex flex-col items-center justify-center text-center p-8">
                                                <CheckCircle className="w-12 h-12 text-emerald-500 mb-4 animate-bounce" />
                                                <p className="font-black text-emerald-700 text-lg">Perfect Score!</p>
                                                <p className="text-emerald-600/60 text-xs font-bold mt-1 uppercase tracking-widest">No mistakes found in this attempt.</p>
                                            </div>
                                        )}
                                    </div>
                                </>
                            ) : null}
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
                            <button
                                onClick={() => { setReviewId(null); setReviewData(null); }}
                                className="w-full py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-lg active:scale-95"
                            >
                                CLOSE ANALYSIS
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal (Keeping for functionality) */}
            {editingId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-8 animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
                            <Edit2 className="w-8 h-8 text-indigo-600" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">Modify Score</h3>
                        <p className="text-slate-400 text-sm font-bold mb-6">Enter the manual score override for this student's attempt.</p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Numerical Score</label>
                            <input
                                type="number"
                                value={editScore}
                                onChange={(e) => setEditScore(e.target.value)}
                                className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-lg font-black text-slate-800 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setEditingId(null)}
                                className="flex-1 py-4 text-slate-500 font-black hover:bg-slate-100 rounded-2xl transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={saveEdit}
                                disabled={editLoading}
                                className="flex-1 py-4 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 disabled:opacity-50 transition-all active:scale-95"
                            >
                                {editLoading ? 'Updating...' : 'Save Score'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Modal (Keeping for functionality) */}
            {deleteId && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl border border-slate-200 transform animate-in zoom-in-95 duration-200 text-center">
                        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <RotateCcw className="w-10 h-10 text-rose-500 animate-spin-reverse" style={{ animationDuration: '3s' }} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Reset Attempt?</h3>
                        <p className="text-slate-500 font-medium mb-8">
                            This will permanently delete the student's current score and allow them to <span className="text-rose-600 font-black italic">restart the test from scratch</span>.
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="flex-1 px-6 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black hover:bg-slate-200 transition-all"
                            >
                                Nevermind
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={deleteLoading}
                                className="flex-1 px-6 py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 shadow-2xl shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {deleteLoading ? 'Resetting...' : 'Confirm Reset'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
