export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    phone?: string;
    avatar_url?: string;
    grade: string;
    stream: string;
    school?: string;
    city?: string;
    settings: UserSettings;
    stats: UserStats;
    status: 'active' | 'suspended' | 'inactive';
    email_verified: boolean;
    email_verified_at?: Date;
    created_at: Date;
    updated_at: Date;
    last_login_at?: Date;
    deleted_at?: Date;
}

export interface UserSettings {
    theme: 'light' | 'dark';
    language: 'ar' | 'en' | 'fr';
    notifications: boolean;
    study_reminder: boolean;
    daily_goal_hours: number;
    weekly_goal_hours: number;
}

export interface UserStats {
    total_study_hours: number;
    daily_study_hours: number;
    weekly_study_hours: number;
    monthly_study_hours: number;
    streak_days: number;
    last_study_date?: Date;
    subjects_completed: number;
    average_score: number;
}

export interface Session {
    id: string;
    user_id: string;
    token: string;
    user_agent?: string;
    ip_address?: string;
    expires_at: Date;
    created_at: Date;
    last_activity: Date;
}

export interface Notification {
    id: string;
    user_id: string;
    type: 'study_reminder' | 'review_reminder' | 'achievement' | 'system';
    title: string;
    message: string;
    link?: string;
    is_read: boolean;
    created_at: Date;
    read_at?: Date;
}

export interface UserSubject {
    id: string;
    user_id: string;
    name: string;
    icon?: string;
    color?: string;
    order_index: number;
    created_at: Date;
    updated_at: Date;
}

export interface UserLesson {
    id: string;
    user_id: string;
    subject_id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'completed' | 'reviewing';
    priority: number;
    estimated_hours?: number;
    completed_at?: Date;
    created_at: Date;
    updated_at: Date;
    due_date?: Date;
    review_date?: Date;
    review_count: number;
    last_review_at?: Date;
}

export interface DailyPlan {
    id: string;
    user_id: string;
    date: Date;
    total_hours: number;
    completed: boolean;
    notes?: string;
    created_at: Date;
    updated_at: Date;
}

export interface PlanTask {
    id: string;
    daily_plan_id: string;
    lesson_id: string;
    start_time?: string;
    end_time?: string;
    duration?: number;
    completed: boolean;
    order_index: number;
}

export interface UserProgress {
    id: string;
    user_id: string;
    subject_id: string;
    progress_percentage: number;
    total_lessons: number;
    completed_lessons: number;
    current_streak: number;
    last_study_date?: Date;
    created_at: Date;
    updated_at: Date;
}

export interface Achievement {
    id: string;
    user_id: string;
    type: string;
    name: string;
    description?: string;
    icon?: string;
    achieved_at: Date;
}