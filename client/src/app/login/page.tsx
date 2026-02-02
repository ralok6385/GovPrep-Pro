"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Train, CheckCircle2, Lock, Mail, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const { login, user, loading: authLoading } = useAuth();
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    // Redirect if already logged in
    useEffect(() => {
        if (!authLoading && user) {
            router.replace(user.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
    }, [user, authLoading, router]);

    // Load saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem('govprep_user_email');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberMe(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await login(email, password);

            // Handle Remember Me
            if (rememberMe) {
                localStorage.setItem('govprep_user_email', email);
            } else {
                localStorage.removeItem('govprep_user_email');
            }

            toast.success('Welcome back!');
        } catch (err: any) {
            setLoading(false);
            if (!err.response) {
                toast.error("Server unreachable. Please check your internet or try again later.");
            } else if (err.response.status === 500) {
                toast.error("Internal Server Error. Please try again later.");
            } else {
                toast.error(err.response?.data?.message || 'Login failed. Please check your credentials.');
            }
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Left Side - Branding (Enhanced) */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-900 via-indigo-800 to-purple-900 text-white p-16 flex-col justify-between relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full mix-blend-overlay filter blur-[100px] opacity-20 animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-500 rounded-full mix-blend-overlay filter blur-[120px] opacity-20"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-10">
                        <Image src="/logo.png" alt="Lalan RailPath" width={60} height={60} className="w-16 h-16 object-contain bg-white/10 rounded-xl p-1" />
                        <span className="text-2xl font-bold tracking-tight text-white">Lalan RailPath</span>
                    </div>

                    <h1 className="text-5xl font-extrabold mb-6 leading-tight tracking-tight">
                        Welcome to <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-200">Lalan RailPath</span>
                    </h1>
                    <p className="text-indigo-100 text-lg max-w-md mb-8 leading-relaxed opacity-90">
                        Join thousands of aspirants acing NTPC, Group D, and ALP with our AI-powered mock tests and analytics.
                    </p>

                    <div className="flex gap-4">
                        <div className="flex -space-x-3">
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-yellow-400 flex items-center justify-center text-indigo-900 font-bold text-xs">A</div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-pink-400 flex items-center justify-center text-indigo-900 font-bold text-xs">P</div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-emerald-400 flex items-center justify-center text-indigo-900 font-bold text-xs">R</div>
                            <div className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">+2k</div>
                        </div>
                        <div className="flex flex-col justify-center">
                            <span className="text-sm font-bold text-white">Active Aspirants</span>
                            <span className="text-xs text-indigo-300">Preparing right now</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/5 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-2xl">
                        <p className="italic text-indigo-100 mb-4 font-light text-lg">"The secret of getting ahead is getting started."</p>
                        <p className="font-bold text-emerald-300 tracking-wide">— Mark Twain</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form (Modernized) */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white xl:bg-slate-50/50">
                <div className="w-full max-w-md bg-white p-0 xl:p-10 xl:rounded-3xl xl:shadow-sm xl:border border-slate-100">
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-3 text-slate-500 text-base">Please enter your details to sign in.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="email"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Password</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                                    </div>
                                    <input
                                        type="password"
                                        required
                                        className="block w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 focus:bg-white transition-all font-medium"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-600 cursor-pointer select-none">Remember me</label>
                            </div>

                            <div className="text-sm">
                                <a href="#" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">Forgot password?</a>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-indigo-500/30 text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing In...
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">Sign In <ArrowRight className="w-5 h-5" /></span>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-bold text-indigo-600 hover:text-indigo-500 hover:underline">
                                Create a free account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
