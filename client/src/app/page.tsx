"use client";

import Link from 'next/link';
import { Trophy, Zap, Target, BookOpen, Sparkles, CheckCircle2, ArrowRight, ShieldCheck, Flame, Users, Star, Train, Brain, History, Swords } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LandingPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans overflow-hidden selection:bg-indigo-500 selection:text-white">
            {/* Header / Nav */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/lalan_logo.png" alt="Lalan RailPath" className="h-10 w-auto object-contain" />
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <Link
                                href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'}
                                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm flex items-center gap-2"
                            >
                                Go to Dashboard <ArrowRight className="w-4 h-4" />
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-slate-300 hover:text-white font-semibold text-sm transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    href="/signup"
                                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all text-sm"
                                >
                                    Start Free
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-36 pb-20 px-6 max-w-7xl mx-auto text-center">
                {/* Glow backdrop */}
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-pink-600/30 blur-[140px] rounded-full pointer-events-none" />

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-8 backdrop-blur-md">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    India's #1 Railway Exam Preparation Platform
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] max-w-4xl mx-auto mb-6">
                    Crack Railway Exams <br className="hidden sm:inline" />
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                        With AI-Powered Precision
                    </span>
                </h1>

                <p className="text-slate-400 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
                    NTA-style Live Mock Exams, 1v1 Quiz Battles, PYQ Banks & AI Weakness Analysis tailored for RRB NTPC, Group D, ALP & JE.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto mb-16">
                    <Link
                        href={user ? '/dashboard' : '/signup'}
                        className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-base rounded-2xl shadow-xl shadow-indigo-600/30 hover:scale-105 transition-all flex items-center justify-center gap-2"
                    >
                        <Zap className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        {user ? 'Open Dashboard' : 'Start Free Practice'}
                    </Link>
                    <Link
                        href="/login"
                        className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-bold text-base rounded-2xl transition-all"
                    >
                        Sign In
                    </Link>
                </div>

                {/* Exam Badges */}
                <div className="flex flex-wrap items-center justify-center gap-3">
                    {['RRB NTPC CBT-1 & 2', 'RRB Group D', 'RRB ALP & Technician', 'RRB JE'].map(exam => (
                        <div key={exam} className="flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-white/10 rounded-xl text-slate-300 text-xs font-bold">
                            <Train className="w-4 h-4 text-indigo-400" />
                            {exam}
                        </div>
                    ))}
                </div>
            </section>

            {/* Feature Highlights Grid */}
            <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/10">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h2 className="text-3xl font-black sm:text-4xl mb-4">Everything You Need To Secure Rank 1</h2>
                    <p className="text-slate-400 text-sm sm:text-base">Designed specifically around official Railway Recruitment Board patterns.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={Trophy}
                        iconColor="text-indigo-400"
                        title="NTA Live Test Engine"
                        desc="Exact NTA interface with section timer, question palette, and anti-cheat tracking."
                    />
                    <FeatureCard
                        icon={Swords}
                        iconColor="text-rose-400"
                        title="1v1 Battle Arena"
                        desc="Challenge fellow aspirants in real-time speed quiz battles to sharpen your quick recall."
                    />
                    <FeatureCard
                        icon={Brain}
                        iconColor="text-purple-400"
                        title="AI Weakness Heatmap"
                        desc="Get instant subject & topic weakness detection to focus only where marks are lost."
                    />
                    <FeatureCard
                        icon={History}
                        iconColor="text-emerald-400"
                        title="Decade PYQ Bank"
                        desc="Topic-wise 10-year Previous Year Questions with instant answer reveal & step-by-step solutions."
                    />
                </div>
            </section>

            {/* Stats Counter Section */}
            <section className="py-16 bg-gradient-to-r from-indigo-950 via-slate-900 to-purple-950 border-y border-white/10">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <p className="text-4xl font-black text-white mb-1">50,000+</p>
                        <p className="text-xs uppercase tracking-widest text-indigo-300 font-bold">Active Aspirants</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white mb-1">100,000+</p>
                        <p className="text-xs uppercase tracking-widest text-purple-300 font-bold">Questions Practiced</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white mb-1">98.4%</p>
                        <p className="text-xs uppercase tracking-widest text-emerald-300 font-bold">Exam Match Accuracy</p>
                    </div>
                    <div>
                        <p className="text-4xl font-black text-white mb-1">4.9 ★</p>
                        <p className="text-xs uppercase tracking-widest text-yellow-300 font-bold">Student Rating</p>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <footer className="py-12 px-6 max-w-7xl mx-auto border-t border-white/10 text-center text-slate-500 text-xs">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-2">
                        <img src="/images/lalan_logo.png" alt="Lalan RailPath" className="h-8 w-auto opacity-80" />
                    </div>
                    <div className="flex gap-6 font-semibold text-slate-400">
                        <Link href="/login" className="hover:text-white transition-colors">Login</Link>
                        <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
                        <Link href="/dashboard/pyq" className="hover:text-white transition-colors">PYQs</Link>
                    </div>
                </div>
                <p>© {new Date().getFullYear()} Lalan RailPath. All rights reserved. Empowering Railway Aspirants Across India.</p>
            </footer>
        </div>
    );
}

function FeatureCard({ icon: Icon, iconColor, title, desc }: any) {
    return (
        <div className="p-6 bg-slate-900/60 border border-white/10 rounded-3xl hover:border-white/20 transition-all hover:-translate-y-1">
            <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${iconColor} mb-4`}>
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
        </div>
    );
}
