import { LucideIcon } from 'lucide-react';

// ============ USER & AUTH ============
export interface User {
    _id: string;
    name: string;
    email: string;
    role: 'student' | 'admin';
    phone?: string;
    targetExam?: string;
    language?: 'en' | 'hi';
    avatar?: string;
    streak?: number;
    lastActiveDate?: string;
    xp?: number;
    level?: number;
    badges?: string[];
    selectedExam?: string | { _id: string; name: string; slug: string };
    createdAt?: string;
    isDeleted?: boolean;
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    signup: (data: SignupData) => Promise<void>;
    logout: () => void;
    checkAuth: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    uploadProfileImage: (formData: FormData) => Promise<void>;
}

export interface SignupData {
    name: string;
    email: string;
    password: string;
    phone?: string;
    targetExam?: string;
    language?: 'en' | 'hi';
}

// ============ SUBJECTS ============
export interface Subject {
    _id: string;
    name: string;
    examId?: string;
    icon?: string;
}

// ============ CONTENT ============
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

// ============ QUESTIONS ============
export interface QuestionOption {
    id: string;     // "A", "B", "C", "D"
    text: string;
    textHindi?: string;
}

export interface Question {
    _id: string;
    text: string;
    textHindi?: string;
    options: QuestionOption[];
    correctOption: string;
    explanation?: string;
    explanationHindi?: string;
    subjectId?: Subject | string;
    topic?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    year?: number;
    source?: string;
    tags?: string[];
    createdAt?: string;
}

// ============ TESTS ============
export interface Test {
    _id: string;
    title: string;
    type: 'exam' | 'quiz';
    duration: number;
    durationMinutes?: number;
    totalQuestions: number;
    questionsCount?: number;
    questions: Question[] | string[];
    isPremium: boolean;
    category: string;
    positiveMark?: number;
    negativeMark?: number;
    examId?: { _id: string; name: string; slug: string };
    sections?: TestSection[];
    createdAt?: string;
}

export interface TestSection {
    name: string;
    questions: Question[];
}

// ============ TEST RESULTS ============
export interface TestResponse {
    questionId: string;
    selectedOption: string;
    isCorrect?: boolean;
    timeTakenSeconds: number;
}

export interface TestResult {
    _id: string;
    studentId: string | User;
    testId: string | Test;
    score: number;
    maxScore: number;
    correct: number;
    incorrect: number;
    unattempted: number;
    accuracy: number;
    responses: TestResponse[];
    completionTimeMinutes?: number;
    tabSwitchWarnings?: number;
    isAutoSubmitted?: boolean;
    // Gamification
    xpEarned?: number;
    streakBonus?: number;
    badgesEarned?: string[];
    rank?: number;
    createdAt: string;
}

// ============ ANALYTICS ============
export interface StudentStats {
    totalTests: number;
    averageScore: number;
    averageAccuracy: number;
    bestScore: number;
    totalQuestionsAttempted: number;
    correctAnswers: number;
    incorrectAnswers: number;
    subjectPerformance: SubjectPerformance[];
    recentTrend: TrendDataPoint[];
    weakAreas: WeakArea[];
}

export interface SubjectPerformance {
    subjectId: string;
    subjectName: string;
    accuracy: number;
    totalQuestions: number;
    correctAnswers: number;
}

export interface TrendDataPoint {
    date: string;
    score: number;
    accuracy: number;
}

export interface WeakArea {
    subject: string;
    topic?: string;
    accuracy: number;
    totalAttempted: number;
}

// ============ ADMIN ANALYTICS ============
export interface AdminDashboardStats {
    totalUsers: number;
    totalTests: number;
    totalQuestions: number;
    totalAttempts: number;
    activeUsers: number;
    averagePlatformAccuracy: number;
    userGrowth: { date: string; count: number }[];
    topPerformers: { name: string; score: number; avatar?: string }[];
}

// ============ NOTIFICATIONS ============
export interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'alert';
    isRead: boolean;
    userId?: string;
    createdAt: string;
}

// ============ BATTLE MODE ============
export interface BattlePlayer {
    id: string;        // socket id
    odii: string;      // user _id
    name: string;
    score: number;
    avatar?: string;
}

export interface BattleQuestion {
    _id: string;
    text: string;
    textHindi?: string;
    options: { id: string; text: string; textHindi?: string }[];
    // correctOption is NEVER sent from server
}

export interface BattleAnswerResult {
    questionId: string;
    isCorrect: boolean;
    correctOption: string;
    pointsEarned: number;
}

// ============ GAMIFICATION ============
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earnedAt?: string;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatar?: string;
    score: number;
    accuracy?: number;
}

// ============ BOOKMARKS ============
export interface Bookmark {
    _id: string;
    userId: string;
    questionId: string | Question;
    note?: string;
    createdAt: string;
}

// ============ PRACTICE MODE ============
export interface TopicInfo {
    topic: string;
    count: number;
    difficulties: ('easy' | 'medium' | 'hard')[];
}

export interface PYQFilters {
    year?: number;
    source?: string;
    subjectId?: string;
}

export interface PracticeFilters {
    subjectId?: string;
    topic?: string;
    difficulty?: 'easy' | 'medium' | 'hard' | 'all';
}

// ============ UI COMPONENTS ============
export interface NavItemProps {
    icon: LucideIcon;
    label: string;
    href: string;
    active?: boolean;
}

export interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    action?: {
        label: string;
        href: string;
    };
}

// ============ API RESPONSES ============
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    totalPages: number;
}

export interface ApiError {
    message: string;
    status?: number;
}
