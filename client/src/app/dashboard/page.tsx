"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { 
    BookOpen, Play, Train, ArrowRight, Bell, Star, Clock, Sparkles, ChevronRight, 
    Zap, Trophy, FileText, TrendingUp, AlertCircle, History, Target, Swords, 
    CalendarDays, X, ShieldCheck, CheckCircle2, Flame, Award, BarChart2
} from 'lucide-react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ExamCategories from '@/components/Dashboard/ExamCategories';
import StreakWidget from '@/components/Dashboard/StreakWidget';
import LeaderboardTicker from '@/components/Dashboard/LeaderboardTicker';
import WeaknessHeatmap from '@/components/Dashboard/WeaknessHeatmap';
import XPProgress from '@/components/Dashboard/XPProgress';
import UserAvatar from '@/components/UserAvatar';

import { ContentItem, Subject } from '@/types';

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

    const getSubjectBadgeColor = (index: number) => {
        const styles = [
            'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50',
            'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/50',
            'bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50',
            'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50',
        ];
        return styles[index % styles.length];
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-slate-900 dark:text-slate-100 transition-colors duration-300 pb-24">
            <div className="max-w-7xl mx-auto p-4 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 pt-4">

                {/* MAIN CONTENT AREA (8 Columns) */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Champions Ticker */}
                    <LeaderboardTicker />

                    {/* Enterprise Hero Banner */}
                    <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 z-10">
                            <UserAvatar src={user.avatar} name={user.name} size="lg" />
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-black uppercase tracking-wider rounded-md">
                                        RRB {user.targetExam || 'NTPC'} TARGET
                                    </span>
                                    <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider rounded-md">
                                        LEVEL {user.level || 1}
                                    </span>
                                </div>
                                <h1 className="text-xl font-bold text-white tracking-tight">
                                    Welcome back, {user?.name.split(' ')[0]} 👋
                                </h1>
                                <p className="text-xs text-slate-400 font-medium mt-0.5">
                                    Track your preparation, attempt mock tests, and strengthen weak topics.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto z-10">
                            <button
                                onClick={() => router.push('/dashboard/tests?type=exam')}
                                className="w-full md:w-auto px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
                            >
                                <Trophy className="w-4 h-4" />
                                Start All-India Mock
                            </button>
                        </div>
                    </div>

                    {/* Action Hub (3 Columns) */}
                    <div>
                        <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                            Daily Practice Hub
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Daily Speed Quiz */}
                            <Link href="/dashboard/tests?type=quiz" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-amber-400 dark:hover:border-amber-500 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                            <Zap className="w-5 h-5 fill-current" />
                                        </div>
                                        <span className="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800 uppercase tracking-wider">
                                            5 MINS
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-amber-600 transition-colors">Daily Speed Quiz</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Practice high-yield questions daily.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                                    Start Quiz <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </Link>

                            {/* Streak Widget */}
                            <div className="h-full">
                                <StreakWidget />
                            </div>

                            {/* Battle Arena */}
                            <Link href="/dashboard/battle" className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:border-rose-400 dark:hover:border-rose-500 transition-all group flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200/60 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400">
                                            <Swords className="w-5 h-5" />
                                        </div>
                                        <span className="bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800 uppercase tracking-wider">
                                            1v1 LIVE
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1 group-hover:text-rose-600 transition-colors">Battle Arena</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 font-medium leading-relaxed">Challenge active students in real-time speed duels.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                                    Enter Battle <ArrowRight className="w-3.5 h-3.5" />
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* XP Progress Bar */}
                    <XPProgress />

                    {/* Performance Trend Area Chart */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                                    Performance Accuracy Trend
                                </h2>
                                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">Track accuracy consistency across test attempts</p>
                            </div>
                            <Link href="/dashboard/analytics" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                                Full Analytics <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                        </div>

                        <div className="h-48 w-full">
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
                                            tick={{ fill: '#64748b', fontSize: 10 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        />
                                        <YAxis hide domain={[0, 100]} />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0',
                                                padding: '10px',
                                                fontSize: '12px'
                                            }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            formatter={(val: any) => [`${val}%`, 'Accuracy']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke="#4f46e5"
                                            strokeWidth={2.5}
                                            fillOpacity={1}
                                            fill="url(#colorTrend)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                                    <Clock className="w-6 h-6 text-indigo-500 opacity-40" />
                                    <p className="text-xs font-medium text-slate-500">Complete your first mock test to view live accuracy trends.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Weakness Heatmap & Recent History */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <WeaknessHeatmap />

                        {/* Recent History Log */}
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                        <History className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                        Recent Exam History
                                    </h3>
                                    <Link href="/dashboard/history" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                        View All
                                    </Link>
                                </div>

                                <div className="space-y-2.5">
                                    {history.length > 0 ? (
                                        history.map((h: any) => (
                                            <Link
                                                key={h._id}
                                                href={`/dashboard/analysis/${h._id}`}
                                                className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between hover:border-indigo-400 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                                        h.accuracy >= 70 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                                    }`}>
                                                        {h.accuracy ? Math.round(h.accuracy) : 0}%
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate">{h.testId?.title || 'Mock Exam'}</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Rank #{h.rank || '--'} • Score: {h.score}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                            <FileText className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                                            <p className="text-xs font-semibold text-slate-500">No test attempts logged yet.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Target Railway Exams */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <Train className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                Target Railway Exam Categories
                            </h2>
                        </div>
                        <ExamCategories />
                    </div>

                    {/* Subject Learning Modules */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                My Preparation Subjects
                            </h2>
                            <Link href="/dashboard/study-material" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                View All Material
                            </Link>
                        </div>

                        {loadingData ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-24 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse"></div>)}
                            </div>
                        ) : subjects.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {subjects.slice(0, 6).map((subj, idx) => (
                                    <Link
                                        key={subj._id}
                                        href={`/content?subjectId=${subj._id}`}
                                        className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center gap-3.5 hover:border-indigo-500 transition-all group"
                                    >
                                        <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 ${getSubjectBadgeColor(idx)}`}>
                                            {subj.name.charAt(0)}
                                        </div>
                                        <div className="min-w-0">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                {subj.name}
                                            </span>
                                            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold">18 Chapters • 45 PDF Notes</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 text-center border border-slate-200/80 dark:border-slate-800">
                                <p className="text-xs font-semibold text-slate-500">No subjects currently loaded.</p>
                            </div>
                        )}
                    </div>

                </div>

                {/* RIGHT SIDEBAR COLUMN (4 Columns) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Official Exam Updates */}
                    <Link href="/dashboard/updates" className="block group">
                        <div className="bg-slate-900 dark:bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md hover:border-slate-700 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase flex items-center gap-1">
                                    <Sparkles className="w-3 h-3 text-amber-400" />
                                    OFFICIAL RRB UPDATE
                                </span>
                                <Bell className="w-4 h-4 text-slate-400" />
                            </div>

                            <h3 className="text-base font-bold text-white mb-1.5 leading-snug">
                                {latestUpdate?.title || 'RRB Official Exam Notifications'}
                            </h3>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed line-clamp-3 mb-4">
                                {latestUpdate?.message || 'Check the latest official notification releases regarding RRB NTPC, Group D, and ALP exam schedules.'}
                            </p>

                            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 group-hover:text-indigo-300 transition-colors">
                                <span>Read Notification Details</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                            </div>
                        </div>
                    </Link>

                    {/* Recommended Video Lectures */}
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Play className="w-4 h-4 text-rose-500 fill-rose-500" />
                                Recommended Lectures
                            </h2>
                            <Link href="/dashboard/lectures" className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3">
                            {loadingData ? (
                                [1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse"></div>)
                            ) : recentVideos.length > 0 ? (
                                recentVideos.map(video => {
                                    const ytThumb = getYTThumb(video.url);
                                    return (
                                        <button
                                            key={video._id}
                                            onClick={() => setVideoModal({ url: video.url, title: video.title })}
                                            aria-label={`Play lecture: ${video.title}`}
                                            className="group w-full bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500 flex items-center gap-3 transition-all text-left"
                                        >
                                            <div className="w-16 aspect-video rounded-lg bg-slate-800 relative overflow-hidden shrink-0 shadow-sm">
                                                <img
                                                    src={ytThumb || (video as any).thumbnail || `https://images.unsplash.com/photo-1474487056289-622c50b76e1d?q=80&w=300&auto=format&fit=crop`}
                                                    alt={video.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                    onError={(e: any) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop'; }}
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                                    <Play className="w-3.5 h-3.5 text-white fill-white" />
                                                </div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <span className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-wider block">
                                                    By Er. Alok Sir
                                                </span>
                                                <h3 className="font-bold text-slate-800 dark:text-white text-xs line-clamp-1 group-hover:text-indigo-600 transition-colors">
                                                    {video.title}
                                                </h3>
                                                <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium">14.2k Aspirants Watched</p>
                                            </div>
                                        </button>
                                    );
                                })
                            ) : (
                                <div className="p-6 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                    <p className="text-xs font-medium text-slate-500">No lectures available.</p>
                                </div>
                            )}
                        </div>
                    </div>


                </div>

            </div>

            {/* Video Modal */}
            {videoModal && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setVideoModal(null)}>
                    <div className="relative w-full max-w-3xl bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <p className="text-white font-bold text-sm truncate pr-4">{videoModal.title}</p>
                            <button
                                onClick={() => setVideoModal(null)}
                                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                aria-label="Close video player"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="aspect-video w-full bg-black">
                            {getYTEmbed(videoModal.url) ? (
                                <iframe
                                    src={getYTEmbed(videoModal.url)!}
                                    className="w-full h-full"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
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
