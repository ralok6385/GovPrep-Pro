"use client";
import { Flame, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StreakWidget() {
    const { user } = useAuth();
    const streak = user?.streak || 0;

    // Build last 7 days: today = index 6, yesterday = 5, etc.
    const today = new Date();
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        // Day is "active" if within current streak window
        const daysAgo = 6 - i;
        const isActive = daysAgo < streak;
        const isToday = daysAgo === 0;
        return { label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], isActive, isToday };
    });

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-1 shadow-lg shadow-orange-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] h-full p-5 flex flex-col justify-between relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500 transition-transform group-hover:scale-110">
                        <Flame className="w-5 h-5 fill-current animate-pulse" />
                    </div>
                    {streak > 3 && (
                        <span className="bg-orange-100/50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200 animate-pulse flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> ON FIRE!
                        </span>
                    )}
                </div>

                {/* Count */}
                <div className="mb-3">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white leading-none">
                        {streak} <span className="text-sm text-slate-500 font-medium">Day Streak</span>
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                        {streak === 0 ? 'Start today!' : streak >= 7 ? '🔥 Amazing consistency!' : 'Keep it going!'}
                    </p>
                </div>

                {/* 7-Day Calendar Dots */}
                <div className="flex items-center justify-between gap-1">
                    {last7.map((day, i) => (
                        <div key={i} className="flex flex-col items-center gap-1 flex-1">
                            <div className={`w-full aspect-square max-w-[28px] rounded-full flex items-center justify-center transition-all duration-300 ${
                                day.isToday && day.isActive
                                    ? 'bg-orange-500 shadow-lg shadow-orange-500/40 scale-110 ring-2 ring-orange-300'
                                    : day.isActive
                                    ? 'bg-orange-400'
                                    : 'bg-slate-100 dark:bg-slate-800'
                            }`}>
                                {day.isActive && <Flame className={`w-3 h-3 ${day.isToday ? 'text-white fill-white' : 'text-white/80 fill-white/80'}`} />}
                            </div>
                            <span className={`text-[9px] font-bold ${day.isActive ? 'text-orange-500' : 'text-slate-300 dark:text-slate-600'}`}>
                                {day.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500/40 blur-3xl rounded-full group-hover:bg-orange-500/60 transition-colors" />
        </div>
    );
}
