import { LucideIcon } from 'lucide-react';

export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    targetExam?: string;
    language?: string;
    avatar?: string;
    streak?: number;
    xp?: number;
    level?: number;
    badges?: string[];
}

export interface Subject {
    _id: string;
    name: string;
    examId?: string;
}

export interface ContentItem {
    _id: string;
    title: string;
    type: 'video' | 'pdf';
    url: string;
    subjectId: Subject;
    topicName: string;
    isPremium: boolean;
    createdAt: string;
    thumbnail?: string;
}

export interface Question {
    _id: string;
    text: string;
    textHindi?: string;
    options: {
        id: string;
        text: string;
        textHindi?: string;
    }[];
    correctOption: string;
    explanation?: string;
    explanationHindi?: string;
    subjectId?: Subject | string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface Test {
    _id: string;
    title: string;
    type: string;
    duration: number;
    durationMinutes?: number;
    totalQuestions: number;
    questions: Question[] | string[];
    isPremium: boolean;
    category: string;
    positiveMark?: number;
    negativeMark?: number;
}

export interface NavItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
    active?: boolean;
}
