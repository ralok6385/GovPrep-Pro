"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { Train, CheckCircle2, ShieldCheck, Languages } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        targetExam: 'NTPC',
        language: 'hi' // Default Hindi
    });
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(formData);
            toast.success('Account created! Welcome to Railway Prep.');
        } catch (err) {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[100dvh] flex flex-col lg:flex-row bg-[#ffffff] dark:bg-[#000000] transition-colors duration-500 font-sans">
            {/* Left Side - Deep SaaS Branding */}
            <div className="hidden lg:flex lg:w-[45%] bg-[#030303] border-r border-[#ffffff]/5 text-[#ffffff] p-16 flex-col justify-between relative overflow-hidden">
                {/* Premium Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#3b82f6]/10 via-[#10b981]/5 to-transparent pointer-events-none" />
                <div className="absolute top-0 right-0 w-full h-[600px] bg-[#10b981]/20 blur-[180px] -translate-y-1/2 translate-x-1/3 rounded-full pointer-events-none" />

                <div className="relative z-10 flex flex-col gap-8">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-14 h-14 bg-[#ffffff]/10 border border-[#ffffff]/20 rounded-[1.25rem] flex items-center justify-center p-2.5 backdrop-blur-xl shadow-2xl">
                            <Image src="/logo.png" alt="Lalan RailPath" width={38} height={38} className="object-contain" />
                        </div>
                        <span className="text-2xl font-black tracking-tight text-[#ffffff]/90">Lalan RailPath</span>
                    </div>

                    <h1 className="text-[4rem] font-black leading-[1.02] tracking-[-0.04em]">
                        Your launchpad to a <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34d399] to-[#22d3ee]">government</span> career.
                    </h1>
                    <p className="text-[#ffffff]/60 text-xl max-w-md leading-relaxed mt-4 font-medium">
                        Join an elite cohort of aspirants using our AI-driven analytics to secure their future.
                    </p>

                    <div className="space-y-6 mt-12">
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#10b981]/20 border border-[#10b981]/30 flex items-center justify-center shadow-lg">
                                <CheckCircle2 className="text-[#34d399] w-4 h-4" />
                            </div>
                            <span className="text-[#ffffff]/90 font-semibold text-[15px] tracking-wide">Hyper-targeted Daily Study Goals</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#6366f1]/20 border border-[#6366f1]/30 flex items-center justify-center shadow-lg">
                                <ShieldCheck className="text-[#818cf8] w-4 h-4" />
                            </div>
                            <span className="text-[#ffffff]/90 font-semibold text-[15px] tracking-wide">Advanced Exam-Specific Analytics</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10 w-full max-w-lg mt-auto">
                    <div className="bg-[#ffffff]/[0.02] border border-[#ffffff]/10 rounded-3xl p-8 backdrop-blur-2xl">
                        <p className="italic text-[#ffffff]/70 font-light text-[17px] leading-relaxed mb-5 flex items-start gap-3">
                            <span className="text-[#22d3ee] text-3xl leading-none font-serif">"</span>
                            Success occurs when your dreams get bigger than your excuses. Register today and start building.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side - Monumental Signup Container */}
            <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-16 lg:p-24 relative overflow-hidden bg-[#ffffff] dark:bg-[#000000] transition-colors duration-500">
                
                <div className="w-full max-w-[540px] relative z-20">
                    <div className="mb-10 text-left">
                        <h2 className="text-[40px] font-black text-[#0f172a] dark:text-[#ffffff] tracking-[-0.03em] mb-3 leading-tight">Create Account</h2>
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-[17px] font-medium tracking-tight">Get your free account and begin your preparation.</p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    name="name"
                                    autoComplete="name"
                                    className="block w-full px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                    placeholder="Amit Kumar"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    className="block w-full px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                name="email"
                                autoComplete="email"
                                className="block w-full px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                placeholder="student@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <div>
                                <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Target Exam</label>
                                <div className="relative group">
                                    <select
                                        className="block w-full pl-5 pr-10 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] font-semibold text-[15px] appearance-none transition-all duration-300 cursor-pointer outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                        value={formData.targetExam}
                                        onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                                    >
                                        <option value="NTPC" className="bg-[#ffffff] dark:bg-[#111111]">RRB NTPC</option>
                                        <option value="Group D" className="bg-[#ffffff] dark:bg-[#111111]">RRB Group D</option>
                                        <option value="ALP" className="bg-[#ffffff] dark:bg-[#111111]">RRB ALP</option>
                                        <option value="JE" className="bg-[#ffffff] dark:bg-[#111111]">RRB JE</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <Train className="w-5 h-5 text-[#94a3b8] group-focus-within:text-[#6366f1] dark:group-focus-within:text-[#ffffff] transition-colors" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Language</label>
                                <div className="relative group">
                                    <select
                                        className="block w-full pl-5 pr-10 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] font-semibold text-[15px] appearance-none transition-all duration-300 cursor-pointer outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="hi" className="bg-[#ffffff] dark:bg-[#111111]">Hindi (हिंदी)</option>
                                        <option value="en" className="bg-[#ffffff] dark:bg-[#111111]">English</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                                        <Languages className="w-5 h-5 text-[#94a3b8] group-focus-within:text-[#6366f1] dark:group-focus-within:text-[#ffffff] transition-colors" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[12px] font-black text-[#334155] dark:text-[#cbd5e1] uppercase tracking-[0.1em] mb-2.5 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                name="password"
                                autoComplete="new-password"
                                className="block w-full px-5 py-4 bg-[#f8fafc] hover:bg-[#f1f5f9] focus:bg-[#ffffff] dark:bg-[#0a0a0a] dark:hover:bg-[#111111] dark:focus:bg-[#111111] border border-[#e2e8f0] dark:border-[#ffffff]/10 focus:border-[#6366f1] dark:focus:border-[#ffffff]/30 rounded-2xl text-[#0f172a] dark:text-[#ffffff] placeholder:text-[#94a3b8] dark:placeholder:text-[#64748b] font-semibold text-[16px] tracking-[0.2em] transition-all duration-300 outline-none shadow-sm focus:shadow-[0_0_0_4px_rgba(99,102,241,0.1)] dark:focus:shadow-[0_0_0_4px_rgba(255,255,255,0.05)]"
                                placeholder="Create Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-5 text-[16px] mt-8 font-black text-[#ffffff] dark:text-[#000000] bg-[#0f172a] dark:bg-[#ffffff] rounded-2xl hover:bg-[#000000] dark:hover:bg-[#f1f5f9] focus:outline-none focus:ring-4 focus:ring-[#0f172a]/10 dark:focus:ring-[#ffffff]/10 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                     <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                     Creating Account...
                                </span>
                            ) : (
                                "Start Preparation"
                            )}
                        </button>
                    </form>

                    <div className="mt-12 pt-8 border-t border-[#f1f5f9] dark:border-[#ffffff]/10 text-center">
                        <p className="text-[#64748b] dark:text-[#94a3b8] text-[15px] font-semibold">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-[#0f172a] dark:text-[#ffffff] hover:text-[#6366f1] dark:hover:text-[#818cf8] transition-colors ml-1">
                                Login Here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
