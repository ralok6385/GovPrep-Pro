"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Star, ArrowRight, Trophy, TrendingUp } from 'lucide-react';

export default function CheckRankWidget() {
    const [loading, setLoading] = useState(true);
    const [rankData, setRankData] = useState<any>(null);

    useEffect(() => {
        const fetchRank = async () => {
            try {
                const res = await api.get('/ranks/my-rank');
                setRankData(res.data);
            } catch (error) {
                console.error('Failed to fetch rank', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRank();
    }, []);

    if (loading) {
        return (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm h-40 animate-pulse flex flex-col justify-between">
                <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded"></div>
                    <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded"></div>
                </div>
            </div>
        );
    }

    const hasRank = rankData && rankData.rank !== 'N/A';

    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between h-40 relative overflow-hidden group hover:shadow-xl hover:shadow-rose-500/10 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 dark:bg-rose-900/20 rounded-bl-[4rem] transition-transform group-hover:scale-110"></div>

            <div className="flex justify-between items-start z-10">
                <div className="w-12 h-12 bg-rose-100 dark:bg-rose-900/40 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400">
                    {hasRank ? <Trophy className="w-6 h-6 fill-current" /> : <Star className="w-6 h-6 fill-current" />}
                </div>
                {hasRank && (
                    <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30 px-2 py-1 rounded-lg">
                            Top {Math.ceil(rankData.percentile)}%
                        </span>
                    </div>
                )}
            </div>

            <div className="z-10">
                <p className="text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">
                    {hasRank ? 'Your Current AIR' : 'Live AIR'}
                </p>
                <Link
                    href="/dashboard/leaderboard"
                    className="text-slate-800 dark:text-white font-bold text-xl group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors flex items-center gap-1"
                >
                    {hasRank ? (
                        <span>#{rankData.rank} GBR</span>
                    ) : (
                        <span>Check Rank</span>
                    )}
                    <ArrowRight className="w-4 h-4" />
                </Link>
            </div>
        </div>
    );
}
