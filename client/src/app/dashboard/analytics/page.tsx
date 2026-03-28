
"use client";

import { useState } from 'react';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Target, Trophy, Clock, Zap, ArrowLeft, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDashboardStats, useMyRank } from '@/hooks/useAPI';

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

                {/* Subject Performance */}
                <div>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Subject Strength Analysis</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {data.subjectPerformance.map((subj: any) => (
                            <div key={subj.subject} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                                <div className={`absolute top-0 right-0 w-1.5 h-full ${subj.status === 'Strong' ? 'bg-emerald-500' :
                                    subj.status === 'Average' ? 'bg-amber-500' : 'bg-rose-500'
                                    }`}></div>

                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-200">{subj.subject}</span>
                                    <span className={`text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-wider ${subj.status === 'Strong' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                                        subj.status === 'Average' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400' : 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
                                        }`}>
                                        {subj.status}
                                    </span>
                                </div>

                                <div className="flex items-end justify-between font-extrabold">
                                    <span className="text-2xl text-slate-800 dark:text-white">{subj.percentage}%</span>
                                    <span className="text-xs text-slate-400 mb-1">Accuracy</span>
                                </div>

                                <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full transition-all duration-1000 ${subj.status === 'Strong' ? 'bg-emerald-500' :
                                            subj.status === 'Average' ? 'bg-amber-500' : 'bg-rose-500'
                                            }`}
                                        style={{ width: `${subj.percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

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
