"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { UserPlus, ArrowLeft, Mail, Lock, User, Phone, Loader2, ShieldCheck, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function AddStudentPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        targetExam: 'NTPC',
        language: 'hi'
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/auth/signup', formData);
            toast.success('Student registered successfully!');
            router.push('/admin/users');
        } catch (error: any) {
            console.error('Registration failed', error);
            const msg = error.response?.data?.message || 'Failed to register student';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/admin/users" className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <UserPlus className="w-6 h-6 text-emerald-600" />
                            Add New Student
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">Register a student manually to the platform.</p>
                    </div>
                </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Full Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <User className="w-4 h-4 text-slate-400" /> Full Name
                                </label>
                                <input
                                    required
                                    type="text"
                                    placeholder="Enter student name"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            {/* Email Address */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-slate-400" /> Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    placeholder="student@example.com"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4 text-slate-400" /> Password
                                </label>
                                <input
                                    required
                                    type="password"
                                    placeholder="Create temporary password"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Phone className="w-4 h-4 text-slate-400" /> Phone Number (Optional)
                                </label>
                                <input
                                    type="tel"
                                    placeholder="+91 00000 00000"
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            {/* Target Exam */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4 text-slate-400" /> Target Exam
                                </label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none bg-white"
                                    value={formData.targetExam}
                                    onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                                >
                                    <option value="NTPC">RRB NTPC</option>
                                    <option value="Group D">RRB Group D</option>
                                    <option value="ALP">RRB ALP</option>
                                    <option value="JE">RRB JE</option>
                                </select>
                            </div>

                            {/* Language */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <ShieldCheck className="w-4 h-4 text-slate-400" /> Learning Language
                                </label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            className="hidden peer"
                                            checked={formData.language === 'hi'}
                                            onChange={() => setFormData({ ...formData, language: 'hi' })}
                                        />
                                        <div className="text-center py-2 border border-slate-200 rounded-xl font-bold text-slate-500 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700 transition-all">
                                            हिन्दी
                                        </div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="language"
                                            className="hidden peer"
                                            checked={formData.language === 'en'}
                                            onChange={() => setFormData({ ...formData, language: 'en' })}
                                        />
                                        <div className="text-center py-2 border border-slate-200 rounded-xl font-bold text-slate-500 peer-checked:bg-emerald-50 peer-checked:border-emerald-500 peer-checked:text-emerald-700 transition-all">
                                            English
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                                Complete Registration
                            </button>
                            <Link
                                href="/admin/users"
                                className="px-6 py-4 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-2xl transition-all active:scale-95"
                            >
                                Cancel
                            </Link>
                        </div>
                    </form>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 italic text-xs text-slate-500 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Manual registration automatically creates a student account. The student can then login with the email and password provided above.
                </div>
            </div>
        </div>
    );
}
