import { Flame, Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function StreakWidget() {
    const { user } = useAuth();
    const streak = user?.streak || 0; // Default to 0 if undefined

    return (
        <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-[2rem] p-1 shadow-lg shadow-orange-500/20 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
            <div className="bg-white dark:bg-slate-900 rounded-[1.8rem] h-full p-6 flex flex-col justify-between relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-500 transition-transform group-hover:scale-110">
                        <Flame className="w-6 h-6 fill-current animate-pulse" />
                    </div>
                    {streak > 3 && (
                        <div className="relative">
                            <span className="bg-orange-100/50 text-orange-700 text-[10px] font-bold px-2 py-1 rounded-full border border-orange-200 animate-pulse flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> ON FIRE!
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div>
                    <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1">
                        {streak} <span className="text-base text-slate-500 font-medium">Days</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                        Consistency beats talent
                    </p>
                </div>

                {/* Progress Bar (Visual flair only) */}
                <div className="mt-4 h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full transition-all duration-1000"
                        style={{ width: `${Math.min(streak * 10, 100)}%` }} // Cap at 100%
                    ></div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500/40 blur-3xl rounded-full group-hover:bg-orange-500/60 transition-colors"></div>
        </div>
    );
}
