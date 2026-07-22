"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiWithRetry, checkServerHealth } from '@/lib/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login, user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
    }, [user, authLoading, router]);

    // Load saved email + proactively wake up Render backend on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('govprep_user_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
        // Silent wake-up ping — gives server time to start while user types credentials
        checkServerHealth();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Use retry wrapper: tries 3 times with 3s → 6s → 12s backoff
            await apiWithRetry(() => login(email, password), 3, 3000);

            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('govprep_user_email', email);
            } else {
                localStorage.removeItem('govprep_user_email');
            }
        } catch (err: any) {
            setLoading(false);
            console.error('[Login Error]', err);

            if (!err.response) {
                toast.error('Could not reach server. Please try again in a moment.');
            } else if (err.response.status === 401) {
                toast.error('Incorrect email or password.');
            } else if (err.response.status === 503) {
                toast.error('Server is starting up. Please try again in 30 seconds.');
            } else if (err.response.status >= 500) {
                toast.error('Server error. Please try again.');
            } else {
                toast.error(err.response?.data?.message || 'Login failed.');
            }
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-[#ffffff] dark:bg-[#000000] transition-colors duration-500 font-sans">
            {/* Left Side - Deep SaaS Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#030303] border-r border-[#ffffff]/5 text-[#ffffff] p-16 flex-col justify-between relative overflow-hidden">
                {/* Premium Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#4f46e5]/10 via-[#a855f7]/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-full h-[600px] bg-[#4f46e5]/20 blur-[180px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="w-14 h-14 bg-[#ffffff]/10 border border-[#ffffff]/20 rounded-[1.25rem] flex items-center justify-center p-2.5 backdrop-blur-xl shadow-2xl">
                            <Image src="/logo.png" alt="Lalan RailPath" width={38} height={38} className="object-contain" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[#ffffff]/90">Lalan RailPath</span>
                    </div>

                    <h1 className="text-[4rem] font-black leading-[1.02] tracking-[-0.04em]">
                        Your journey to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#22d3ee]">excellence</span> begins here.
                    </h1>
                    <p className="text-[#ffffff]/60 text-xl max-w-md leading-relaxed mt-4 font-medium">
                        Join thousands of top-tier aspirants using our AI-driven analytics to secure their future.
                    </p>

                    <div className="flex gap-5 items-center mt-12">
                        <div className="flex -space-x-4">
                            <div className="w-12 h-12 rounded-full border-[3px] border-[#030303] bg-[#10b981] flex items-center justify-center text-[#000000] font-bold text-sm z-30 shadow-xl">KS</div>
                            <div className="w-12 h-12 rounded-full border-[3px] border-[#030303] bg-[#6366f1] flex items-center justify-center text-[#ffffff] font-bold text-sm z-20 shadow-xl">AJ</div>
                            <div className="w-12 h-12 rounded-full border-[3px] border-[#030303] bg-[#f43f5e] flex items-center justify-center text-[#ffffff] font-bold text-sm z-10 shadow-xl">RV</div>
                            <div className="w-12 h-12 rounded-full border-[3px] border-[#030303] bg-[#ffffff]/10 flex items-center justify-center text-[11px] font-bold text-[#ffffff] z-0 backdrop-blur-md">+2k</div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[15px] font-bolder text-[#ffffff]/90 tracking-wide">Active Aspirants</span>
                            <span className="text-[13px] text-[#ffffff]/40 font-semibold tracking-wide">Preparing right now</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-lg mt-auto">
                    <div className="bg-[#ffffff]/[0.02] border border-[#ffffff]/10 rounded-3xl p-8 backdrop-blur-2xl">
                        <p className="italic text-[#ffffff]/70 font-light text-[17px] leading-relaxed mb-5 flex items-start gap-3">
                            <span className="text-[#34d399] text-3xl leading-none font-serif">"</span>
                            The secret of getting ahead is getting started. Break your complex overwhelming tasks into small manageable ones.
                        </p>
                        <p className="text-[13px] font-black text-[#34d399] uppercase tracking-[0.2em]">— Mark Twain</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Monumental Login Container */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-16 lg:p-24 relative overflow-hidden bg-[#ffffff] dark:bg-[#000000] transition-colors duration-500">
                
                <div className="w-full max-w-[500px] relative z-20">
                    <div className="mb-12 text-left">
                        <h2 className="text-[40px] font-black text-[#0f172a] dark:text-[#ffffff] tracking-[-0.03em] mb-3 leading-tight">Welcome back</h2>
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-[17px] font-medium tracking-tight">Enter your credentials to access your dashboard.</p>
                    </div>

                    <form className="space-y-6" method="POST" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-[13px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-[20px] w-[20px] text-[#94a3b8] group-focus-within:text-[#6366f1] dark:group-focus-within:text-[#ffffff] transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        name="email"
                                        autoComplete="email"
                                        className="block w-full pl-12 pr-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[13px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-[20px] w-[20px] text-[#94a3b8] group-focus-within:text-[#6366f1] dark:group-focus-within:text-[#ffffff] transition-colors" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        name="password"
                                        autoComplete="current-password"
                                        className="block w-full pl-12 pr-12 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] tracking-[0.2em] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(prev => !prev)}
                                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#6366f1] dark:hover:text-white transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center group">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-5 w-5 border-[#cbd5e1] dark:border-[#ffffff]/20 rounded cursor-pointer transition-colors"
                                    style={{ accentColor: '#000000' }}
                                />
                                <label htmlFor="remember-me" className="ml-3 block text-[14px] font-bold text-[#475569] dark:text-[#94a3b8] cursor-pointer select-none">
                                    Remember me
                                </label>
                            </div>

                            <Link href="/forgot-password" className="text-[14px] font-bold text-[#0f172a] dark:text-[#ffffff] hover:text-[#6366f1] dark:hover:text-[#818cf8] transition-colors">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-5 text-[16px] mt-8 font-black text-[#ffffff] dark:text-[#000000] bg-[#0f172a] dark:bg-[#ffffff] rounded-2xl hover:bg-[#000000] dark:hover:bg-[#f1f5f9] focus:outline-none focus:ring-4 focus:ring-[#0f172a]/10 dark:focus:ring-[#ffffff]/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    Authenticating...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 tracking-wide">Sign In <ArrowRight className="w-5 h-5 ml-1" /></span>
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-[#f1f5f9] dark:border-[#ffffff]/10 text-center">
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-[15px] font-semibold">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-bold text-[#0f172a] dark:text-[#ffffff] hover:text-[#6366f1] dark:hover:text-[#818cf8] transition-colors ml-1">
                                Sign up for free
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

