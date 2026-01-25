"use client";

import { useAuth } from '@/context/AuthContext';
import ExamSelector from '@/components/ExamSelector';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Book, PlayCircle, Target, Trophy } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    // If user hasn't selected an exam, show the selector modal overlay
    if (!user.selectedExam) {
        return (
            <div className="min-h-screen bg-slate-900 p-4">
                {/* Render background vaguely */}
                <h1 className="text-white">Loading your preferences...</h1>
                <ExamSelector />
            </div>
        );
    }

    // Assuming user.selectedExam is populated or at least ID is there. 
    // In AuthContext user type, selectedExam is string (ID) or object?
    // In `getUserProfile` (backend), I did `.populate('selectedExam')`.
    // So `selectedExam` should be an object. I need to update TS interface in AuthContext if needed or cast here.
    // Ideally, I should update the interface in AuthContext.tsx, but I can't edit it easily without re-writing.
    // I will assume it's `any` or cast it.
    const examName = (user.selectedExam as any)?.name || 'Your Exam';

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            {/* Header */}
            <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <Target className="text-indigo-500" />
                        <span className="font-bold text-lg">{examName} Prep</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-medium hidden sm:block">Hello, {user.name}</span>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold">
                            {user.name[0]}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {/* Welcome & Goal */}
                <div className="mb-8 animate-fade-in-up">
                    <h1 className="text-3xl font-bold mb-2">Good Morning, {user.name.split(' ')[0]} 👋</h1>
                    <p className="text-gray-400">Let's make progress towards <span className="text-indigo-400 font-semibold">{examName}</span> today.</p>
                </div>

                {/* Daily Progress Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-blue-500/20 p-2 rounded-lg"><Book className="text-blue-400 w-6 h-6" /></div>
                            <span className="text-xs font-medium bg-slate-700 px-2 py-1 rounded">Daily Goal</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">2/5</div>
                        <p className="text-gray-400 text-sm">Chapters Completed</p>
                        <div className="w-full bg-slate-700 h-2 rounded-full mt-4">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                        </div>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-purple-500/20 p-2 rounded-lg"><PlayCircle className="text-purple-400 w-6 h-6" /></div>
                            <span className="text-xs font-medium bg-slate-700 px-2 py-1 rounded">Watch Time</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">45m</div>
                        <p className="text-gray-400 text-sm">Learning Today</p>
                    </div>

                    <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
                        <div className="flex justify-between items-start mb-4">
                            <div className="bg-emerald-500/20 p-2 rounded-lg"><Trophy className="text-emerald-400 w-6 h-6" /></div>
                            <span className="text-xs font-medium bg-slate-700 px-2 py-1 rounded">Mock Test</span>
                        </div>
                        <div className="text-3xl font-bold mb-1">--</div>
                        <p className="text-gray-400 text-sm">Last Score</p>
                        <Link href="/tests" className="text-emerald-400 text-sm font-medium mt-2 inline-block hover:underline">Take a test &rarr;</Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <h2 className="text-xl font-bold mb-6">Start Learning</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Link href="/content" className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl hover:scale-105 transition-transform shadow-lg cursor-pointer">
                        <Book className="w-8 h-8 mb-4" />
                        <h3 className="font-bold text-lg">Study Notes</h3>
                        <p className="text-indigo-100 text-sm">Topic wise PDFs</p>
                    </Link>

                    <Link href="/videos" className="p-6 bg-gradient-to-br from-rose-600 to-pink-700 rounded-xl hover:scale-105 transition-transform shadow-lg cursor-pointer">
                        <PlayCircle className="w-8 h-8 mb-4" />
                        <h3 className="font-bold text-lg">Video Classes</h3>
                        <p className="text-rose-100 text-sm">Conceptual learning</p>
                    </Link>

                    <Link href="/tests" className="p-6 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl hover:scale-105 transition-transform shadow-lg cursor-pointer">
                        <Target className="w-8 h-8 mb-4" />
                        <h3 className="font-bold text-lg">Mock Tests</h3>
                        <p className="text-emerald-100 text-sm">New Pattern</p>
                    </Link>

                    <div className="p-6 bg-slate-800 border border-slate-700 rounded-xl opacity-50 cursor-not-allowed">
                        <Trophy className="w-8 h-8 mb-4 text-gray-500" />
                        <h3 className="font-bold text-lg text-gray-400">Previous Year</h3>
                        <p className="text-gray-500 text-sm">Coming Soon</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
