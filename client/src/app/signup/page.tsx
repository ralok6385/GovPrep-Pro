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
        <div className="min-h-[100dvh] flex bg-slate-50">
            {/* Left Side - Railway Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-900 to-slate-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-yellow-400 rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <Image src="/logo.png" alt="Lalan RailPath" width={60} height={60} className="w-16 h-16 object-contain bg-white/10 rounded-xl p-1" />
                        <span className="text-xl font-bold tracking-wide">Lalan RailPath</span>
                    </div>

                    <h1 className="text-5xl font-extrabold mb-6 leading-tight">
                        Platform for <br />
                        <span className="text-yellow-400">Future Railway Officers</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-md mb-8 leading-relaxed">
                        Dedicated only to RRB NTPC, Group D, ALP, and JE. No clutter, just streamlined preparation in Hindi & English.
                    </p>

                    <div className="space-y-5">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-yellow-400 w-6 h-6" />
                            <span className="text-indigo-100 font-medium">Daily Target (Aaj ka Lakshya)</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-yellow-400 w-6 h-6" />
                            <span className="text-indigo-100 font-medium">Exam-Specific Notes</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-yellow-400 w-6 h-6" />
                            <span className="text-indigo-100 font-medium">Direct Job Application Links</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
                        <p className="font-semibold text-sm text-yellow-200">"Sarkari Naukri ki Taiyari, Ab Humari Zimmedari"</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white text-gray-900">
                <div className="w-full max-w-md space-y-6">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-800">Create Account</h2>
                        <p className="mt-2 text-slate-500">Apni taiyari shuru karein (Start your prep)</p>
                    </div>

                    <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    name="name"
                                    autoComplete="name"
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="Amit Kumar"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Phone</label>
                                <input
                                    type="tel"
                                    required
                                    maxLength={10}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Email Address</label>
                            <input
                                type="email"
                                required
                                name="email"
                                autoComplete="email"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="student@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Target Exam (Lakshya)</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium appearance-none"
                                        value={formData.targetExam}
                                        onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                                    >
                                        <option value="NTPC">RRB NTPC</option>
                                        <option value="Group D">RRB Group D</option>
                                        <option value="ALP">RRB ALP</option>
                                        <option value="JE">RRB JE</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <Train className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Language (Bhasha)</label>
                                <div className="relative">
                                    <select
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium appearance-none"
                                        value={formData.language}
                                        onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                    >
                                        <option value="hi">Hindi (हिंदी)</option>
                                        <option value="en">English</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                        <Languages className="w-4 h-4 text-slate-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Password</label>
                            <input
                                type="password"
                                required
                                name="password"
                                autoComplete="new-password"
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                                placeholder="Create Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-xl shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.01] disabled:opacity-70"
                        >
                            {loading ? 'Creating Account...' : 'Start Preparation'}
                        </button>
                    </form>

                    <p className="mt-4 text-center text-sm text-slate-500">
                        Already have an account?{' '}
                        <Link href="/login" className="font-bold text-blue-700 hover:underline">
                            Login Here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
