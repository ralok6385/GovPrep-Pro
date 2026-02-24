"use client";

import { useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { ArrowLeft, Mail, Phone, Lock, ShieldCheck, CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

type Step = 'verify' | 'reset' | 'success';

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState<Step>('verify');

    // Step 1: Identity verification
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [verifying, setVerifying] = useState(false);

    // Step 2: Reset password
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [resetting, setResetting] = useState(false);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !phone.trim()) {
            toast.error('Please fill in both fields');
            return;
        }

        setVerifying(true);
        try {
            const { data } = await api.post('/auth/forgot-password', {
                email: email.trim(),
                phone: phone.trim(),
            });
            setResetToken(data.resetToken);
            setStep('reset');
            toast.success('Identity verified!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Verification failed');
        } finally {
            setVerifying(false);
        }
    };

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        setResetting(true);
        try {
            await api.post('/auth/reset-password', {
                resetToken,
                newPassword,
            });
            setStep('success');
            toast.success('Password reset successfully!');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Reset failed');
        } finally {
            setResetting(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <KeyRound className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Reset Password</h1>
                    <p className="text-slate-500 text-sm mt-1 font-medium">
                        {step === 'verify' && "Verify your identity to reset your password"}
                        {step === 'reset' && "Create a new password for your account"}
                        {step === 'success' && "Your password has been updated"}
                    </p>
                </div>

                {/* Progress Steps */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {['verify', 'reset', 'success'].map((s, i) => (
                        <div key={s} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${step === s ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20' :
                                ['verify', 'reset', 'success'].indexOf(step) > i ? 'bg-emerald-500 text-white border-emerald-500' :
                                    'bg-white text-slate-400 border-slate-200'
                                }`}>
                                {['verify', 'reset', 'success'].indexOf(step) > i ? '✓' : i + 1}
                            </div>
                            {i < 2 && <div className={`w-8 h-0.5 ${['verify', 'reset', 'success'].indexOf(step) > i ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">

                    {/* Step 1: Verify Identity */}
                    {step === 'verify' && (
                        <form onSubmit={handleVerify} className="space-y-5">
                            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-start gap-3">
                                <ShieldCheck className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-amber-700 font-medium leading-relaxed">
                                    Enter your registered email and phone number to verify your identity. Both must match our records.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-700"
                                        required
                                        autoComplete="email"
                                        name="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Phone Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="10-digit phone number"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-700"
                                        required
                                        autoComplete="tel"
                                        name="phone"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={verifying}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {verifying ? 'Verifying...' : 'Verify Identity'}
                            </button>
                        </form>
                    )}

                    {/* Step 2: New Password */}
                    {step === 'reset' && (
                        <form onSubmit={handleReset} className="space-y-5">
                            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                                <p className="text-xs text-emerald-700 font-medium leading-relaxed">
                                    Identity verified for <strong>{email}</strong>. Create your new password below.
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Minimum 6 characters"
                                        className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-700"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        name="newPassword"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Re-enter your password"
                                        className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all text-slate-700"
                                        required
                                        minLength={6}
                                        autoComplete="new-password"
                                        name="confirmPassword"
                                    />
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Passwords do not match
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={resetting || newPassword !== confirmPassword || newPassword.length < 6}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
                            >
                                {resetting ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </form>
                    )}

                    {/* Step 3: Success */}
                    {step === 'success' && (
                        <div className="text-center py-6">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Password Updated!</h3>
                            <p className="text-sm text-slate-500 font-medium mb-8">
                                Your password has been changed successfully. You can now login with your new password.
                            </p>
                            <button
                                onClick={() => router.push('/login')}
                                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                            >
                                Go to Login
                            </button>
                        </div>
                    )}
                </div>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <Link href="/login" className="text-sm font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1.5">
                        <ArrowLeft className="w-4 h-4" /> Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
