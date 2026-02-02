
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Trophy, Crown } from 'lucide-react';
import Link from 'next/link';

export default function LeaderboardTicker() {
    const [topStudents, setTopStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await api.get('/ranks/leaderboard');
            setTopStudents(data.slice(0, 5)); // Top 5 only
        } catch (error) {
            console.error('Failed to load ticker', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || topStudents.length === 0) return null;

    return (
        <div className="w-full bg-slate-900 border-y border-slate-800 py-2 overflow-hidden flex items-center mb-6 relative">
            <div className="bg-amber-500/10 text-amber-500 text-xs font-bold px-3 py-1 rounded ml-4 absolute left-0 z-20 backdrop-blur-sm border border-amber-500/20 flex items-center gap-1">
                <Crown className="w-3 h-3" /> CHAMPIONS
            </div>

            <div className="animate-marquee whitespace-nowrap flex items-center gap-12 pl-32">
                {topStudents.map((student, i) => (
                    <div key={student._id} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="font-bold text-slate-500">#{i + 1}</span>
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                                    {student.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-white">{student.name}</span>
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-900/30 px-1.5 py-0.5 rounded ml-1">
                            {student.avgScore.toFixed(0)} Avg
                        </span>
                    </div>
                ))}

                {/* Duplicate for seamless loop if needed, though simple css animation usually needs duplication */}
                {topStudents.map((student, i) => (
                    <div key={`dup-${student._id}`} className="flex items-center gap-2 text-sm text-slate-300">
                        <span className="font-bold text-slate-500">#{i + 1}</span>
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 overflow-hidden">
                            {student.avatar ? (
                                <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-[8px] font-bold text-slate-500">
                                    {student.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <span className="font-bold text-white">{student.name}</span>
                        <span className="text-emerald-400 font-bold text-xs bg-emerald-900/30 px-1.5 py-0.5 rounded ml-1">
                            {student.avgScore.toFixed(0)} Avg
                        </span>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
            `}</style>
        </div>
    );
}
