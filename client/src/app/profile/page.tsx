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
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 warm:bg-[var(--background)] pb-20 transition-colors duration-300">
            {/* Header */}
            <div className="bg-white dark:bg-slate-900 warm:bg-[#fdf6e3] sticky top-0 z-30 shadow-sm border-b border-slate-100 dark:border-slate-800 warm:border-stone-200">
                <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="p-2 -ml-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 warm:text-stone-500 warm:hover:text-stone-700">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg text-slate-800 dark:text-white warm:text-[var(--foreground)]">My Profile</h1>
                    <div className="w-8"></div> {/* Spacer for center alignment */}
                </div>
            </div>

            <main className="max-w-md mx-auto px-5 py-6">

                <div className="bg-white dark:bg-slate-900 warm:bg-[#fffbf0] p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 warm:border-stone-200 mb-6 text-center transition-colors">
                    <label htmlFor="avatar-upload" className="w-24 h-24 mx-auto mb-4 rounded-full border-4 border-indigo-50 dark:border-indigo-900/30 warm:border-indigo-100 overflow-hidden bg-indigo-100 dark:bg-indigo-900 warm:bg-indigo-50 flex items-center justify-center relative group cursor-pointer hover:border-indigo-300 transition-colors">
                        {avatar || user.avatar ? (
                            <img src={avatar || user.avatar} alt={name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                                {name.charAt(0).toUpperCase()}
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <UploadCloud className="w-6 h-6 text-white" />
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
                    <h2 className="font-bold text-xl text-slate-800 dark:text-white warm:text-[var(--foreground)]">{name}</h2>
                    <p className="text-slate-400 text-sm warm:text-stone-500">{email}</p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 warm:bg-indigo-100 text-indigo-700 dark:text-indigo-400 warm:text-indigo-800 text-xs font-bold rounded-lg uppercase tracking-wide">
                            <Shield className="w-3 h-3" /> {user.role} Account
                        </div>
                        <Link href={user.role === 'admin' ? '/admin/results' : '/dashboard/analytics'} className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/30 warm:bg-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 warm:text-emerald-800 text-xs font-bold rounded-lg transition-colors border border-emerald-100 dark:border-emerald-900 warm:border-emerald-200 shadow-sm">
                            <TrendingUp className="w-3 h-3" /> {user.role === 'admin' ? 'App Analytics' : 'My Analytics'}
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 warm:text-[var(--foreground)] mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <User className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-white warm:text-[var(--foreground)] transition-all"
                                    placeholder="Enter your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 warm:text-[var(--foreground)] mb-1.5 ml-1">Email Address</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-white warm:text-[var(--foreground)] transition-all"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 warm:text-[var(--foreground)] mb-1.5 ml-1">
                                New Password <span className="text-slate-400 font-normal text-xs">(optional)</span>
                            </label>
                            <input
                                type="password"
                                className="w-full px-4 py-3 bg-white dark:bg-slate-900 warm:bg-[#fffbf0] border border-slate-200 dark:border-slate-800 warm:border-stone-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none font-medium text-slate-700 dark:text-white warm:text-[var(--foreground)] transition-all"
                                placeholder="Min 6 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 warm:text-[var(--foreground)] mb-1.5 ml-1">Profile Picture</label>

                            {/* Drag & Drop Zone */}
                            <label
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all group relative overflow-hidden
                                    ${dragging
                                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-900/20'
                                        : 'border-slate-200 dark:border-slate-800 warm:border-stone-300 bg-slate-50 dark:bg-slate-900/50 warm:bg-[#f8f5e6] hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-400'}`}
                            >
                                <div className="flex flex-col items-center justify-center pt-5 pb-6 relative z-10">
                                    <UploadCloud className={`w-8 h-8 mb-2 transition-colors ${dragging ? 'text-indigo-500' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500'}`} />
                                    <p className="mb-1 text-sm text-slate-500 dark:text-slate-400 font-medium">
                                        <span className="font-bold text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop
                                    </p>
                                    <p className="text-xs text-slate-400">SVG, PNG, JPG (MAX. 2MB)</p>
                                </div>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            uploadProfileImage(e.target.files[0]);
                                        }
                                    }}
                                />
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 warm:text-[var(--foreground)] mb-1.5 ml-1">Example Target Exam</label>
                            <div className="grid grid-cols-2 gap-3">
                                {exams.length > 0 ? exams.map((exam) => (
                                    <button
                                        key={exam._id}
                                        type="button"
                                        onClick={() => setTargetExam(exam.name)}
                                        className={`py-2.5 rounded-xl text-sm font-bold transition-all border ${targetExam === exam.name
                                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 dark:shadow-indigo-900/20'
                                            : 'bg-white dark:bg-slate-900 warm:bg-[#fffbf0] text-slate-500 dark:text-slate-400 warm:text-stone-500 border-slate-200 dark:border-slate-800 warm:border-stone-200 hover:border-indigo-300 dark:hover:border-indigo-700'}`}
                                    >
                                        {exam.name}
                                    </button>
                                )) : <div className="col-span-2 text-sm text-slate-400">Loading exams...</div>}
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={updating}
                        className="w-full bg-slate-900 dark:bg-white warm:bg-[#5c4033] text-white dark:text-slate-900 font-bold py-3.5 rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-white/10 hover:bg-slate-800 dark:hover:bg-slate-100 warm:hover:bg-[#4a332a] transition-all flex items-center justify-center gap-2"
                    >
                        {updating ? 'Saving...' : <><Save className="w-5 h-5" /> Save Changes</>}
                    </button>

                    <div className="pt-4 border-t border-slate-200 dark:border-slate-800 warm:border-stone-200">
                        <button
                            type="button"
                            onClick={logout}
                            className="w-full bg-red-50 dark:bg-red-900/10 warm:bg-red-50 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all flex items-center justify-center gap-2 border border-red-100 dark:border-red-900/20 warm:border-red-100"
                        >
                            <LogOut className="w-5 h-5" /> Log Out
                        </button>
                    </div>
                </form>
            </main>
        </div>
    );
}
