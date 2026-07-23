"use client";

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { LogOut, User as UserIcon, ChefHat, ChevronDown } from 'lucide-react';
import Link from 'next/link';

import UserAvatar from '@/components/UserAvatar';

export default function UserMenu() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (!user) return null;

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-700/50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-white leading-none">{user.name}</p>
                    <p className="text-xs text-indigo-300 capitalize">{user.role}</p>
                </div>
                <UserAvatar src={user.avatar} name={user.name} size="md" />
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 py-1 z-50 transform origin-top-right transition-all animate-fade-in-up">
                    <div className="px-4 py-3 border-b border-gray-100 sm:hidden">
                        <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                        <Link
                            href="/dashboard/profile"
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => setIsOpen(false)}
                        >
                            <UserIcon className="w-4 h-4 text-gray-400" />
                            My Profile
                        </Link>
                    </div>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                        onClick={() => {
                            setIsOpen(false);
                            logout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Log Out
                    </button>
                </div>
            )}
        </div>
    );
}
