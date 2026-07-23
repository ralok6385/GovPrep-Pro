"use client";

import { useState, useEffect } from 'react';

interface UserAvatarProps {
    src?: string | null;
    name?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}

export default function UserAvatar({ src, name = 'User', size = 'md', className = '' }: UserAvatarProps) {
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        setImageError(false);
    }, [src]);

    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-16 h-16 text-xl',
        xl: 'w-24 h-24 text-3xl',
    };

    const initial = name ? name[0].toUpperCase() : 'U';

    if (src && !imageError) {
        return (
            <div className={`relative rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 ${sizeClasses[size]} ${className}`}>
                <img
                    src={src}
                    alt={name}
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                />
            </div>
        );
    }

    return (
        <div
            className={`rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-black shadow-inner shrink-0 border border-white/20 ${sizeClasses[size]} ${className}`}
        >
            {initial}
        </div>
    );
}
