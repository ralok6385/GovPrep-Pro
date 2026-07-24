"use client";
import { Flame, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StreakWidget() {
    const { user } = useAuth();
    const streak = user?.streak || 0;

    const today = new Date();
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    const last7 = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(today);
        d.setDate(today.getDate() - (6 - i));
        const daysAgo = 6 - i;
        const isActive = daysAgo < streak;
        const isToday = daysAgo === 0;
        return { label: days[d.getDay() === 0 ? 6 : d.getDay() - 1], isActive, isToday };
    });

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 h-full flex flex-col justify-between shadow-sm hover:border-orange-400 dark:hover:border-orange-500 transition-all group">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-200/60 dark:border-orange-900/50 flex items-center justify-center text-orange-600 dark:text-orange-400">
                    <Flame className="w-5 h-5 fill-current animate-pulse" />
                </div>
                {streak > 3 && (
                    <span className="bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 text-[10px] font-black px-2 py-0.5 rounded-md border border-orange-200 dark:border-orange-800 uppercase tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> ON FIRE!
                    </span>
                )}
            </div>

            {/* Count */}
            <div className="mb-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-none">
                    {streak} <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Day Streak</span>
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                    {streak === 0 ? 'Solve 1 test today' : streak >= 7 ? '🔥 Outstanding daily study habit!' : 'Keep your daily momentum!'}
                </p>
            </div>

            {/* 7-Day Calendar Dots */}
            <div className="flex items-center justify-between gap-1 pt-1">
                {last7.map((day, i) => (
                    <div key={i} className="flex flex-col items-center gap-1 flex-1">
                        <div className={`w-full aspect-square max-w-[24px] rounded-lg flex items-center justify-center transition-all ${
                            day.isToday && day.isActive
                                ? 'bg-orange-500 text-white shadow-sm'
                                : day.isActive
                                ? 'bg-orange-400 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                        }`}>
                            {day.isActive && <Flame className="w-3 h-3 fill-current" />}
                        </div>
                        <span className={`text-[9px] font-bold ${day.isActive ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
                            {day.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
