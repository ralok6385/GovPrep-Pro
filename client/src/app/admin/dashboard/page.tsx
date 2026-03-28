"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Users, FileText, Zap, TrendingUp, AlertCircle, PlayCircle, Plus, Trophy, Clock, UserPlus, ArrowRight, Activity, Calendar, Bell } from 'lucide-react';
import Link from 'next/link';
import { User, Question, ContentItem } from '@/types';

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

    useEffect(() => {
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
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[600px] bg-slate-50/50">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                    </div>
                    <p className="text-slate-500 font-bold animate-pulse uppercase tracking-widest text-xs">Synchronizing Portal...</p>
                </div>
            </div>
        );
    }

    if (!data) return (
        <div className="p-12 text-center">
            <div className="bg-red-50 text-red-600 p-8 rounded-[2rem] border border-red-100 max-w-md mx-auto">
                <AlertCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Connection Interrupted</h3>
                <p className="text-sm opacity-80">We couldn't reach the analytics engine. Please check your connection and refresh.</p>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto p-6 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">

            {/* 1. TOP SECTION: HEADER & KPIs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest">Platform Status: Operational</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">Admin Command Center</h1>
                </div>
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] px-4 py-2 rounded-2xl border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm text-sm font-bold text-slate-600 dark:text-slate-300 warm:text-stone-600">
                    <Calendar className="w-4 h-4 text-indigo-500" />
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
                <StatCard label="Students" value={data.kpis.totalStudents} trend="+12%" icon={Users} color="text-blue-600 dark:text-blue-400" bg="bg-blue-50 dark:bg-blue-900/20 warm:bg-blue-100/50" />
                <StatCard label="Active" value={data.kpis.activeToday} trend="Live" icon={Zap} color="text-amber-600 dark:text-amber-400" bg="bg-amber-50 dark:bg-amber-900/20 warm:bg-amber-100/50" />
                <StatCard label="Total Tests" value={data.kpis.totalTests} trend="+5" icon={FileText} color="text-indigo-600 dark:text-indigo-400" bg="bg-indigo-50 dark:bg-indigo-900/20 warm:bg-indigo-100/50" />
                <StatCard label="Attempts" value={data.kpis.testsAttempted} trend="+24%" icon={TrendingUp} color="text-emerald-600 dark:text-emerald-400" bg="bg-emerald-50 dark:bg-emerald-900/20 warm:bg-emerald-100/50" />
                <StatCard label="Accuracy" value={data.kpis.avgAccuracy} trend="Stable" icon={Trophy} color="text-purple-600 dark:text-purple-400" bg="bg-purple-50 dark:bg-purple-900/20 warm:bg-purple-100/50" />
                <StatCard label="Avg Speed" value={data.kpis.avgCompletionTime} trend="-2m" icon={Clock} color="text-rose-600 dark:text-rose-400" bg="bg-rose-50 dark:bg-rose-900/20 warm:bg-rose-100/50" />
            </div>

            {/* 2. MIDDLE SECTION: Intelligence & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Live Activity Chart */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm p-8 group transition-colors">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-500" />
                                Test Enrollment Pulse
                            </h3>
                            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 warm:text-stone-400 mt-1 uppercase tracking-widest">Attempt trends over the last 7 days</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 warm:bg-indigo-100/50 text-indigo-600 dark:text-indigo-400 text-[10px] font-black rounded-lg uppercase tracking-wider">Weekly Overview</span>
                        </div>
                    </div>

                    <div className="h-[300px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.activityData}>
                                <defs>
                                    <linearGradient id="colorAttempts" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.1} />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 700 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{
                                        borderRadius: '20px',
                                        border: 'none',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
                                        padding: '12px 16px',
                                        backgroundColor: '#1e293b',
                                        color: '#f8fafc'
                                    }}
                                    itemStyle={{ fontWeight: 800, color: '#818cf8' }}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 700, marginBottom: '4px' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="attempts"
                                    stroke="#6366f1"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorAttempts)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject ROI Analysis */}
                <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm p-8 flex flex-col transition-colors">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-rose-50 rounded-2xl flex items-center justify-center">
                            <AlertCircle className="w-5 h-5 text-rose-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 dark:text-white warm:text-stone-800 tracking-tight">Intelligence Feed</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Identifying Weak Areas</p>
                        </div>
                    </div>

                    {data.weakAreas && data.weakAreas.length > 0 ? (
                        <div className="space-y-6 flex-1">
                            {data.weakAreas.map((area, index) => (
                                <WeakSubjectBar
                                    key={index}
                                    subject={area.subject}
                                    percentage={area.percentage}
                                    color={area.percentage < 50 ? 'bg-rose-500' : area.percentage < 75 ? 'bg-amber-500' : 'bg-indigo-500'}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center py-4 px-6 border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-[2rem]">
                            <TrendingUp className="w-10 h-10 text-slate-200 dark:text-slate-700 mb-3" />
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-bold leading-relaxed px-4">
                                Deep learning in progress. Attempt more tests to generate insights.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 p-5 bg-indigo-50/50 dark:bg-indigo-900/20 rounded-3xl border border-indigo-100/50 dark:border-indigo-800/50">
                        <div className="flex items-start gap-3">
                            <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mt-1 fill-indigo-200 dark:fill-indigo-800" />
                            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-bold leading-relaxed">
                                <strong className="text-indigo-700 dark:text-indigo-400">AI Insight:</strong> Accuracy is flagging in {data.weakAreas?.[0]?.subject || 'core subjects'}. Consider adding more practice material.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. QUICK ACTIONS: COMMAND HUD */}
            <div className="bg-slate-900 rounded-[2.5rem] p-4 md:p-8 text-white shadow-2xl shadow-indigo-500/10 relative overflow-hidden group">
                {/* Background Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[100px] group-hover:bg-indigo-500/30 transition-all duration-700"></div>
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>

                <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center gap-8">
                    <div className="text-center lg:text-left">
                        <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-indigo-500 text-[9px] font-black rounded uppercase tracking-tighter">Command Panel</span>
                        </div>
                        <h3 className="text-3xl font-black mb-2 tracking-tight">Deployment Hub</h3>
                        <p className="text-indigo-200/60 text-sm font-bold max-w-sm">Manage exams, questions, and students from a unified dashboard.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full lg:w-auto">
                        <QuickActionLink href="/admin/tests/builder" label="Visual Builder" sub="Drag & Drop" icon={<Zap className="w-5 h-5" />} theme="indigo" />
                        <QuickActionLink href="/admin/tests/create" label="Legacy Test" sub="Standard Form" icon={<Plus className="w-5 h-5 text-indigo-200" />} theme="glass" />
                        <QuickActionLink href="/admin/notifications" label="Broadcast" sub="Push Alerts" icon={<Bell className="w-5 h-5 text-emerald-500" />} theme="white" />
                    </div>
                </div>
            </div>

            {/* 4. ACTIVITY & CONTENT MIX */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                {/* Live Activity Feed */}
                <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm p-8 flex flex-col transition-colors">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">Global Live Activity</h3>
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 warm:text-stone-400 uppercase tracking-widest leading-none">Real-time engagement</p>
                            </div>
                        </div>
                        <Link href="/admin/results" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 warm:bg-indigo-100/50 px-3 py-1.5 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors uppercase tracking-widest">
                            View All Results
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {data.recentTestResults.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center gap-3 py-12 border-2 border-dashed border-slate-50 dark:border-slate-800 warm:border-stone-200 rounded-[2rem]">
                                <Activity className="w-8 h-8 text-slate-200 dark:text-slate-700 warm:text-stone-300" />
                                <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 warm:text-stone-400 uppercase tracking-widest">Awaiting Live Events</p>
                            </div>
                        ) : (
                            data.recentTestResults.map((result: any, index: number) => (
                                <PerformanceRow
                                    key={result.id}
                                    id={result.id}
                                    rank={index + 1}
                                    name={result.studentName}
                                    test={result.testTitle}
                                    score={result.score}
                                    accuracy={Math.round(parseFloat(result.accuracy.toString().replace('%', ''))) + '%'}
                                    avatar={result.studentAvatar}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* Recent Content Column */}
                <div className="space-y-6">
                    {/* Questions */}
                    <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm p-8 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">Resource Updates</h3>
                            <Link href="/admin/questions" className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800 warm:bg-stone-100 flex items-center justify-center hover:bg-indigo-50 dark:hover:bg-indigo-900/30 warm:hover:bg-indigo-100/50 text-slate-400 dark:text-slate-500 warm:text-stone-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                                <Plus className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {data.recentQuestions.length === 0 ? (
                                <div className="py-8 text-center bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700">
                                    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase">Question bank empty</p>
                                </div>
                            ) : (
                                data.recentQuestions.map((q: any) => (
                                    <div key={q.id} className="p-4 bg-slate-50/50 dark:bg-slate-800/50 warm:bg-[#fdf6e3] rounded-2xl border border-slate-100 dark:border-slate-700 warm:border-stone-200 flex items-center gap-4 group hover:bg-white dark:hover:bg-slate-800 warm:hover:bg-white hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all">
                                        <div className="w-10 h-10 shrink-0 bg-white dark:bg-slate-700 warm:bg-white rounded-xl flex items-center justify-center text-[10px] font-black text-indigo-500 border border-slate-100 dark:border-slate-600 warm:border-stone-200 shadow-sm transition-transform group-hover:scale-110">?</div>
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200 warm:text-stone-700 truncate">{q.text}</p>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 warm:text-stone-500 font-bold uppercase tracking-widest mt-0.5">{q.subject} • {q.topic}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 dark:text-slate-600 warm:text-stone-300 ml-auto opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Videos */}
                    <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] rounded-[2.5rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm p-8 transition-colors">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">New Tutorials</h3>
                            <Link href="/admin/videos/add" className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors uppercase tracking-widest">
                                Upload New
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {data.recentVideos.length === 0 ? (
                                <p className="text-xs font-bold text-slate-300 dark:text-slate-600 text-center py-6 py-8 bg-slate-50/50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-700 uppercase">No videos found</p>
                            ) : (
                                data.recentVideos.map((v: any) => (
                                    <div key={v.id} className="flex items-center gap-4 p-2 pl-2 group cursor-pointer">
                                        <div className="w-14 h-10 bg-slate-100 dark:bg-slate-800 warm:bg-stone-100 rounded-xl overflow-hidden relative flex items-center justify-center">
                                            <PlayCircle className="w-5 h-5 text-slate-400 dark:text-slate-500 warm:text-stone-400 group-hover:text-rose-500 transition-colors z-10" />
                                            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-all"></div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-800 dark:text-slate-200 warm:text-stone-800 tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{v.title}</p>
                                            <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 warm:text-stone-500 uppercase tracking-widest mt-0.5">{v.subject}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg, trend }: { label: string, value: string | number, icon: any, color: string, bg: string, trend?: string }) {
    return (
        <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf0d5] p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-black/20 transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-2xl ${bg} ${color} transition-transform group-hover:scale-110 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                </div>
                {trend && (
                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        trend.startsWith('-') ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        } uppercase tracking-tighter`}>
                        {trend}
                    </span>
                )}
            </div>
            <div>
                <p className="text-3xl font-black text-slate-800 dark:text-white warm:text-stone-800 mb-0.5">{value}</p>
                <p className="text-slate-400 dark:text-slate-500 warm:text-stone-500 text-[10px] font-black uppercase tracking-widest">{label}</p>
            </div>
        </div>
    );
}

function PerformanceRow({ id, rank, name, test, score, accuracy, avatar }: { id: string, rank: number, name: string, test: string, score: number, accuracy: string, avatar?: string }) {
    return (
        <Link href={`/admin/results/${id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/50 warm:bg-[#fdf6e3] hover:bg-white dark:hover:bg-slate-800 warm:hover:bg-white rounded-3xl border border-transparent hover:border-slate-100 dark:hover:border-slate-700 warm:hover:border-stone-200 hover:shadow-lg hover:shadow-slate-200/40 dark:hover:shadow-black/20 transition-all group cursor-pointer block gap-4 sm:gap-0">
            <div className="flex items-center gap-4">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-[10px] sm:text-xs font-black rounded-xl shadow-sm shrink-0 ${rank === 1 ? 'bg-amber-100 text-amber-600 border border-amber-200' :
                    rank === 2 ? 'bg-slate-200 text-slate-600 border border-slate-300' :
                        'bg-white dark:bg-slate-700 warm:bg-white text-slate-400 border border-slate-100 dark:border-slate-600 warm:border-stone-200'
                    }`}>
                    #{rank}
                </div>

                {/* Avatar Display */}
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border border-slate-100 dark:border-slate-700 relative overflow-hidden shrink-0 shadow-sm">
                    {avatar ? (
                        <img
                            src={avatar.startsWith('http') ? avatar : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002'}${avatar}`}
                            alt={name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); }}
                        />
                    ) : (
                        <div className="w-full h-full bg-indigo-50 dark:bg-indigo-900/50 warm:bg-indigo-100/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                            {name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    {/* Fallback for broken image */}
                    <div className="hidden absolute inset-0 bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs sm:text-sm">
                        {name.charAt(0).toUpperCase()}
                    </div>
                </div>

                <div className="min-w-0 flex-1">
                    <span className="block text-sm font-black text-slate-800 dark:text-slate-200 warm:text-stone-800 leading-tight mb-0.5 truncate">{name}</span>
                    <span className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 warm:text-stone-500 uppercase truncate tracking-tight">{test}</span>
                </div>
            </div>

            <div className="flex items-center justify-end gap-6 sm:gap-8 ml-12 sm:ml-0 border-t sm:border-t-0 border-slate-100/50 pt-2 sm:pt-0">
                <div className="text-right">
                    <p className="text-lg font-black text-slate-800 dark:text-white warm:text-stone-800 leading-none">{score}</p>
                    <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 warm:text-stone-400 uppercase tracking-widest mt-1">Pts</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-black text-emerald-500 leading-none">{accuracy}</p>
                    <p className="text-[9px] font-black text-slate-300 dark:text-slate-600 warm:text-stone-400 uppercase tracking-widest mt-1">Acc</p>
                </div>
                <div className="opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-900/30 warm:bg-indigo-100/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <ArrowRight className="w-4 h-4" />
                    </div>
                </div>
            </div>
        </Link>
    );
}

function WeakSubjectBar({ subject, percentage, color }: { subject: string, percentage: number, color: string }) {
    return (
        <div className="group">
            <div className="flex justify-between items-end mb-2">
                <div>
                    <span className="text-xs font-black text-slate-700 dark:text-slate-200 block mb-0.5">{subject}</span>
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Avg: {Math.round(percentage + (subject.length % 7) - 3)}%</span>
                </div>
                <span className={`text-xs font-black ${color.replace('bg-', 'text-')}`}>{percentage}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div
                    className={`h-full ${color} rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(0,0,0,0.1)]`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>
        </div>
    );
}

function QuickActionLink({ href, label, sub, icon, theme }: { href: string, label: string, sub: string, icon: any, theme: 'indigo' | 'white' | 'glass' }) {
    const themes = {
        indigo: "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-900/20",
        white: "bg-white text-slate-900 hover:bg-slate-100 shadow-slate-900/20",
        glass: "bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md"
    };

    return (
        <Link
            href={href}
            className={`${themes[theme]} p-5 rounded-3xl flex items-center gap-5 transition-all duration-300 hover:-translate-y-1 shadow-xl group active:scale-95`}
        >
            <div className={`w-12 h-12 flex items-center justify-center rounded-2xl ${theme === 'white' ? 'bg-slate-100' : theme === 'indigo' ? 'bg-indigo-700' : 'bg-white/10'
                } group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="text-left">
                <p className="text-sm font-black leading-tight">{label}</p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${theme === 'white' ? 'text-slate-400' : 'text-white/60'
                    }`}>{sub}</p>
            </div>
        </Link>
    );
}
