"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { jwtDecode } from 'jwt-decode';

import { User } from '@/types';

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

// Decode user from stored token — zero network call, instant
const getUserFromToken = (): User | null => {
    try {
        if (typeof window === 'undefined') return null;
        const token = localStorage.getItem('token');
        if (!token) return null;

        const decoded: any = jwtDecode(token);
        // Check token expiry
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            localStorage.removeItem('token');
            return null;
        }
        // Return cached user data stored alongside the token
        const cached = localStorage.getItem('user_data');
        return cached ? JSON.parse(cached) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(getUserFromToken); // instant — reads from localStorage
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const checkAuth = async () => {
        // Fast path: reconstruct user from locally cached data (no network)
        const localUser = getUserFromToken();
        if (localUser) {
            setUser(localUser);
            return;
        }

        // Slow path: no cached user, verify with backend
        const token = localStorage.getItem('token');
        if (!token) {
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data } = await api.get('/auth/profile');
            setUser(data);
            localStorage.setItem('user_data', JSON.stringify(data));
        } catch (error) {
            console.error('Auth check failed', error);
            localStorage.removeItem('token');
            localStorage.removeItem('user_data');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Only call backend if we have no cached user data
        const localUser = getUserFromToken();
        if (!localUser) {
            checkAuth();
        }
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            localStorage.setItem('token', data.token);
            // Cache user data locally for instant future loads
            const { token: _, ...userData } = data;
            localStorage.setItem('user_data', JSON.stringify(userData));
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
            const { token: _, ...userOnly } = data;
            localStorage.setItem('user_data', JSON.stringify(userOnly));
            setUser(data);
            toast.success('Account created successfully');
            router.push('/dashboard');
        } catch (error: any) {
            console.error('[Signup Error]:', error);
            const message = error.response?.data?.message || error.message || 'Signup failed';
            toast.error(message);
            throw error;
        }
    };

    const updateProfile = async (userData: any) => {
        try {
            const { data } = await api.put('/auth/profile', userData);
            if (data.token) {
                localStorage.setItem('token', data.token);
            }
            // Merge with existing user data to prevent losing fields
            setUser((prev: any) => {
                const updated = prev ? { ...prev, ...data } : data;
                localStorage.setItem('user_data', JSON.stringify(updated));
                return updated;
            });
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
            // Merge with existing user data
            setUser((prev: any) => {
                const updated = prev ? { ...prev, ...data } : data;
                localStorage.setItem('user_data', JSON.stringify(updated));
                return updated;
            });
            toast.success('Profile picture updated');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Image upload failed');
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_data');
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

