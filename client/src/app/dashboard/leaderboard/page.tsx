"use client";

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Trophy, Medal, Crown, TrendingUp, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LeaderboardPage() {
    const [myRankData, setMyRankData] = useState<any>(null);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchRankData();
    }, []);

    const fetchRankData = async () => {
        try {
            const [myRankRes, leaderboardRes] = await Promise.all([
                api.get('/ranks/my-rank'),
                api.get('/ranks/leaderboard')
            ]);
            setMyRankData(myRankRes.data);
            setLeaderboard(leaderboardRes.data);
        } catch (error) {
            console.error('Failed to fetch rank data', error);
        } finally {
            setLoading(false);
        }
    };

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
        <div className="min-h-screen bg-slate-950 text-white p-6 pb-24">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 bg-slate-900 rounded-xl hover:bg-slate-800 transition-colors"
                    >
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

                {/* My Rank Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                        <div>
                            <p className="text-indigo-200 font-bold uppercase tracking-wider text-xs mb-2">Your Current Rank</p>
                            <div className="flex items-baseline justify-center md:justify-start gap-1">
                                <span className="text-6xl font-black text-white">
                                    {myRankData?.rank !== 'N/A' ? `#${myRankData?.rank}` : 'N/A'}
                                </span>
                                {myRankData?.rank !== 'N/A' && (
                                    <span className="text-xl text-indigo-200 font-bold">
                                        / {myRankData?.totalStudents}
                                    </span>
                                )}
                            </div>
                            <p className="text-indigo-100 mt-2 text-sm max-w-xs">
                                {myRankData?.rank === 'N/A'
                                    ? "Take your first test to get a rank!"
                                    : `You are in the top ${Math.max(0, (100 - parseFloat(myRankData?.percentile || 0))).toFixed(0)}% of students!`}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-sm border border-white/10">
                            <div className="text-center px-4">
                                <div className="text-2xl font-bold text-white mb-1">{myRankData?.averageScore || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Avg Score</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="text-center px-4">
                                <div className="text-2xl font-bold text-white mb-1">{myRankData?.testsTaken || 0}</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Tests Taken</div>
                            </div>
                            <div className="w-px bg-white/20"></div>
                            <div className="text-center px-4">
                                <div className="text-2xl font-bold text-amber-300 mb-1">{myRankData?.percentile || 0}%</div>
                                <div className="text-[10px] uppercase font-bold text-indigo-200">Percentile</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Leaderboard List */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold flex items-center gap-2 text-slate-300">
                        <Crown className="w-5 h-5 text-amber-400" />
                        Top Performers
                    </h2>

                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {leaderboard.length === 0 ? (
                            <div className="p-8 text-center text-slate-500">
                                No data available yet. Be the first to take a test!
                            </div>
                        ) : (
                            leaderboard.map((student, index) => (
                                <div
                                    key={student._id}
                                    className={`flex items-center gap-4 p-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/50 transition-colors ${index < 3 ? 'bg-slate-800/30' : ''
                                        }`}
                                >
                                    <div className={`w-8 h-8 flex  items-center justify-center font-black text-lg rounded-full shrink-0 ${index === 0 ? 'text-yellow-400' :
                                        index === 1 ? 'text-slate-300' :
                                            index === 2 ? 'text-amber-600' : 'text-slate-600'
                                        }`}>
                                        {index + 1}
                                    </div>

                                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden shrink-0 border border-slate-700">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold bg-slate-800">
                                                {student.name?.charAt(0)}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-200 truncate">{student.name}</h3>
                                            {index < 3 && <Trophy className="w-3 h-3 text-yellow-500" />}
                                        </div>
                                        <p className="text-xs text-slate-500">{student.testsCount} Tests Taken</p>
                                    </div>

                                    <div className="text-right">
                                        <div className="font-bold text-emerald-400">{student.avgScore.toFixed(1)}</div>
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
