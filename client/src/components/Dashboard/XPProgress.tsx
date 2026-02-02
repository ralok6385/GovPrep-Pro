"use client";

import { Crown, Star, Zap } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function XPProgress() {
    const { user } = useAuth();

    if (!user) return null;

    const currentXP = user.xp || 0;
    const currentLevel = user.level || 1;

    // Formula from backend: Level = Floor(Sqrt(XP / 50)) + 1
    // Reverse to find XP needed for next level
    // Next Level = L + 1
    // Needed XP = ( (L)^2 ) * 50  <-- Wait, formula is sqrt(xp/50)+1 = L => sqrt(xp/50) = L-1 => xp/50 = (L-1)^2 => xp = 50*(L-1)^2
    // Wait, let's recheck backend formula: floor(sqrt(xp/50)) + 1
    // If XP=0, sqrt(0)+1 = 1. Correct.
    // If XP=50, sqrt(1)+1 = 2. Correct.
    // If XP=200, sqrt(4)+1 = 3.

    // So Next Level is currentLevel + 1.
    // XP required for Next Level (L_next) is when floor(sqrt(xp/50)) + 1 == L_next
    // sqrt(xp/50) >= L_next - 1
    // xp/50 >= (L_next - 1)^2
    // xp >= 50 * (currentLevel)^2  <-- Since L_next = currentLevel + 1, then L_next-1 = currentLevel.

    const nextLevelXP = 50 * Math.pow(currentLevel, 2);
    // Previous level boundary (to calculate progress bar start)
    const prevLevelXP = 50 * Math.pow(currentLevel - 1, 2);

    const progress = Math.min(100, Math.max(0, ((currentXP - prevLevelXP) / (nextLevelXP - prevLevelXP)) * 100));

    return (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-1 rounded-2xl shadow-xl border border-indigo-500/30 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100"></div>
            <div className="relative bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 flex items-center gap-4">

                {/* Level Badge */}
                <div className="relative">
                    <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl rotate-3 flex items-center justify-center shadow-lg shadow-orange-500/20 border-2 border-yellow-300">
                        <div className="text-center -rotate-3">
                            <span className="block text-[8px] font-black text-orange-900 uppercase tracking-wider leading-none">Level</span>
                            <span className="block text-2xl font-black text-white leading-none filter drop-shadow-md">{currentLevel}</span>
                        </div>
                    </div>
                    <div className="absolute -top-2 -right-2">
                        <Crown className="w-6 h-6 text-yellow-300 fill-yellow-300 animate-bounce" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-end mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <span className="text-white font-bold text-sm tracking-wide">XP Progress</span>
                            <Zap className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                        </div>
                        <div className="text-xs font-bold text-indigo-300">
                            <span className="text-white">{currentXP}</span> / {nextLevelXP} XP
                        </div>
                    </div>

                    {/* Progress Bar Container */}
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50 relative">
                        {/* Shimmer Effect */}
                        <div className="absolute top-0 bottom-0 left-0 right-0 z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-[20deg] translate-x-[-150%] animate-shimmer"></div>

                        {/* Fill */}
                        <div
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 ease-out relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                        </div>
                    </div>

                    <div className="mt-1 flex justify-between text-[10px] text-slate-500 font-medium">
                        <span>Current Level</span>
                        <span>Next Level</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
