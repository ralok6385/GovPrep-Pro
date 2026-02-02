"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    targetExam?: string;
    language?: string;
    avatar?: string;
    selectedExam?: string; // Keeping for backward compat if needed
    streak?: number;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: any) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateProfile: (data: any) => Promise<void>;
    uploadProfileImage: (file: File) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success('Logged in successfully');
            router.push(data.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            throw error;
        }
    };

    const signup = async (userData: any) => {
        try {
            const { data } = await api.post('/auth/signup', userData);
            localStorage.setItem('token', data.token);
            setUser(data);
            toast.success('Account created successfully');
            router.push('/dashboard');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Signup failed');
            throw error;
        }
    };

    const updateProfile = async (userData: any) => {
        try {
            const { data } = await api.put('/auth/profile', userData);
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setUser(data);
            toast.success('Profile updated successfully');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Update failed');
            throw error;
        }
    };

    const uploadProfileImage = async (file: File) => {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const { data } = await api.put('/auth/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            setUser(data);
            toast.success('Profile picture updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Image upload failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        router.replace('/login');
        toast.success('Logged out');
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, signup, logout, checkAuth, updateProfile, uploadProfileImage }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
