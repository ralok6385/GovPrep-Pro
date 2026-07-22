
"use client";

import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { Target, Trophy, Clock, Zap, ArrowLeft, TrendingUp, AlertCircle, CheckCircle2, Brain } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStats, useMyRank } from '@/hooks/useAPI';
import WeaknessHeatmap from '@/components/Dashboard/WeaknessHeatmap';

interface AnalyticsData {
    totalTests: number;
    avgAccuracy: number;
    avgTimePerQuestion: number;
    subjectPerformance: {
        subject: string;
        percentage: number;
        status: 'Strong' | 'Average' | 'Weak';
    }[];
    recentTrend: {
        accuracy: number;
        createdAt: string;
    }[];
}

export default function AnalyticsPage() {
    const { data, isLoading: loading } = useDashboardStats();
    const { data: rankData } = useMyRank();
    const router = useRouter();

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-500 font-bold">crunching your progress data...</p>
            </div>
        </div>
    );

    if (!data || data.totalTests === 0) return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
            <div className="max-w-md w-full text-center">
                <div className="w-20 h-20 bg-indigo-50 dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-indigo-500">
                    <TrendingUp className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Not enough data yet!</h2>
                <p className="text-slate-500 mb-8">Attempt at least one test to see your performance insights here.</p>
                <Link href="/dashboard/tests" className="block w-full py-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20">
                    Start Your First Test
                </Link>
            </div>
        </div>
    );

    const chartData = data.recentTrend.map((t: any, i: number) => ({
        name: `Test ${i + 1}`,
        accuracy: t.accuracy
    }));

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 sticky top-0 z-20">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 dark:text-white">Performance Analytics</h1>
                        <p className="text-xs text-slate-500 font-medium">Insights based on your last {data.totalTests} tests</p>
                    </div>
                </div>
            </div>

            <main className="max-w-5xl mx-auto p-6 space-y-8">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard label="Accuracy" value={`${data.avgAccuracy}%`} icon={Target} color="text-emerald-500" bg="bg-emerald-50 dark:bg-emerald-950/30" />
                    <StatCard label="Tests" value={data.totalTests} icon={Zap} color="text-amber-500" bg="bg-amber-50 dark:bg-amber-950/30" />
                    <StatCard label="Avg Time/Q" value={`${data.avgTimePerQuestion}s`} icon={Clock} color="text-blue-500" bg="bg-blue-50 dark:bg-blue-950/30" />
                    <StatCard label="Global Rank" value={rankData?.rank && rankData.rank !== 'N/A' ? `#${rankData.rank}` : '—'} icon={Trophy} color="text-purple-500" bg="bg-purple-50 dark:bg-purple-950/30" />
                </div>

                {/* Accuracy Trend Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        Accuracy Trend (Last 7 Tests)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" strokeOpacity={0.3} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94A3B8', fontSize: 12 }} dx={-10} domain={[0, 100]} />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#f1f5f9' }}
                                    itemStyle={{ fontWeight: 700, color: '#818cf8' }}
                                    labelStyle={{ color: '#94a3b8', fontWeight: 600 }}
                                    cursor={{ stroke: '#6366F1', strokeWidth: 2 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="accuracy"
                                    stroke="#6366F1"
                                    strokeWidth={4}
                                    dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, fill: '#4F46E5' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Performance - Better List View */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
                            <Brain className="w-5 h-5 text-purple-500" />
                            Subject Strength Analysis
                        </h3>
                        <span className="text-xs font-bold text-slate-400">{data.subjectPerformance.length} subjects</span>
                    </div>

                    <div className="space-y-4">
                        {[...data.subjectPerformance]
                            .sort((a: any, b: any) => b.percentage - a.percentage)
                            .map((subj: any) => {
                                const pct = subj.percentage;
                                const color = pct >= 70 ? 'bg-emerald-500' : pct >= 40 ? 'bg-amber-500' : 'bg-rose-500';
                                const textColor = pct >= 70 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 40 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400';
                                const badge = pct >= 70 ? 'Strong ✓' : pct >= 40 ? 'Average' : 'Weak ⚠';
                                const badgeBg = pct >= 70 ? 'bg-emerald-50 dark:bg-emerald-900/30' : pct >= 40 ? 'bg-amber-50 dark:bg-amber-900/30' : 'bg-rose-50 dark:bg-rose-900/30';
                                return (
                                    <div key={subj.subject}>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{subj.subject}</span>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-bold ${textColor} ${badgeBg} px-2 py-0.5 rounded-full`}>{badge}</span>
                                                <span className="text-sm font-black text-slate-800 dark:text-white tabular-nums">{pct}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full ${color} rounded-full transition-all duration-1000`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>

                    {/* Weak areas quick CTA */}
                    {data.subjectPerformance.some((s: any) => s.percentage < 50) && (
                        <div className="mt-6 p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/30 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-rose-700 dark:text-rose-400">
                                    Focus on: {data.subjectPerformance.filter((s: any) => s.percentage < 50).map((s: any) => s.subject).join(', ')}
                                </p>
                                <p className="text-xs text-rose-600/80 dark:text-rose-400/80 mt-0.5">These subjects need attention to improve your rank</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Weakness Heatmap Widget */}
                <WeaknessHeatmap />

                {/* Personalized Insight Section */}
                <div className="bg-indigo-600 rounded-3xl p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0">
                            <Zap className="w-10 h-10 text-yellow-300 fill-current" />
                        </div>
                        <div className="text-center md:text-left">
                            <h4 className="text-XL font-bold mb-1">Improvement Plan for You</h4>
                            <p className="text-indigo-100 text-sm opacity-90 max-w-lg">
                                Your accuracy in <strong>{data.subjectPerformance.find((s: any) => s.status === 'Weak')?.subject || 'Math'}</strong> is below target. Focus on weak concepts this week to boost your score by 15%.
                            </p>
                        </div>
                        <Link href="/dashboard/study-material" className="md:ml-auto px-6 py-3 bg-white text-indigo-600 font-bold rounded-xl whitespace-nowrap shadow-lg hover:shadow-xl transition-shadow">
                            Review Weak Topics
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color, bg }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm transition-transform hover:-translate-y-1">
            <div className={`w-10 h-10 ${bg} ${color} rounded-2xl flex items-center justify-center mb-4`}>
                <Icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-black text-slate-800 dark:text-white leading-none mb-1">{value}</p>
            <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">{label}</p>
        </div>
    );
}
