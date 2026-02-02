"use client";

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BackButton({ label = 'Back', className = '' }: { label?: string, className?: string }) {
    const router = useRouter();

    return (
        <button
            onClick={() => router.back()}
            className={`flex items-center text-slate-400 hover:text-white transition-colors mb-6 text-sm font-medium ${className}`}
        >
            <ArrowLeft className="w-4 h-4 mr-1" />
            {label}
        </button>
    );
}
