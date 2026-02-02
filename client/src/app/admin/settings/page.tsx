"use client";

import { Settings, PlusCircle, BookOpen, Library, Video, UserPlus, FileQuestion, FileText, Database, ShieldCheck, Camera, Save, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import toast from 'react-hot-toast';

function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            type="button"
            className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-bold rounded-lg transition-colors shadow-sm"
        >
            {theme === 'dark' ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
        </button>
    );
}

export default function SettingsPage() {
    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
            {/* Header */}
            <div className="flex items-center gap-4 border-b border-slate-200 pb-8">
                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200 shadow-sm">
                    <Settings className="w-8 h-8 text-slate-600" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 tracking-tight">System Settings</h1>
                    <p className="text-slate-500 font-medium">Manage platform configurations and core data.</p>
                </div>
            </div>

            {/* 0. Profile & Account (New Section) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-600" />
                        Profile & Account
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Update your personal admin details.</p>
                </div>
                <div className="md:col-span-2">
                    <ProfileSettings />
                </div>
            </div>

            <hr className="border-slate-200" />

            {/* 1. Quick Create (The "Everything" Section) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="col-span-full mb-2">
                    <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <PlusCircle className="w-5 h-5 text-indigo-600" />
                        Quick Create
                    </h2>
                    <p className="text-sm text-slate-500">Fast track new content creation.</p>
                </div>

                <QuickAction href="/admin/exams" icon={BookOpen} label="Add New Exam" desc="Create RRB NTPC, JE, etc." color="bg-blue-50 text-blue-600 hover:bg-blue-100" />
                <QuickAction href="/admin/subjects" icon={Library} label="Add Subject" desc="Link topics to exams." color="bg-indigo-50 text-indigo-600 hover:bg-indigo-100" />
                <QuickAction href="/admin/videos/add" icon={Video} label="Upload Video" desc="Add lectures from YT." color="bg-red-50 text-red-600 hover:bg-red-100" />
                <QuickAction href="/admin/users?add=true" icon={UserPlus} label="Add Student" desc="Manually register user." color="bg-emerald-50 text-emerald-600 hover:bg-emerald-100" />
                <QuickAction href="/admin/questions" icon={FileQuestion} label="Add Question" desc="Expand the Q-Bank." color="bg-amber-50 text-amber-600 hover:bg-amber-100" />
                <QuickAction href="/admin/tests" icon={FileText} label="Create Test" desc="Build a mock exam." color="bg-purple-50 text-purple-600 hover:bg-purple-100" />
            </div>

            {/* 2. System Management */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <Database className="w-5 h-5 text-slate-500" />
                        Data Management
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <span className="font-medium text-slate-700">Appearance</span>
                            <ThemeToggle />
                        </div>
                        <button onClick={() => alert('Cache Cleared!')} className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left group">
                            <span className="font-medium text-slate-700">Clear System Cache</span>
                            <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 group-hover:text-indigo-600">Execute</span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors text-left group">
                            <span className="font-medium text-slate-700">Re-index Search</span>
                            <span className="text-xs font-bold bg-white border border-slate-200 px-2 py-1 rounded text-slate-500 group-hover:text-indigo-600">Execute</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-lg text-slate-800 mb-4 flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-slate-500" />
                        Admin Status
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Current Role</span>
                            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-1 rounded">SUPER ADMIN</span>
                        </div>
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <span className="text-sm text-slate-500">Last Login</span>
                            <span className="text-sm font-medium text-slate-700">Just Now</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-500">System Version</span>
                            <span className="text-sm font-medium text-slate-700">v2.4.0 (Stable)</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ProfileSettings() {
    const { user, updateProfile, uploadProfileImage } = useAuth();
    const [name, setName] = useState(user?.name || '');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateProfile({ name });
            // Toast handled in context
        } catch (error) {
            // Error handled in context
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await uploadProfileImage(file);
            // Toast handled in context
        } catch (error) {
            // Error handled in context
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-start gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-3">
                    <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <div className="w-24 h-24 rounded-full bg-slate-100 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center">
                            {user?.avatar ? (
                                <img src={user?.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <span className="text-3xl font-bold text-slate-400">{user?.name?.[0]}</span>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                            <Camera className="w-6 h-6" />
                        </div>
                        {uploading && (
                            <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white">
                                <Loader2 className="w-6 h-6 animate-spin" />
                            </div>
                        )}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                        Change Photo
                    </button>
                </div>

                {/* Form Section */}
                <form onSubmit={handleUpdateProfile} className="flex-1 space-y-4 max-w-sm">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            value={user?.email}
                            disabled
                            className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Email cannot be changed directly.</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

function QuickAction({ href, icon: Icon, label, desc, color }: any) {
    return (
        <Link href={href} className={`flex items-start gap-4 p-5 rounded-2xl border border-transparent transition-all duration-200 group ${color} hover:shadow-lg hover:-translate-y-1`}>
            <div className={`p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform`}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <h3 className="font-bold text-lg mb-1">{label}</h3>
                <p className="text-xs font-medium opacity-80 leading-relaxed">{desc}</p>
            </div>
        </Link>
    );
}
