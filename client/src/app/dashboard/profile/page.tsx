"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft, Settings, Camera, Flame, Trophy, Zap, BookOpen,
    ClipboardList, TrendingUp, BarChart2, Clock, Bell, Moon, Sun, Target,
    Link as LinkIcon, Download, Lock, HelpCircle, LogOut, ChevronRight, CheckCircle2, ShieldCheck, UserCheck, Languages
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useDashboardStats, useMyRank } from '@/hooks/useAPI';
import toast from 'react-hot-toast';

export default function ProfilePage() {
    const { user, updateProfile, uploadProfileImage, logout, loading } = useAuth();
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();

    // Profile Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [targetExam, setTargetExam] = useState('NTPC');
    const [language, setLanguage] = useState('hi');
    const [password, setPassword] = useState('');
    const [saving, setSaving] = useState(false);
    const [avatarError, setAvatarError] = useState(false);

    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const { data: analyticsData } = useDashboardStats();
    const { data: rankData } = useMyRank();

    // Real stats from API
    const stats = {
        level: user?.level ?? 1,
        xp: user?.xp ?? 0,
        maxXp: Math.pow((user?.level ?? 1), 2) * 50,
        streak: user?.streak ?? 0,
        topPercentile: rankData?.totalStudents && rankData?.rank !== 'N/A'
            ? Math.max(1, Math.round(100 - (rankData.rank / rankData.totalStudents) * 100))
            : null,
        testsTaken: analyticsData?.totalTests ?? 0,
        avgScore: analyticsData?.avgAccuracy ? Math.round(analyticsData.avgAccuracy) : 0,
        globalRank: rankData?.rank !== 'N/A' ? rankData?.rank : 'N/A',
    };

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (user) {
            setName(user.name || '');
            setEmail(user.email || '');
            setTargetExam(user.targetExam || 'NTPC');
            setLanguage(user.language || 'hi');
            setAvatarError(false);
        }
    }, [user, loading, router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updatePayload: any = {
                name,
                email,
                targetExam,
                language,
            };
            if (password && password.trim().length >= 6) {
                updatePayload.password = password;
            }
            await updateProfile(updatePayload);
            setIsEditing(false);
            setPassword('');
        } catch (err: any) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading || !user) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Header / Breadcrumb */}
            <div className="max-w-6xl mx-auto px-4 pt-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Scholar Profile</h1>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Manage your target exam, account credentials and performance metrics</p>
                        </div>
                    </div>

                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                    >
                        <Settings className="w-4 h-4" />
                        {isEditing ? 'Close Editor' : 'Edit Profile'}
                    </button>
                </div>
            </div>

            {/* Main Responsive Layout (Desktop 2-column grid) */}
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Hero Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm relative overflow-hidden text-center flex flex-col items-center">
                        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-90"></div>

                        {/* Avatar Container */}
                        <div className="relative mt-8 mb-4">
                            <label htmlFor="avatar-upload-input" className="block relative w-28 h-28 rounded-full p-1 bg-white dark:bg-slate-900 shadow-xl cursor-pointer group">
                                <div className="w-full h-full rounded-full border-2 border-indigo-500 bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden relative flex items-center justify-center">
                                    {user.avatar && !avatarError ? (
                                        <img
                                            src={user.avatar}
                                            alt={user.name}
                                            className="w-full h-full object-cover"
                                            onError={() => setAvatarError(true)}
                                        />
                                    ) : (
                                        <span className="text-3xl font-black text-white uppercase tracking-wider">
                                            {user.name ? user.name[0] : 'U'}
                                        </span>
                                    )}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                        <Camera className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2 rounded-full border-2 border-white dark:border-slate-900 shadow-md">
                                    <Camera className="w-3.5 h-3.5" />
                                </div>
                            </label>
                            <input
                                id="avatar-upload-input"
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

                        {/* User Identity */}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">{user.name}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-3">{user.email}</p>

                        <div className="flex flex-wrap justify-center gap-2 mb-6">
                            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-xl border border-indigo-100 dark:border-indigo-800">
                                LEVEL {stats.level}
                            </span>
                            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-xl border border-emerald-100 dark:border-emerald-800">
                                {user.targetExam || 'NTPC'} TARGET
                            </span>
                            {user.role === 'admin' && (
                                <span className="px-3 py-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-wider rounded-xl border border-amber-100 dark:border-amber-800">
                                    ADMINISTRATOR
                                </span>
                            )}
                        </div>

                        {/* Level & XP Progress Card */}
                        <div className="w-full bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 text-left">
                            <div className="flex justify-between items-center text-xs font-bold mb-2">
                                <span className="text-slate-600 dark:text-slate-300">Level {stats.level}</span>
                                <span className="text-indigo-600 dark:text-indigo-400 font-black">{stats.xp} / {stats.maxXp} XP</span>
                            </div>
                            <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.max(5, (stats.xp / stats.maxXp) * 100))}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Quick Achievements Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Milestones & Badges</h3>
                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-orange-50 dark:bg-orange-950/30 border border-orange-100 dark:border-orange-900/40">
                                <Flame className="w-5 h-5 text-orange-500 mb-1 animate-pulse" />
                                <span className="text-[9px] font-black text-orange-700 dark:text-orange-300 text-center leading-tight">{stats.streak}D Streak</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                                <Trophy className="w-5 h-5 text-amber-500 mb-1" />
                                <span className="text-[9px] font-black text-amber-700 dark:text-amber-300 text-center leading-tight">Rank #{stats.globalRank}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                                <Zap className="w-5 h-5 text-indigo-500 mb-1" />
                                <span className="text-[9px] font-black text-indigo-700 dark:text-indigo-300 text-center leading-tight">Level {stats.level}</span>
                            </div>
                            <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 mb-1" />
                                <span className="text-[9px] font-black text-emerald-700 dark:text-emerald-300 text-center leading-tight">{stats.testsTaken} Mocks</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Key Metrics & Settings Section */}
                <div className="lg:col-span-8 space-y-6">

                    {/* Performance Executive Metric Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
                                <ClipboardList className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tests Taken</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.testsTaken}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
                                <TrendingUp className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Accuracy</p>
                            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">{stats.avgScore}%</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
                                <BarChart2 className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Global Rank</p>
                            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">#{stats.globalRank}</p>
                        </div>

                        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-3">
                                <Flame className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Streak</p>
                            <p className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-0.5">{stats.streak} Days</p>
                        </div>
                    </div>

                    {/* EDIT PROFILE FORM MODAL / EXPANDED SECTION */}
                    {isEditing && (
                        <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-3xl border-2 border-indigo-500/30 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">Edit Account Profile</h3>
                                    <p className="text-xs text-slate-500">Update your details across all devices</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="text-xs font-bold text-slate-400 hover:text-slate-600"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-900 dark:text-white"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Exam</label>
                                    <select
                                        value={targetExam}
                                        onChange={e => setTargetExam(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-900 dark:text-white"
                                    >
                                        <option value="NTPC">RRB NTPC</option>
                                        <option value="Group D">RRB Group D</option>
                                        <option value="ALP">RRB ALP</option>
                                        <option value="JE">RRB JE</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Preferred Language</label>
                                    <select
                                        value={language}
                                        onChange={e => setLanguage(e.target.value)}
                                        className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-900 dark:text-white"
                                    >
                                        <option value="hi">Hindi (हिंदी)</option>
                                        <option value="en">English</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">New Password (Optional)</label>
                                <input
                                    type="password"
                                    placeholder="Leave blank to keep existing password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:border-indigo-500 font-semibold text-sm text-slate-900 dark:text-white"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(false)}
                                    className="px-6 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                                >
                                    {saving ? 'Saving...' : 'Save Profile Changes'}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Account Settings Menu List */}
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-2">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account Preferences</h3>

                        {/* Theme Toggle (Light / Dark strictly) */}
                        <div
                            onClick={toggleTheme}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                                    {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Appearance Mode</p>
                                    <p className="text-xs text-slate-400">Currently using {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</p>
                                </div>
                            </div>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                            </div>
                        </div>

                        {/* Target Exam Quick Action */}
                        <div
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <Target className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Target Exam Goal</p>
                                    <p className="text-xs text-slate-400">Selected: RRB {targetExam}</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Performance Analytics Report */}
                        <div
                            onClick={() => router.push('/dashboard/analytics')}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                    <Download className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Performance Analytics & PDF Report</p>
                                    <p className="text-xs text-slate-400">View detailed weakness heatmap and download PDF report</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Security Credentials */}
                        <div
                            onClick={() => setIsEditing(true)}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Account Security & Password</p>
                                    <p className="text-xs text-slate-400">Change your password or login email</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Support & Contact */}
                        <div
                            onClick={() => toast.success('Support Email: support@lalanrailpath.com')}
                            className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-slate-900 dark:text-white">Support & Assistance</p>
                                    <p className="text-xs text-slate-400">Reach out to Lalan RailPath support team</p>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                        </div>

                        {/* Logout */}
                        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={logout}
                                className="w-full p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-between hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <LogOut className="w-4 h-4" />
                                    <span>Sign Out of Account</span>
                                </div>
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
