"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Crown } from 'lucide-react';
import UserAvatar from '@/components/UserAvatar';

export default function LeaderboardTicker() {
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/ranks/leaderboard');
            setTopStudents(data.slice(0, 5));
        } catch (error) {
            console.error('Failed to load ticker', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || topStudents.length === 0) return null;

    return (
        <div className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 rounded-2xl py-2 px-3 overflow-hidden flex items-center mb-6 relative shadow-sm">
            <div className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl shrink-0 z-10 border border-amber-500/20 flex items-center gap-1.5 mr-3">
                <Crown className="w-3.5 h-3.5 fill-current" /> Top Champions
            </div>

            <div className="flex items-center gap-8 animate-[marquee_25s_linear_infinite] whitespace-nowrap overflow-hidden">
                {topStudents.map((student, i) => (
                    <div key={student._id} className="flex items-center gap-2 text-xs">
                        <span className="font-black text-amber-500">#{i + 1}</span>
                        <UserAvatar src={student.avatar} name={student.name} size="sm" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{student.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                            {student.avgScore ? student.avgScore.toFixed(0) : 0}% Avg
                        </span>
                    </div>
                ))}

                {topStudents.map((student, i) => (
                    <div key={`dup-${student._id}`} className="flex items-center gap-2 text-xs">
                        <span className="font-black text-amber-500">#{i + 1}</span>
                        <UserAvatar src={student.avatar} name={student.name} size="sm" />
                        <span className="font-bold text-slate-800 dark:text-slate-200">{student.name}</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-950/50 px-1.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-900/40">
                            {student.avgScore ? student.avgScore.toFixed(0) : 0}% Avg
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
