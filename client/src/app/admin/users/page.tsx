"use client";

import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { Users, Search, Shield, GraduationCap, Calendar, Mail, UserPlus, X, Lock, Phone as PhoneIcon, Loader2, User as UserIcon } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    targetExam: string;
    createdAt: string;
    isDeleted: boolean;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);

    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        if (searchParams.get('add') === 'true') {
            setShowAddModal(true);
            // Clear the param without full reload
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete('add');
            router.replace(`/admin/users?${newParams.toString()}`);
        }
        fetchUsers();
    }, [searchParams, router]);

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/auth/users');
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (user: User) => {
        if (!confirm(`Are you sure you want to ${user.isDeleted ? 'restore' : 'deactivate'} ${user.name}?`)) return;

        try {
            await api.put(`/auth/users/${user._id}/status`);
            toast.success(`User ${user.isDeleted ? 'restored' : 'deactivated'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status', error);
            toast.error('Failed to update user status');
        }
    };


    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="p-8 text-center text-slate-500">Loading users...</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users className="w-6 h-6 text-indigo-600" />
                        Student Management
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Total Registered Users: <span className="font-bold text-slate-800">{users.length}</span>
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search students..."
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-bold shadow-md shadow-indigo-500/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <UserPlus className="w-4 h-4" /> Add Student
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-200">
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Student</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Target Exam</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Role</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Joined</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                                <tr key={user._id} className={`hover:bg-slate-50/50 transition-colors ${user.isDeleted ? 'opacity-60 bg-slate-50/30 grayscale-[0.8]' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm">{user.name}</p>
                                                <p className="text-xs text-slate-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.targetExam ? (
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                                <GraduationCap className="w-3 h-3" />
                                                {user.targetExam}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-xs italic">Not Set</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-bold uppercase ${user.role === 'admin'
                                            ? 'bg-purple-50 text-purple-700 border border-purple-100'
                                            : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                                            }`}>
                                            {user.role === 'admin' && <Shield className="w-3 h-3" />}
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${user.isDeleted
                                                ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200'
                                                : 'bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200'
                                                }`}
                                        >
                                            {user.isDeleted ? 'Restore' : 'Delete'}
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">
                                        No students found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <AddStudentModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false);
                    fetchUsers();
                }}
            />
        </div>
    );
}

function AddStudentModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        targetExam: 'NTPC',
        language: 'hi'
    });

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/signup', formData);
            toast.success('Student registered successfully!');
            setFormData({
                name: '',
                email: '',
                password: '',
                phone: '',
                targetExam: 'NTPC',
                language: 'hi'
            });
            onSuccess();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to register student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-slate-100 animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <UserPlus className="w-5 h-5 text-indigo-600" /> Add Student
                    </h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            required
                            type="text"
                            placeholder="Full Name"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            required
                            type="email"
                            placeholder="Email Address"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            required
                            type="password"
                            placeholder="Password (min 6 chars)"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div className="relative">
                        <PhoneIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="tel"
                            placeholder="Phone (Optional)"
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm font-medium"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Target Exam</label>
                            <select
                                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-xs font-bold appearance-none bg-white"
                                value={formData.targetExam}
                                onChange={(e) => setFormData({ ...formData, targetExam: e.target.value })}
                            >
                                <option value="NTPC">RRB NTPC</option>
                                <option value="Group D">RRB Group D</option>
                                <option value="ALP">RRB ALP</option>
                                <option value="JE">RRB JE</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Language</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: 'hi' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${formData.language === 'hi' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                >
                                    हिन्दी
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: 'en' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-bold border transition-all ${formData.language === 'en' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}
                                >
                                    ENG
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70 mt-4 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
                        {loading ? 'Creating...' : 'Register Student'}
                    </button>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-3 text-slate-500 text-xs font-bold hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    );
}
