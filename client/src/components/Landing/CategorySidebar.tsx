"use client";

import { Landmark, Train, GraduationCap, Building2, Shield, Briefcase, BookOpen } from 'lucide-react';

interface CategorySidebarProps {
    selectedCategory: string;
    onSelect: (category: string) => void;
}

export const CATEGORIES = [
    { id: 'banking', name: 'Banking and Insurance', icon: Landmark, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 'ssc', name: 'SSC and Railways', icon: Train, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 'teaching', name: 'Teaching Exams', icon: GraduationCap, color: 'text-orange-600', bg: 'bg-orange-100' },
    { id: 'state', name: 'State Exams', icon: Building2, color: 'text-purple-600', bg: 'bg-purple-100' },
    { id: 'defence', name: 'Defence Exams', icon: Shield, color: 'text-red-600', bg: 'bg-red-100' },
    { id: 'engineering', name: 'Engineering JE/AE', icon: Briefcase, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { id: 'entrance', name: 'Entrance Exams', icon: BookOpen, color: 'text-pink-600', bg: 'bg-pink-100' },
];

export default function CategorySidebar({ selectedCategory, onSelect }: CategorySidebarProps) {
    return (
        <div className="w-full lg:w-72 flex-shrink-0 bg-white shadow-lg shadow-indigo-900/5 rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-4 bg-gray-50 border-b border-gray-100">
                <h3 className="font-bold text-gray-900">Exam Categories</h3>
                <p className="text-xs text-gray-500">Select one to explore</p>
            </div>
            <div className="flex flex-col p-2 space-y-1">
                {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = selectedCategory === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-200 border-2 ${isSelected
                                ? 'bg-indigo-50 border-indigo-500 shadow-sm'
                                : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'
                                }`}
                        >
                            <div className={`p-3 rounded-full mb-2 ${isSelected ? 'bg-indigo-100' : cat.bg}`}>
                                <Icon className={`w-6 h-6 ${isSelected ? 'text-indigo-600' : cat.color}`} />
                            </div>
                            <span className={`text-sm font-semibold text-center ${isSelected ? 'text-indigo-700' : 'text-gray-600'}`}>
                                {cat.name}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
