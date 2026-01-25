"use client";

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ShieldCheck, Users } from 'lucide-react';

export default function SignupPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
    });
    const { signup } = useAuth();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await signup(formData);
        } catch (err) {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Left Side - Hero/Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-900 text-white p-12 flex-col justify-between relative overflow-hidden">
                {/* Abstract Background Shapes */}
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-400 rounded-full mix-blend-overlay filter blur-3xl opacity-50"></div>
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-8">
                        <div className="bg-white/10 p-2 rounded-lg">
                            <BookOpen className="w-8 h-8 text-emerald-400" />
                        </div>
                        <span className="text-xl font-bold tracking-wide">GovJob Prep</span>
                    </div>

                    <h1 className="text-5xl font-bold mb-6 leading-tight">
                        Master Your Dream <br />
                        <span className="text-emerald-400">Government Job</span>
                    </h1>
                    <p className="text-indigo-200 text-lg max-w-md mb-8">
                        Join India's fastest growing community of aspirants. Get access to premium mock tests, expert notes, and real-time analytics.
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                            <span className="text-indigo-100">Daily Updates & Current Affairs</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                            <span className="text-indigo-100">All India Rank & Performance Analysis</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                            <span className="text-indigo-100">Previous Year Question Papers</span>
                        </div>
                    </div>
                </div>

                <div className="relative z-10">
                    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20 flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <div className="w-10 h-10 rounded-full bg-yellow-400 border-2 border-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-900">AK</div>
                            <div className="w-10 h-10 rounded-full bg-pink-400 border-2 border-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-900">RS</div>
                            <div className="w-10 h-10 rounded-full bg-emerald-400 border-2 border-indigo-900 flex items-center justify-center text-xs font-bold text-indigo-900">MD</div>
                        </div>
                        <div>
                            <p className="font-semibold text-sm">Trusted by 10,000+ Students</p>
                            <p className="text-indigo-300 text-xs">Join the community today</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white text-gray-900">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-gray-900">Create an account</h2>
                        <p className="mt-2 text-gray-600">Start your 7-day free trial of premium features.</p>
                    </div>

                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="e.g. Rahul Sharma"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="name@example.com"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="9876543210"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-[1.01] disabled:opacity-50 disabled:cursor-wait"
                            >
                                {loading ? 'Creating Account...' : 'Sign Up'}
                            </button>
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                <svg className="h-5 w-5" aria-hidden="true" viewBox="0 0 24 24">
                                    <path d="M12.0003 20.41c-5.2317 0-9.2844-3.563-10.9079-8.41.0002.0002-.8929 3.0125.7533 6.3262 1.6373 3.327 5.0945 5.627 9.1546 5.627 4.0906 0 7.5218-2.5204 9.1469-5.9221L19.4975 16.5c-1.3168 2.2764-3.7656 3.91-6.4972 3.91z" fill="#34A853" />
                                    <path d="M23.4897 10.1601c.1456 1.0506.2238 2.1332.2238 3.2399 0 .848-.0461 1.6811-.1337 2.4984h-4.0815v-4.0815h-2.1645v4.9127h6.0594c-.6945 3.336-3.642 5.8601-7.1929 5.8601-4.0906 0-7.5218-2.5204-9.1469-5.9221l2.4973-1.9284c1.3168 2.2764 3.7656 3.91 6.4972 3.91 1.8385 0 3.5292-.7197 4.8143-1.8903l-2.0298-2.8226c-.8467.4367-1.8087.683-2.8369.683-3.4143 0-6.1819-2.7676-6.1819-6.1819 0-1.2587.382-2.4346 1.0374-3.4079l-2.6163-1.8797C2.0456 5.242 0 8.3847 0 12c0 6.6274 5.3726 12 12 12 2.651 0 5.0955-.8456 7.0952-2.2882l-2.302-3.1537c-1.3916 1.0064-3.1093 1.5947-4.9456 1.5947-3.6841 0-6.8681-2.3486-8.1504-5.6423l2.5855-2.0055c.9284 2.1187 3.056 3.6063 5.5649 3.6063 1.2599 0 2.435-.3822 3.4093-1.037L15.9084 12h7.5813z" fill="#FBBC05" />
                                    <path d="M12.0003 3.58c2.3789 0 4.5447.8543 6.228 2.2743l-2.0298 2.8226c-1.2851-1.1706-2.9758-1.8903-4.8143-1.8903-2.7316 0-5.1804 1.6336-6.4972 3.91l-2.4973-1.9284c1.6251-3.4017 5.0563-5.9221 9.1469-5.9221z" fill="#EA4335" />
                                    <path d="M5.4927 6.4475c-.6554.9733-1.0374 2.1492-1.0374 3.4079 0 .8643.176 1.6865.4921 2.4439l2.5855-2.0055c-.172-.489-.2676-1.0125-.2676-1.5562 0-1.0282.383-1.9897.9942-2.7316l-2.6163-1.8797z" fill="#4285F4" />
                                </svg>
                                <span className="ml-2">Google</span>
                            </button>
                            <button type="button" className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">
                                <Users className="h-5 w-5 text-gray-400" />
                                <span className="ml-2">Guest</span>
                            </button>
                        </div>
                    </form>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
