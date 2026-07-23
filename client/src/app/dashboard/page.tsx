"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BookOpen, Play, Train, ArrowRight, Bell, Star, Clock, Sparkles, ChevronRight, Zap, Trophy, FileText, TrendingUp, AlertCircle, History, Target, Swords, CalendarDays, X, ShieldCheck } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ExamCategories from '@/components/Dashboard/ExamCategories';
import StreakWidget from '@/components/Dashboard/StreakWidget';
import LeaderboardTicker from '@/components/Dashboard/LeaderboardTicker';
import WeaknessHeatmap from '@/components/Dashboard/WeaknessHeatmap';
import XPProgress from '@/components/Dashboard/XPProgress';
import UserAvatar from '@/components/UserAvatar';

import { ContentItem, Subject } from '@/types';

// Helper: get YouTube embed URL from any YouTube link format
function getYTEmbed(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0`
        : null;
}

function getYTThumb(url: string): string | null {
    if (!url) return null;
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
        ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg`
        : null;
}

// Exam countdown configuration
const EXAM_DATES: Record<string, { name: string; date: string }> = {
    'NTPC CBT-1': { name: 'RRB NTPC CBT-1', date: '2025-09-01' },
    'Group D': { name: 'RRB Group D', date: '2025-10-15' },
    'ALP': { name: 'RRB ALP', date: '2025-11-01' },
    'JE': { name: 'RRB JE', date: '2025-12-01' },
};

function useCountdown(targetExam?: string) {
    const examEntry = Object.entries(EXAM_DATES).find(([key]) =>
        targetExam?.toLowerCase().includes(key.toLowerCase())
    );
    if (!examEntry) return null;
    const [, { name, date }] = examEntry;
    const diff = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
    return diff > 0 ? { name, daysLeft: diff } : null;
}

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const countdown = useCountdown(user?.targetExam);
    const [videoModal, setVideoModal] = useState<{ url: string; title: string } | null>(null);
    const [recentVideos, setRecentVideos] = useState<ContentItem[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [latestUpdate, setLatestUpdate] = useState<any>(null);
    const [loadingData, setLoadingData] = useState(true);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (user) {
            fetchDashboardData();
        }
    }, [user, loading, router]);

    const fetchDashboardData = async () => {
        try {
            const [videosRes, subjectsRes, statsRes, historyRes] = await Promise.all([
                api.get('/content?type=video'),
                api.get('/subjects?all=true'),
                api.get('/analytics/student'),
                api.get('/tests/results/me')
            ]);
            setRecentVideos(videosRes.data.slice(0, 4));
            setSubjects(subjectsRes.data);
            setStats(statsRes.data);
            setHistory(historyRes.data.slice(0, 4));

            try {
                const { data: notifData } = await api.get('/notifications');
                if (notifData?.notifications?.length > 0) {
                    setLatestUpdate(notifData.notifications[0]);
                }
            } catch (e) { /* silent */ }
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading RailPath Engine...</p>
                </div>
            </div>
        );
    }

    const getSubjectColor = (index: number) => {
        const colors = [
            'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
            'bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
            'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
            'bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400',
            'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400',
            'bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
        ];
        return colors[index % colors.length];
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24">
            <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-4">

                {/* LEFT MAIN CONTENT COLUMN (8 Cols) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Ticker Banner */}
                    <LeaderboardTicker />

                    {/* Executive Greeting Banner */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <UserAvatar src={user.avatar} name={user.name} size="lg" />
                            <div>
                                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                                    {(() => {
                                        const h = new Date().getHours();
                                        return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
                                    })()}, {user?.name.split(' ')[0]} 👋
                                </h1>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                                    Ready to move one step closer to selection? Let's make today count.
                                </p>
                            </div>
                        </div>

                        {countdown && (
                            <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-950/40 px-4 py-2.5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                                <CalendarDays className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{countdown.name}</p>
                                    <p className="text-sm font-black text-slate-900 dark:text-white">{countdown.daysLeft} Days Left</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Today's Focus Action Section */}
                    <div>
                        <h2 className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-500" />
                            Today's Action Plan
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* 1. Daily Speed Quiz Card */}
                            <Link href="/dashboard/tests?type=quiz" className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-500 transition-all group flex flex-col justify-between relative overflow-hidden">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center text-amber-500">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider">
                                        5 MINS
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-base mb-1 group-hover:text-amber-600 transition-colors">Daily Speed Quiz</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">Boost speed & accuracy with fresh questions.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                                    Start Speed Test <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </Link>

                            {/* 2. Streak Calendar Card */}
                            <div className="h-full">
                                <StreakWidget />
                            </div>

                            {/* 3. Recommended Full Mock Challenge */}
                            <div onClick={() => router.push('/dashboard/tests?type=exam')} className="bg-gradient-to-br from-indigo-600 to-purple-600 p-5 rounded-3xl shadow-lg shadow-indigo-500/20 cursor-pointer group relative overflow-hidden text-white flex flex-col justify-between hover:scale-[1.02] transition-transform">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white border border-white/10">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider backdrop-blur-md border border-white/10">
                                        RECOMMENDED
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-base mb-1">Full Mock Test</h3>
                                    <p className="text-xs text-indigo-100 font-medium leading-relaxed opacity-90">Compete with 1,000+ railway aspirants live.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/20 w-fit px-3 py-1.5 rounded-xl hover:bg-white hover:text-indigo-600 transition-all border border-white/10">
                                    Take Exam Now <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Practice Strip */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Link href="/dashboard/practice" className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-emerald-400 dark:hover:border-emerald-500 transition-all group flex items-center gap-4">
                            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                <Target className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">Topic Practice</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Master one chapter at a time with instant feedback</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                        </Link>

                        <Link href="/dashboard/battle" className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-rose-400 dark:hover:border-rose-500 transition-all group flex items-center gap-4">
                            <div className="w-12 h-12 bg-rose-50 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                                <Swords className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-900 dark:text-white text-base group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">Battle Arena 1v1</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Challenge active students in real-time speed duels</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                        </Link>
                    </div>

                    {/* XP Progress Bar */}
                    <XPProgress />

                    {/* Performance Trend & Analytics Section */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Performance Accuracy Trend
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Your accuracy rating across your recent test submissions</p>
                            </div>
                            <Link href="/dashboard/analytics" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                Full Analytics <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="h-52 w-full">
                            {stats?.recentTrend && stats.recentTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.recentTrend}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="createdAt"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            formatter={(val: any) => [`${val}%`, 'Accuracy']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke="#4f46e5"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTrend)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-950 rounded-2xl">
                                    <Clock className="w-8 h-8 opacity-30 text-indigo-500" />
                                    <p className="text-xs font-semibold">Complete your first mock test to unlock performance analytics</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weakness Heatmap & Exam History Side-by-Side Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <WeaknessHeatmap />

                        {/* Exam History Log */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <History className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                        Recent Exam History
                                    </h3>
                                    <Link href="/dashboard/history" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-3">
                                    {history.length > 0 ? (
                                        history.map((h: any) => (
                                            <Link
                                                key={h._id}
                                                href={`/dashboard/analysis/${h._id}`}
                                                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        h.accuracy >= 70 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                                                    }`}>
                                                        {h.accuracy ? Math.round(h.accuracy) : 0}%
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{h.testId?.title || 'Mock Exam'}</p>
                                                        <p className="text-[10px] text-slate-400 font-medium">Rank #{h.rank || '--'} • Score: {h.score}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs font-semibold text-slate-500">No test attempts logged yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Exams Selection */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Train className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                Target Railway Exams
                            </h2>
                        </div>
                        <ExamCategories />
                    </div>

                    {/* My Subjects Grid */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                My Subjects & Preparation Material
                            </h2>
                            <Link href="/dashboard/study-material" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                View All Subjects
                            </Link>
                        </div>

                        {loadingData ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : subjects.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {subjects.slice(0, 6).map((subj, idx) => (
                                    <Link
                                        key={subj._id}
                                        href={`/content?subjectId=${subj._id}`}
                                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-2 h-28 hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-600 transition-all group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base font-black ${getSubjectColor(idx)} group-hover:scale-110 transition-transform`}>
                                            {subj.name.charAt(0)}
                                        </div>
                                        <span className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {subj.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800">
                                <p className="text-xs font-semibold text-slate-400">No subjects currently available.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT SIDEBAR COLUMN (4 Cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Latest Official RRB Update Card */}
                    <Link href="/dashboard/updates" className="block group">
                        <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-800 rounded-3xl p-6 shadow-xl shadow-indigo-500/20 text-white hover:scale-[1.02] transition-transform">
                            <div className="flex justify-between items-start mb-4">
                                <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 border border-white/10">
                                    <Sparkles className="w-3 h-3 text-amber-300" />
                                    {latestUpdate ? 'OFFICIAL ANNOUNCEMENT' : 'RAILWAY NOTIFICATION'}
                                </span>
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                                    <Bell className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-white mb-2 leading-tight">
                                {latestUpdate?.title || 'RRB Official Exam Calendar Update'}
                            </h3>
                            <p className="text-xs text-indigo-100 leading-relaxed font-medium line-clamp-3 mb-6 opacity-90">
                                {latestUpdate?.message || 'Check the latest official notification releases regarding RRB NTPC, Group D, and ALP exam schedules.'}
                            </p>

                            <div className="flex items-center justify-between text-xs font-bold bg-white/10 p-3 rounded-2xl border border-white/10 group-hover:bg-white group-hover:text-indigo-700 transition-colors">
                                <span>Read Full Update</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </Link>

                    {/* New Video Lectures Section */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Play className="w-5 h-5 text-rose-500 fill-rose-500" />
                                New Lectures
                            </h2>
                            <Link href="/dashboard/lectures" className="text-xs font-bold text-rose-500 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {loadingData ? (
                                [1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)
                            ) : recentVideos.length > 0 ? (
                                recentVideos.map(video => {
                                    const ytThumb = getYTThumb(video.url);
                                    return (
                                        <button
                                            key={video._id}
                                            onClick={() => setVideoModal({ url: video.url, title: video.title })}
                                            className="group w-full bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-600 flex items-center gap-3 transition-all text-left"
                                        >
                                            <div className="w-20 aspect-video rounded-xl bg-slate-800 relative overflow-hidden shrink-0 shadow-sm">
                                                <img
                                                    src={ytThumb || (video as any).thumbnail || `https://images.unsplash.com/photo-1474487056289-622c50b76e1d?q=80&w=300&auto=format&fit=crop`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e: any) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop'; }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/40 transition-colors">
                                                    <div className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center shadow-md">
                                                        <Play className="w-3 h-3 text-rose-600 fill-rose-600 ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider block">
                                                    {(video as any).subjectId?.name || 'General'}
                                                </span>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-2 leading-snug group-hover:text-indigo-600 transition-colors">
                                                    {video.title}
                                                </h3>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                    <Play className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                    <p className="text-xs font-semibold text-slate-400">No new lectures available.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>

            {/* Video Modal */}
            {videoModal && (
                <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setVideoModal(null)}>
                    <div className="relative w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setVideoModal(null)}
                            className="absolute -top-10 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-white z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <p className="text-white font-bold text-sm mb-3 truncate pr-10">{videoModal.title}</p>
                        <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-2xl">
                            {getYTEmbed(videoModal.url) ? (
                                <iframe
                                    src={getYTEmbed(videoModal.url)!}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-white/60 text-sm">
                                    Video player not available
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
