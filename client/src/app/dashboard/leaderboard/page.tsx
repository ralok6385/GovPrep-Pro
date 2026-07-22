"use client";

import { useState } from 'react';
import { Trophy, Crown, ArrowLeft, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMyRank, useAPI } from '@/hooks/useAPI';

type Period = 'all' | 'monthly' | 'weekly';

export default function LeaderboardPage() {
    const [period, setPeriod] = useState<Period>('all');
    const { data: myRankData, isLoading: rankLoading } = useMyRank();
    const { data: leaderboard, isLoading: lbLoading } = useAPI(`/ranks/leaderboard?period=${period}`, { dedupingInterval: 10000 });
    const loading = rankLoading || lbLoading;
    const router = useRouter();

    const TABS: {id: Period, label: string}[] = [
        { id: 'all',     label: 'All Time' },
        { id: 'monthly', label: 'Monthly'  },
        { id: 'weekly',  label: 'Weekly'   },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const getLocationSuffix = (n: number) => {
        if (n >= 11 && n <= 13) return 'th';
        switch (n % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    const handleBack = () => {
        if (window.history.length > 1) {
            router.back();
        } else {
            router.push('/dashboard');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            <div className="max-w-2xl mx-auto space-y-6 px-4 pt-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-400" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-400" />
                            Leaderboard
                        </h1>
                        <p className="text-slate-400 text-sm">See where you stand among all aspirants</p>
                    </div>
                </div>

                {/* Time Period Tabs */}
                <div className="flex bg-slate-900 p-1 rounded-2xl gap-1">
                    {TABS.map(({ id, label }) => (
                        <button
                            key={id}
                            onClick={() => setPeriod(id)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                period === id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                                    : 'text-slate-400 hover:text-slate-200'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* My Rank Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
                    <div className="relative z-10">
                        <p className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Your Current Rank</p>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-5xl font-black text-white">
                                {myRankData?.rank !== 'N/A' ? `#${myRankData?.rank}` : 'N/A'}
                            </span>
                            {myRankData?.rank !== 'N/A' && (
                                <span className="text-xl text-indigo-200 font-bold">/ {myRankData?.totalStudents}</span>
                            )}
                        </div>
                        <p className="text-indigo-100 text-sm mb-4">
                            {myRankData?.rank === 'N/A' ? "Take your first test to get a rank!" : `Top ${Math.max(0, (100 - parseFloat(myRankData?.percentile || 0))).toFixed(0)}% of students`}
                        </p>
                        <div className="grid grid-cols-3 gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{myRankData?.averageScore || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Avg Score</div>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div className="text-center">
                                <div className="text-xl font-bold text-white">{myRankData?.testsTaken || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Tests</div>
                            </div>
                            <div className="w-px bg-white/20" />
                            <div className="text-center">
                                <div className="text-xl font-bold text-amber-300">{myRankData?.percentile || 0}%</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Percentile</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-3">
                    <h2 className="text-base font-bold flex items-center gap-2 text-slate-300">
                        <Crown className="w-5 h-5 text-amber-400" />
                        Top Performers
                        {lbLoading && <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin ml-auto" />}
                    </h2>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {(leaderboard || []).length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No data yet. Be the first to take a test!
                            </div>
                        ) : (
                            (leaderboard || []).map((student: any, index: number) => (
                                <div
                                    key={student._id}
                                    className={`flex items-center gap-3 px-4 py-3.5 border-b border-slate-800 last:border-0 transition-colors ${
                                        index < 3 ? 'bg-slate-800/50' : 'hover:bg-slate-800/30'
                                    } ${student._id === myRankData?.userId ? 'ring-1 ring-indigo-500 ring-inset bg-indigo-900/20' : ''}`}
                                >
                                    {/* Rank badge */}
                                    <div className={`w-9 h-9 flex items-center justify-center font-black text-sm rounded-full shrink-0 ${
                                        index === 0 ? 'bg-yellow-400/20 text-yellow-400' :
                                        index === 1 ? 'bg-slate-400/20 text-slate-300' :
                                        index === 2 ? 'bg-amber-600/20 text-amber-500' :
                                        'text-slate-600'
                                    }`}>
                                        {index < 3 ? (['🥇','🥈','🥉'][index]) : (index + 1)}
                                    </div>

                                    {/* Avatar */}
                                    <div className="w-9 h-9 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-sm">
                                                {student.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    {/* Name & tests */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-200 text-sm truncate">
                                            {student.name}
                                            {student._id === myRankData?.userId && <span className="ml-2 text-[10px] font-bold text-indigo-400 bg-indigo-900/50 px-1.5 py-0.5 rounded">You</span>}
                                        </h3>
                                        <p className="text-xs text-slate-500">{student.testsCount} Tests</p>
                                    </div>

                                    {/* Score */}
                                    <div className="text-right shrink-0">
                                        <div className="font-bold text-emerald-400 text-sm">{student.avgScore?.toFixed(1)}</div>
                                        <div className="text-[10px] text-slate-500 font-medium">Avg Score</div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
