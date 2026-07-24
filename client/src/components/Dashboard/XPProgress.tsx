"use client";

import { Crown, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function XPProgress() {
    const { user } = useAuth();

    if (!user) return null;

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;

    const nextLevelXP = 50 * Math.pow(currentLevel, 2);
    const prevLevelXP = 50 * Math.pow(currentLevel - 1, 2);

    const progress = Math.min(100, Math.max(0, ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-sm">
            <div className="flex items-center gap-4">
                {/* Level Badge */}
                <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900/50 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <span className="text-[9px] font-black uppercase tracking-wider leading-none text-slate-500 dark:text-slate-400">Level</span>
                    <span className="text-lg font-black leading-none mt-0.5">{currentLevel}</span>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 dark:text-white">XP Rank Progress</span>
                            <Zap className="w-3.5 h-3.5 text-amber-500 fill-current" />
                        </div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-400">
                            <span className="text-indigo-600 dark:text-indigo-400 font-black">{currentXP}</span> / {nextLevelXP} XP
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-800">
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>

                    <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                        <span>Level {currentLevel}</span>
                        <span>Level {currentLevel + 1} Target</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
