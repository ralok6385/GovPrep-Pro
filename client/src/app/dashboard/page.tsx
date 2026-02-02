"use client";

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { BookOpen, Play, Train, ArrowRight, Bell, Star, Clock, Sparkles, ChevronRight, Zap, Trophy, FileText, TrendingUp, AlertCircle, History, Target, Swords } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import ExamCategories from '@/components/Dashboard/ExamCategories';
import CheckRankWidget from '@/components/Dashboard/CheckRankWidget';
import StreakWidget from '@/components/Dashboard/StreakWidget';
import LeaderboardTicker from '@/components/Dashboard/LeaderboardTicker';
import WeaknessHeatmap from '@/components/Dashboard/WeaknessHeatmap';
import XPProgress from '@/components/Dashboard/XPProgress';

import { ContentItem, Subject } from '@/types';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [recentVideos, setRecentVideos] = useState<ContentItem[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [stats, setStats] = useState<any>(null); // Stats structure is complex, might need more specific type later
    const [history, setHistory] = useState<any[]>([]);
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
            setRecentVideos(videosRes.data.slice(0, 5));
            setSubjects(subjectsRes.data);
            setStats(statsRes.data);
            setHistory(historyRes.data);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoadingData(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading your experience...</p>
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
        <div className="max-w-7xl mx-auto p-5 pb-24 lg:p-8 lg:pb-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* CENTER COLUMN (Main Content) */}
            <div className="lg:col-span-8 space-y-6 pt-16 lg:pt-0">
                <LeaderboardTicker />

                {/* Human-Centric Welcome Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-1">
                        {(() => {
                            const h = new Date().getHours();
                            return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
                        })()}, {user?.name.split(' ')[0]} 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        Ready to move one step closer to selection? Let's make today count.
                    </p>
                </div>

                {/* Today's Focus Section */}
                <div className="mb-10">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Today's Focus
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 1. Daily Quiz Card */}
                        <Link href="/dashboard/tests?type=quiz" className="bg-white dark:bg-slate-900 warm:bg-[#fffbf0] p-1 rounded-[2rem] border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Zap className="w-24 h-24 text-amber-500 -mr-4 -mt-4 rotate-12" />
                            </div>
                            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-amber-50 dark:bg-amber-900/30 warm:bg-amber-100/50 rounded-2xl flex items-center justify-center text-amber-500 shadow-sm">
                                        <Zap className="w-5 h-5 fill-current" />
                                    </div>
                                    <span className="bg-amber-100 dark:bg-amber-900/50 warm:bg-amber-200/50 text-amber-700 dark:text-amber-300 warm:text-amber-800 text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider">
                                        5 Mins
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800 dark:text-white warm:text-stone-800 text-lg mb-1 group-hover:text-amber-600 transition-colors">Daily Speed Quiz</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 warm:text-stone-500 font-medium leading-relaxed">Boost your speed and accuracy with fresh questions.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider group-hover:gap-3 transition-all">
                                    Start Now <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </Link>

                        {/* 2. Streak Card (Wrapped Widget) */}
                        <div className="h-full">
                            <StreakWidget />
                        </div>

                        {/* 3. Recommended Mock */}
                        <div onClick={() => router.push('/dashboard/tests?type=exam')} className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-1 rounded-[2rem] shadow-lg shadow-indigo-500/20 cursor-pointer group relative overflow-hidden text-white h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3"></div>
                            <div className="p-5 h-full flex flex-col justify-between relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center text-white backdrop-blur-sm border border-white/10">
                                        <Trophy className="w-5 h-5" />
                                    </div>
                                    <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wider backdrop-blur-sm border border-white/10">
                                        Recommended
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg mb-1">Full Mock Test</h3>
                                    <p className="text-xs text-indigo-100 font-medium leading-relaxed opacity-90">Test your preparation level against 1000+ students.</p>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-white text-xs font-bold uppercase tracking-wider bg-white/20 w-fit px-3 py-1.5 rounded-lg hover:bg-white hover:text-indigo-600 transition-all border border-white/10">
                                    Take Challenge
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-8">
                    <XPProgress />
                </div>

                {/* Dynamic Insights / Smart Alerts */}
                {(() => {
                    const getInsight = () => {
                        if (!stats || stats.totalTests === 0) return {
                            msg: "Ready to start your journey? Take a mock test now!",
                            icon: <Sparkles className="w-6 h-6 text-yellow-300 fill-current animate-pulse" />
                        };

                        // Rule 1: Streak check
                        if (user.streak === 0) return {
                            msg: "You haven't practiced today! Keep your streak alive. 📉",
                            icon: <Zap className="w-6 h-6 text-amber-300 fill-amber-300 shadow-lg shadow-amber-500/50" />
                        };

                        // Rule 2: Weak subject check
                        const weakSubj = stats.subjectPerformance.find((s: any) => s.status === 'Weak');
                        if (weakSubj) return {
                            msg: `${weakSubj.subject} needs your attention — current accuracy: ${weakSubj.percentage}% 🔥`,
                            icon: <AlertCircle className="w-6 h-6 text-rose-300 animate-bounce" />
                        };

                        // Rule 3: Improvement trend
                        const recent = stats.recentTrend || [];
                        if (recent.length >= 2) {
                            const last = recent[recent.length - 1].accuracy;
                            const prev = recent[recent.length - 2].accuracy;
                            const diff = last - prev;
                            if (diff > 5) return {
                                msg: `Impressive! Your accuracy improved by ${Math.round(diff)}% in the last test! 🚀`,
                                icon: <TrendingUp className="w-6 h-6 text-emerald-300" />
                            };
                        }

                        // Fallback
                        return {
                            msg: "Great job on staying consistent! Practice more to top the leaderboard. 🏆",
                            icon: <Trophy className="w-6 h-6 text-yellow-300" />
                        };
                    };
                    const insight = getInsight();
                    return (
                        <div className="bg-gradient-to-r from-indigo-700 to-indigo-600 rounded-[2rem] p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-500/30 transition-all hover:scale-[1.01] duration-500">
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-indigo-400/20 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/4"></div>

                            <div className="relative z-10 flex items-center gap-4">
                                <div className="bg-white/20 p-3.5 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner group transition-transform hover:rotate-3">
                                    {insight.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-lg leading-tight flex items-center gap-2">
                                        Smart Performance Insight
                                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                                    </h3>
                                    <p className="text-indigo-100 text-sm opacity-90 font-medium">{insight.msg}</p>
                                </div>
                                <Link href="/dashboard/analytics" className="hidden sm:flex bg-white text-indigo-700 text-xs font-black px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all active:scale-95 shadow-lg shadow-black/10 items-center gap-2 uppercase tracking-wider">
                                    View Report <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    );
                })()}

                {/* Stats & Trend Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Performance Trend Chart */}
                    <div className="lg:col-span-7 bg-white dark:bg-slate-900 warm:bg-[#fffbf0] p-6 rounded-3xl border border-slate-100 dark:border-slate-800 warm:border-stone-200 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white warm:text-stone-800 flex items-center gap-2">
                                    <TrendingUp className="w-5 h-5 text-emerald-500" />
                                    Performance Trend
                                </h2>
                                <p className="text-xs text-slate-400 dark:text-slate-500 warm:text-stone-400 mt-0.5">Your accuracy over the last 7 tests</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 warm:bg-emerald-100/50 rounded-lg">
                                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 warm:text-emerald-700 uppercase tracking-wider">Live Tracking</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-48 w-full">
                            {stats?.recentTrend && stats.recentTrend.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={stats.recentTrend}>
                                        <defs>
                                            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                        <XAxis
                                            dataKey="createdAt"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: '#94a3b8', fontSize: 10 }}
                                            tickFormatter={(val) => new Date(val).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                                        />
                                        <YAxis
                                            hide
                                            domain={[0, 100]}
                                        />
                                        <Tooltip
                                            contentStyle={{
                                                borderRadius: '16px',
                                                border: 'none',
                                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                                padding: '12px'
                                            }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                            formatter={(val: any) => [`${val}%`, 'Accuracy']}
                                            labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="accuracy"
                                            stroke="#6366f1"
                                            strokeWidth={3}
                                            fillOpacity={1}
                                            fill="url(#colorTrend)"
                                            animationDuration={1500}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                                        <Clock className="w-6 h-6 opacity-20" />
                                    </div>
                                    <p className="text-xs font-medium italic">Take a mock test to see your trend</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Battle Arena Widget (Moved here) */}
                    <div className="lg:col-span-5">
                        <div onClick={() => window.location.href = '/dashboard/battle'} className="bg-gradient-to-r from-red-600 to-orange-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden cursor-pointer hover:shadow-2xl hover:shadow-red-600/30 transition-all group h-full flex flex-col justify-center">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-colors"></div>
                            <div className="relative z-10 flex justify-between items-center">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border border-white/10 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            LIVE PVP
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black mb-1 italic uppercase tracking-tighter">Battle Arena</h2>
                                    <p className="text-red-100 font-medium max-w-[200px] leading-tight text-sm">Challenge students in real-time 1v1 battles.</p>
                                </div>
                                <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center rotate-3 group-hover:rotate-0 transition-transform shadow-inner border border-white/10">
                                    <Swords className="w-10 h-10 text-white" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Weakness Analysis Heatmap */}

                <WeaknessHeatmap />

                {/* Performance Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mistake Areas */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <AlertCircle className="w-6 h-6 text-rose-500" />
                                    Mistake Areas
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Focus your efforts here</p>
                            </div>
                            <Link href="/dashboard/analytics" className="text-indigo-600 text-[10px] font-black uppercase hover:underline">
                                Insights
                            </Link>
                        </div>

                        <div className="space-y-4">
                            {stats?.subjectPerformance?.filter((s: any) => s.status === 'Weak').length > 0 ? (
                                stats.subjectPerformance.filter((s: any) => s.status === 'Weak').map((s: any, idx: number) => (
                                    <div key={idx} className="bg-rose-50/50 dark:bg-rose-900/10 p-4 rounded-2xl border border-rose-100 dark:border-rose-900/20 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-rose-500 font-bold shadow-sm border border-rose-50 dark:border-rose-900/30">
                                                {s.percentage}%
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-slate-800 dark:text-white">{s.subject}</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Critical Attention Needed</p>
                                            </div>
                                        </div>
                                        <Link href="/content" className="p-2 bg-white dark:bg-slate-800 rounded-lg text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm">
                                            <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 flex flex-col items-center justify-center text-center">
                                    <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 rounded-full flex items-center justify-center mb-3">
                                        <Target className="w-6 h-6" />
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">No major weak areas!</h4>
                                    <p className="text-xs text-slate-400 mt-1">Keep up the great work and stay consistent.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Recent Mock Test History */}
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                    <History className="w-6 h-6 text-indigo-600" />
                                    Exam History
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Your detailed test logs</p>
                            </div>
                            <Link href="/dashboard/analytics" className="text-indigo-600 text-[10px] font-black uppercase hover:underline">
                                View All
                            </Link>
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
                            {history.length > 0 ? (
                                history.slice(0, 5).map((h) => (
                                    <Link
                                        key={h._id}
                                        href={`/dashboard/analysis/${h._id}`}
                                        className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-indigo-900/30"
                                    >
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shadow-sm ${h.accuracy > 70 ? 'bg-white text-emerald-600 border-emerald-100' : h.accuracy > 40 ? 'bg-white text-amber-600 border-amber-100' : 'bg-white text-rose-600 border-rose-100'} border`}>
                                            <span className="text-xs leading-none">{Math.round(h.accuracy)}%</span>
                                            <span className="text-[8px] uppercase tracking-tighter mt-0.5 opacity-60">Accuracy</span>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-[13px] font-bold text-slate-800 dark:text-white leading-tight line-clamp-1 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">
                                                {h.testId?.title || 'Mock Test'}
                                            </h4>
                                            <div className="flex items-center gap-3 mt-1 cursor-default" onClick={(e) => e.preventDefault()}>
                                                <div className="flex items-center gap-1">
                                                    <Trophy className="w-3 h-3 text-amber-500" />
                                                    <span className="text-[10px] font-bold text-slate-500">Rank: {h.rank || '--'}/{h.totalParticipants || '--'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 text-indigo-500" />
                                                    <span className="text-[10px] font-bold text-slate-500">Score: {h.score}/{h.testId?.totalMarks || '--'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-1">
                                            <span className="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-md">
                                                {new Date(h.createdAt).toLocaleDateString('en-GB')}
                                            </span>
                                            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-all translate-x-0 group-hover:translate-x-1" />
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <div className="flex-1 flex flex-col items-center justify-center py-12 text-center opacity-40">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <p className="text-sm font-bold uppercase tracking-widest italic">No test history yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Exam Categories */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Train className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            Target Exams
                        </h2>
                    </div>
                    <ExamCategories />
                </div>

                {/* Subjects Grid */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            My Subjects
                        </h2>
                        <Link href="/content" className="text-indigo-600 dark:text-indigo-300 text-xs font-bold bg-indigo-50 dark:bg-indigo-900/30 px-4 py-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">
                            View All
                        </Link>
                    </div>

                    {loadingData ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-pulse">
                            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-32 bg-slate-200 rounded-2xl"></div>)}
                        </div>
                    ) : subjects.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-3 gap-4">
                            {subjects.slice(0, 6).map((subj, idx) => (
                                <Link
                                    key={subj._id}
                                    href={`/content?subjectId=${subj._id}`}
                                    className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center gap-3 h-32 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
                                >
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${getSubjectColor(idx)} group-hover:scale-110 transition-transform mb-1`}>
                                        {subj.name.charAt(0)}
                                    </div>
                                    <span className="font-bold text-slate-700 dark:text-slate-200 text-sm line-clamp-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors relative z-10">
                                        {subj.name}
                                    </span>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-400">
                                <BookOpen className="w-8 h-8" />
                            </div>
                            <h4 className="font-bold text-slate-800 dark:text-white mb-1">No subjects found</h4>
                            <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Admin hasn't added any subjects yet. Check back later!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN (Updates & Lectures) */}
            <div className="lg:col-span-4 space-y-8">
                {/* Latest Updates Card */}
                <Link href="/dashboard/updates" className="block group">
                    <div className="relative overflow-hidden bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] rounded-[2rem] p-8 shadow-2xl shadow-indigo-500/25 transition-transform duration-300 hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="bg-white/20 backdrop-blur-md border border-white/10 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-white shadow-sm">
                                    <Sparkles className="w-3 h-3 text-yellow-300" />
                                    <span>New Update</span>
                                </div>
                                <div className="bg-white/10 rounded-full p-2">
                                    <Train className="w-8 h-8 text-white/90" />
                                </div>
                            </div>

                            <h3 className="text-3xl font-bold text-white mb-3 leading-tight">
                                RRB NTPC <br /> <span className="text-indigo-200">Announced!</span>
                            </h3>
                            <p className="text-indigo-100 text-sm mb-8 leading-relaxed opacity-90 font-medium">
                                Check the latest official notification regarding exam schedule.
                            </p>

                            <div className="flex items-center gap-2 text-white font-bold text-sm bg-white/10 w-full justify-center py-4 rounded-xl backdrop-blur-sm border border-white/10 group-hover:bg-white group-hover:text-indigo-600 transition-all">
                                View Details <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </Link>

                {/* New Lectures List */}
                <div>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Play className="w-6 h-6 text-rose-500 fill-rose-500" />
                            New Lectures
                        </h2>
                        <Link href="/dashboard/lectures" className="text-rose-500 text-xs font-bold bg-rose-50 dark:bg-rose-900/30 px-3 py-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {loadingData ? (
                            [1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-200 rounded-3xl animate-pulse"></div>)
                        ) : recentVideos.length > 0 ? (
                            recentVideos.map(video => {
                                const getYTThumb = (url: string) => {
                                    if (!url) return null;
                                    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                                    const match = url.match(regExp);
                                    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/mqdefault.jpg` : null;
                                };
                                const youtubeThumb = getYTThumb(video.url);

                                return (
                                    <a
                                        key={video._id}
                                        href={video.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 flex items-center gap-4 transition-all duration-300"
                                    >
                                        <div className="w-24 aspect-video rounded-xl bg-slate-800 relative overflow-hidden shrink-0 shadow-lg border border-slate-700/50">
                                            <img
                                                src={youtubeThumb || (video as any).thumbnail || `https://images.unsplash.com/photo-1474487056289-622c50b76e1d?q=80&w=300&auto=format&fit=crop`}
                                                alt={video.title}
                                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                onError={(e: any) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=300&auto=format&fit=crop'; }}
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/0 transition-colors">
                                                <Play className="w-4 h-4 text-white fill-current opacity-80 group-hover:scale-125 transition-transform" />
                                            </div>
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <span className="text-indigo-600 dark:text-indigo-400 text-[9px] font-black uppercase tracking-widest block mb-0.5">
                                                {video.subjectId?.name || 'General'}
                                            </span>
                                            <h3 className="font-bold text-slate-800 dark:text-white text-[13px] leading-snug line-clamp-2 transition-colors">
                                                {video.title}
                                            </h3>
                                        </div>

                                        <div className="text-slate-300 group-hover:text-indigo-600 transition-colors shrink-0">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </a>
                                );
                            })
                        ) : (
                            <div className="bg-slate-100 dark:bg-slate-800/50 rounded-3xl p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-700">
                                <Play className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-xs text-slate-500 font-medium">No new lectures yet.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
