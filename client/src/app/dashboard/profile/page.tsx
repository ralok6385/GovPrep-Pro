"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Save, LogOut, Shield, TrendingUp, UploadCloud, CheckCircle2, Moon, Sun, Coffee } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    // Icon mapping
    const Icon = theme === 'dark' ? Moon : theme === 'warm' ? Coffee : Sun;
    const Label = theme === 'dark' ? 'Dark' : theme === 'warm' ? 'Warm' : 'Light';

    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 warm:bg-stone-200 warm:text-stone-800 warm:border-stone-300"
        >
            <Icon className="w-3 h-3" />
            {Label} Mode
        </button>
    );
}

export default function ProfilePage() {
    const { user, updateProfile, uploadProfileImage, logout, loading } = useAuth();
    const router = useRouter();

    // Local state for form
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [targetExam, setTargetExam] = useState('');
    const [avatar, setAvatar] = useState('');
    const [updating, setUpdating] = useState(false);
    const [dragging, setDragging] = useState(false);

    const [exams, setExams] = useState<any[]>([]);

    useEffect(() => {
        // Fetch exams for selection
        import('@/lib/api').then(mod => {
            mod.default.get('/exams').then(res => setExams(res.data));
        });
    }, []);

    useEffect(() => {
        if (!loading && !user) {
            router.replace('/login');
        } else if (user) {
            setName(user.name);
            setEmail(user.email);
            setTargetExam(user.targetExam || '');
            setAvatar(user.avatar || '');
        }
    }, [user, loading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            await updateProfile({
                name,
                email,
                avatar,
                password: password || undefined,
                targetExam
            });
            setPassword(''); // Clear password field on success
        } finally {
            setUpdating(false);
        }
    };

    // Drag and Drop Handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(true);
    };

    const handleDragLeave = () => setDragging(false);

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            uploadProfileImage(e.dataTransfer.files[0]);
        }
    };

    if (loading || !user) {
        return <div className="min-h-[60vh] flex items-center justify-center"><div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 lg:space-y-8">
            <div className="hidden lg:flex items-center justify-between mb-8">
                <h1 className="text-3xl font-black text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">My Profile</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
                {/* Left Column: Avatar & Quick Info */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-slate-900 warm:bg-[#fffbf0] p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 warm:border-stone-200 text-center transition-colors">
                        <label htmlFor="avatar-upload" className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30 warm:border-indigo-100 overflow-hidden bg-indigo-100 dark:bg-indigo-900 warm:bg-indigo-50 flex items-center justify-center relative group cursor-pointer hover:border-indigo-300 transition-all shadow-xl shadow-indigo-100 dark:shadow-none hover:scale-105">
                            {avatar || user.avatar ? (
                                <img src={avatar || user.avatar} alt={name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">
                                    {name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
                                <UploadCloud className="w-8 h-8 text-white" />
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
                        <h2 className="font-black text-2xl text-slate-800 dark:text-white warm:text-[var(--foreground)] tracking-tight">{name}</h2>
                        <p className="text-slate-500 font-medium mt-1 warm:text-stone-500">{email}</p>

                        <div className="mt-8 flex flex-col items-center justify-center gap-3">
                            <div className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-indigo-50 dark:bg-indigo-900/30 warm:bg-indigo-100 text-indigo-700 dark:text-indigo-400 warm:text-indigo-800 text-xs font-bold rounded-xl uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/50">
                                <Shield className="w-4 h-4" /> {user.role} Privilege
                            </div>
                            <Link href={user.role === 'admin' ? '/admin/results' : '/dashboard/analytics'} className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/30 warm:bg-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 warm:text-emerald-800 text-xs font-bold rounded-xl transition-colors border border-emerald-100 dark:border-emerald-900 warm:border-emerald-200 shadow-sm uppercase tracking-widest">
                                <TrendingUp className="w-4 h-4" /> {user.role === 'admin' ? 'App Analytics' : 'My Analytics'}
                            </Link>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 warm:border-stone-200">
                            <ThemeToggle />
                        </div>
                    </div>
                </div>

                {/* Right Column: Edit Form */}
                <div className="lg:col-span-8">
                    <div className="bg-white dark:bg-slate-900 warm:bg-[#fffbf0] p-6 md:p-10 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-800 warm:border-stone-200">
                        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <User className="w-6 h-6 text-indigo-500" />
                            <h2 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight">Account Settings</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <User className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="text"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white warm:text-[var(--foreground)] transition-all"
                                            placeholder="Enter your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Mail className="h-5 w-5 text-slate-400" />
                                        </div>
                                        <input
                                            type="email"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-950 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white warm:text-[var(--foreground)] transition-all"
                                            placeholder="Enter your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">
                                        New Password <span className="font-medium text-[10px] opacity-70">(Optional)</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-950 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-800 dark:text-white warm:text-[var(--foreground)] transition-all"
                                        placeholder="Min 6 characters"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Example Target Exam</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {exams.length > 0 ? exams.map((exam) => (
                                            <button
                                                key={exam._id}
                                                type="button"
                                                onClick={() => setTargetExam(exam.name)}
                                                className={`py-3 rounded-2xl text-xs font-black tracking-widest uppercase transition-all border-2 ${targetExam === exam.name
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xl shadow-indigo-500/30'
                                                    : 'bg-white dark:bg-slate-900 warm:bg-[#fffbf0] text-slate-500 border-slate-200 dark:border-slate-800 hover:border-indigo-300'}`}
                                            >
                                                {exam.name.replace('RRB ', '')}
                                            </button>
                                        )) : <div className="col-span-2 text-sm text-slate-400 font-medium">Loading exams...</div>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Quick Avatar Upload</label>
                                <label
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all group relative overflow-hidden
                                        ${dragging
                                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner'
                                            : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400'}`}
                                >
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                                        <UploadCloud className={`w-8 h-8 mb-3 transition-colors ${dragging ? 'text-indigo-500' : 'text-slate-400 group-hover:text-indigo-500'}`} />
                                        <p className="mb-1 text-sm font-bold text-slate-600 dark:text-slate-300">
                                            <span className="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs font-medium text-slate-400 tracking-widest uppercase mt-1">SVG, PNG, JPG (MAX. 2MB)</p>
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && uploadProfileImage(e.target.files[0])} />
                                </label>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-8 mt-8 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    type="submit"
                                    disabled={updating}
                                    className="flex-1 bg-indigo-600 text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                >
                                    {updating ? 'Saving Changes...' : <><Save className="w-5 h-5" /> Save Profile</>}
                                </button>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="sm:w-48 bg-rose-50 dark:bg-rose-900/10 text-rose-600 dark:text-rose-400 font-black uppercase tracking-widest text-xs py-5 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 border-2 border-rose-100 dark:border-rose-900/20"
                                >
                                    <LogOut className="w-4 h-4" /> Log Out
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
