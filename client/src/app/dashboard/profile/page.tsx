"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Settings, Camera, Flame, Trophy, Zap, BookOpen,
    ClipboardList, TrendingUp, BarChart2, Clock, Bell, Moon, Sun, Target,
    Link as LinkIcon, Download, Lock, HelpCircle, LogOut, ChevronRight, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

export default function ProfilePage() {
    const { user, updateProfile, uploadProfileImage, logout, loading } = useAuth();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    const [exams, setExams] = useState<any[]>([]);
    
    // For editing profile state
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [targetExam, setTargetExam] = useState('');
    
    // Mock user stats
    const stats = {
        level: 12,
        xp: 2450,
        maxXp: 3000,
        streak: 7,
        topPercentile: 10,
        testsTaken: 24,
        avgScore: 72,
        globalRank: 147,
        studyHours: 48,
    };

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
            setTargetExam(user.targetExam || 'NTPC CBT-1');
        }
    }, [user, loading, router]);

    if (loading || !user) {
         return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    // Settings Mode
    if (isEditing) {
        return (
            <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-6 pt-20 lg:pt-8">
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => setIsEditing(false)} className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm">
                        <ArrowLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                    </button>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h1>
                    <div className="w-9" />
                </div>
                
                <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-medium text-slate-900 dark:text-white" />
                        </div>
                        <button onClick={async () => {
                            await updateProfile({ name, email });
                            setIsEditing(false);
                        }} className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none">Save Changes</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f8f9fe] dark:bg-[#0b0f19] relative overflow-hidden pb-24">
            {/* Top Mesh Gradient Background */}
            <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#e0e7ff] via-[#f3e8ff] to-transparent dark:from-[#1e1b4b] dark:via-[#312e81] dark:to-transparent opacity-80 z-0"></div>

            <div className="relative z-10 max-w-md mx-auto px-5 pt-12 lg:pt-8 w-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => router.back()} className="p-2 -ml-2 text-indigo-900/80 dark:text-indigo-200 hover:bg-white/20 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <h1 className="text-[17px] font-bold text-indigo-950 dark:text-indigo-100 tracking-wide">Scholar Profile</h1>
                    <button onClick={() => setIsEditing(true)} className="p-2 -mr-2 text-indigo-900/80 dark:text-indigo-200 hover:bg-white/20 rounded-full transition-colors">
                        <Settings className="w-6 h-6" />
                    </button>
                </div>

                {/* Profile Avatar & Info */}
                <div className="flex flex-col items-center mb-8">
                    <div className="relative mb-4 group cursor-pointer">
                        <label htmlFor="avatar-upload" className="block relative w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-200 dark:shadow-indigo-900/40 cursor-pointer">
                            <div className="w-full h-full rounded-full border-4 border-white dark:border-[#0b0f19] bg-slate-100 overflow-hidden relative">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-indigo-50 dark:bg-indigo-900/50 pt-2">
                                        <div className="w-10 h-10 bg-[#2d3748] rounded-full relative">
                                            <div className="absolute bottom-0 w-full h-1/2 bg-[#4a5568] rounded-t-full"></div>
                                            <div className="absolute top-1 left-1.5 right-1.5 h-4 bg-[#fbd38d] rounded-full"></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white dark:border-[#0b0f19]">
                                <Camera className="w-3.5 h-3.5" />
                            </div>
                        </label>
                        <input
                            id="avatar-upload"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    uploadProfileImage(e.target.files[0]);
                                }
                            }}
                        />
                    </div>
                    
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{user.email}</p>
                    
                    <div className="mt-2.5 inline-block px-3 py-1 bg-indigo-100/80 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold rounded-full uppercase tracking-widest border border-indigo-200/50 dark:border-indigo-800/50">
                        LEVEL {stats.level} • {user.role === 'admin' ? 'ADMINISTRATOR' : 'RAILWAY ASPIRANT'}
                    </div>

                    <button onClick={() => setIsEditing(true)} className="mt-5 px-6 py-2 rounded-full border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-sm font-semibold shadow-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
                        Edit Profile
                    </button>
                </div>

                {/* Main White Card Context */}
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100/50 dark:border-slate-800">
                    
                    {/* XP Progress */}
                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level {stats.level}</span>
                            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{stats.xp.toLocaleString()} / {stats.maxXp.toLocaleString()} XP</span>
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level {stats.level + 1}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" style={{ width: `${(stats.xp / stats.maxXp) * 100}%` }}></div>
                        </div>
                    </div>

                    {/* Quick Stats Badges */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Flame className="w-5 h-5 text-orange-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">7-Day<br/>Streak</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Top<br/>10%</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <Zap className="w-5 h-5 text-amber-400 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">Speed<br/>King</span>
                        </div>
                        <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            <BookOpen className="w-5 h-5 text-rose-500 mb-1" />
                            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 text-center leading-tight">100<br/>Tests</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {/* Tests Taken */}
                        <div className="bg-blue-50/70 dark:bg-blue-900/20 p-4 rounded-3xl border border-blue-100/50 dark:border-blue-900/30">
                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center mb-3">
                                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Tests Taken</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.testsTaken}</p>
                        </div>

                        {/* Avg Score */}
                        <div className="bg-emerald-50/70 dark:bg-emerald-900/20 p-4 rounded-3xl border border-emerald-100/50 dark:border-emerald-900/30">
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mb-3">
                                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Avg Score</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.avgScore}%</p>
                        </div>

                        {/* Global Rank */}
                        <div className="bg-amber-50/70 dark:bg-amber-900/20 p-4 rounded-3xl border border-amber-100/50 dark:border-amber-900/30">
                            <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mb-3">
                                <BarChart2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Global Rank</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">#{stats.globalRank}</p>
                        </div>

                        {/* Study Hours */}
                        <div className="bg-purple-50/70 dark:bg-purple-900/20 p-4 rounded-3xl border border-purple-100/50 dark:border-purple-900/30">
                            <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mb-3">
                                <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-0.5">Study Hours</p>
                            <p className="text-2xl font-black text-slate-800 dark:text-slate-100">{stats.studyHours}h</p>
                        </div>
                    </div>

                    {/* Menu List */}
                    <div className="space-y-1">
                        {/* Notifications Menu Item */}
                        <div className="flex items-center justify-between py-4 group pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                            </div>
                            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-indigo-600 transition-colors">
                                <span className="inline-block h-4 w-4 translate-x-6 rounded-full bg-white transition-transform" />
                            </button>
                        </div>

                        {/* Dark Mode */}
                        <div className="flex items-center justify-between py-4 group pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Dark Mode</span>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {/* Target Exam */}
                        <Link href="/dashboard/settings/exam" className="flex items-center justify-between py-4 group hover:bg-slate-50 dark:hover:bg-slate-900/50 rounded-2xl transition-colors pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <Target className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Target Exam</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">{targetExam}</span>
                                <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                        </Link>

                        {/* Connected Accounts */}
                        <div className="flex items-center justify-between py-4 group cursor-pointer pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <LinkIcon className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Connected Accounts</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Download Report */}
                        <div className="flex items-center justify-between py-4 group cursor-pointer pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <Download className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Download Report</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Change Password */}
                        <div className="flex items-center justify-between py-4 group cursor-pointer pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Change Password</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Support & Help */}
                        <div className="flex items-center justify-between py-4 group cursor-pointer pr-2">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-slate-200">Support & Help</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Logout */}
                        <button onClick={logout} className="w-full flex items-center justify-between py-4 group cursor-pointer pr-2 mt-4 border-t border-slate-100 dark:border-slate-800/80">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500">
                                    <LogOut className="w-5 h-5" />
                                </div>
                                <span className="font-bold text-red-600 dark:text-red-500">Logout</span>
                            </div>
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="mt-12 mb-4 text-center">
                        <p className="text-xs text-slate-400 dark:text-slate-500">Lalan RailPath v2.1.0</p>
                        <p className="text-[10px] text-slate-400/80 dark:text-slate-600 uppercase tracking-wider mt-1 font-bold flex items-center justify-center gap-1">
                            MADE WITH <span className="text-red-500 text-xs">❤️</span> FOR RAILWAY ASPIRANTS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
