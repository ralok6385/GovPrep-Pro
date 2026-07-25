"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { 
    Users, FileText, Zap, TrendingUp, AlertCircle, PlayCircle, Plus, Trophy, Clock, 
    UserPlus, ArrowRight, Activity, Calendar, Bell, Sparkles, FileQuestion, UploadCloud, ShieldCheck, Bot
} from 'lucide-react';
import Link from 'next/link';
import { User, Question, ContentItem } from '@/types';
import AdminAiQuestionGenerator from '@/components/Admin/AdminAiQuestionGenerator';
import StudentRiskRadar from '@/components/Admin/StudentRiskRadar';

interface DashboardData {
    kpis: {
        totalStudents: number;
        activeToday: number;
        totalTests: number;
        testsAttempted: number;
        avgAccuracy: string;
        avgCompletionTime: string;
    };
    recentUsers: User[];
    recentQuestions: Question[];
    recentVideos: ContentItem[];
    recentTestResults: any[];
    activityData: { name: string; attempts: number }[];
    weakAreas: { subject: string; percentage: number }[];
}

export default function AdminDashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            setData(response.data);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[600px]">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest animate-pulse">Loading Operations Center...</p>
                </div>
            </div>
        );
    }

    if (!data) return (
        <div className="p-8 max-w-md mx-auto text-center">
            <div className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50">
                <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                <h3 className="text-base font-bold mb-1">Analytics Engine Disconnected</h3>
                <p className="text-xs opacity-80">Unable to establish connection with server. Please refresh page.</p>
            </div>
        </div>
    );

    return (
        <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

            {/* AI Generator Modal */}
            <AdminAiQuestionGenerator
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
                onSuccess={fetchData}
            />

            {/* Top Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Admin Operations Control</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Manage Railway exam series, student engagement, and AI question authoring.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsAiModalOpen(true)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
                    >
                        <Bot className="w-4 h-4" />
                        AI Question Author
                    </button>
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm text-xs font-bold text-slate-700 dark:text-slate-300">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Executive 4-KPI Metric Strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Total Aspirants</p>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white">{data.kpis.totalStudents}</h3>
                    </div>
                    <div className="w-11 h-11 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-200/60 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Users className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Active Today</p>
                        <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400">{data.kpis.activeToday}</h3>
                    </div>
                    <div className="w-11 h-11 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Zap className="w-5 h-5 fill-current" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Test Attempts</p>
                        <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{data.kpis.testsAttempted}</h3>
                    </div>
                    <div className="w-11 h-11 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200/60 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">System Accuracy</p>
                        <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400">{data.kpis.avgAccuracy}</h3>
                    </div>
                    <div className="w-11 h-11 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-200/60 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <Trophy className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div>
                <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    Quick Admin Workflows
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <button onClick={() => setIsAiModalOpen(true)} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-indigo-500 transition-all group flex flex-col justify-between text-left">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
                                <Bot className="w-5 h-5 text-indigo-600" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-indigo-600 transition-colors">AI Question Author</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Generate TCS questions with AI explanations.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
                            Launch Author <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </button>

                    <Link href="/admin/tests/builder" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all group flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                <FileText className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 transition-colors">Build Mock Test</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Create new CBT-1 or CBT-2 mock exams.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                            Build Test <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>

                    <Link href="/admin/content/add" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-500 transition-all group flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                                <UploadCloud className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-amber-600 transition-colors">Upload Study PDF</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Upload verified class notes and material.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                            Upload File <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>

                    <Link href="/admin/notifications" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-500 transition-all group flex flex-col justify-between">
                        <div>
                            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-rose-600 transition-colors">Broadcast Alert</h3>
                            <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Send push alerts directly to active users.</p>
                        </div>
                        <div className="mt-4 flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400">
                            Create Alert <ArrowRight className="w-3.5 h-3.5" />
                        </div>
                    </Link>
                </div>
            </div>

            {/* Test Activity Chart & Student Risk Radar */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Daily Exam Submissions</h3>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Student test attempt frequency over past 7 days</p>
                            </div>
                        </div>

                        <div className="h-56 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={data.activityData}>
                                    <defs>
                                        <linearGradient id="adminChart" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis hide />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        itemStyle={{ fontWeight: 'bold' }}
                                    />
                                    <Area type="monotone" dataKey="attempts" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#adminChart)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <StudentRiskRadar users={data.recentUsers} />

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Aspirant Registrations</h3>
                                <Link href="/admin/users" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                    View Roster
                                </Link>
                            </div>

                            <div className="space-y-3">
                                {data.recentUsers.slice(0, 3).map((u: any) => (
                                    <div key={u._id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                        <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{u.name}</p>
                                            <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                                        </div>
                                        <span className="bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                                            {u.targetExam || 'NTPC'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
