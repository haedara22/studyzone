import { neon } from '@neondatabase/serverless';
import { User, UserSettings, UserStats } from '@/types/database';
import bcrypt from 'bcryptjs';

const sql = neon(process.env.DATABASE_URL!);

export const userHelpers = {
    // إنشاء مستخدم جديد
    async createUser(data: {
        email: string;
        password: string;
        name: string;
        grade: string;
        stream: string;
        phone?: string;
        school?: string;
        city?: string;
    }): Promise<User> {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        
        const [user] = await sql`
            INSERT INTO users (
                email, password_hash, name, grade, stream,
                phone, school, city
            ) VALUES (
                ${data.email}, ${hashedPassword}, ${data.name},
                ${data.grade}, ${data.stream}, ${data.phone},
                ${data.school}, ${data.city}
            )
            RETURNING *
        `;
        
        return user as User;
    },

    // الحصول على مستخدم بواسطة البريد
    async getUserByEmail(email: string): Promise<User | null> {
        const [user] = await sql`
            SELECT * FROM users WHERE email = ${email} AND deleted_at IS NULL
        `;
        return user as User | null;
    },

    // الحصول على مستخدم بواسطة ID
    async getUserById(id: string): Promise<User | null> {
        const [user] = await sql`
            SELECT * FROM users WHERE id = ${id} AND deleted_at IS NULL
        `;
        return user as User | null;
    },

    // تحديث إعدادات المستخدم
    async updateSettings(userId: string, settings: Partial<UserSettings>): Promise<User> {
        const [user] = await sql`
            UPDATE users
            SET settings = settings || ${settings}::jsonb
            WHERE id = ${userId}
            RETURNING *
        `;
        return user as User;
    },

    // تحديث إحصائيات المستخدم
    async updateStats(userId: string, stats: Partial<UserStats>): Promise<User> {
        const [user] = await sql`
            UPDATE users
            SET stats = stats || ${stats}::jsonb
            WHERE id = ${userId}
            RETURNING *
        `;
        return user as User;
    },

    // تحديث آخر تسجيل دخول
    async updateLastLogin(userId: string): Promise<void> {
        await sql`
            UPDATE users
            SET last_login_at = CURRENT_TIMESTAMP
            WHERE id = ${userId}
        `;
    },

    // حذف مستخدم (ناعم)
    async softDeleteUser(userId: string): Promise<void> {
        await sql`
            UPDATE users
            SET deleted_at = CURRENT_TIMESTAMP,
                status = 'inactive'
            WHERE id = ${userId}
        `;
    },

    // الحصول على مواد المستخدم
    async getUserSubjects(userId: string) {
        return await sql`
            SELECT * FROM user_subjects
            WHERE user_id = ${userId}
            ORDER BY order_index ASC
        `;
    },

    // الحصول على دروس المستخدم
    async getUserLessons(userId: string, status?: string) {
        let query = sql`
            SELECT * FROM user_lessons
            WHERE user_id = ${userId}
        `;
        
        if (status) {
            query = sql`
                SELECT * FROM user_lessons
                WHERE user_id = ${userId} AND status = ${status}
            `;
        }
        
        return await query;
    },

    // الحصول على خطة اليوم
    async getDailyPlan(userId: string, date: Date) {
        const [plan] = await sql`
            SELECT * FROM daily_plans
            WHERE user_id = ${userId} AND date = ${date.toISOString().split('T')[0]}
        `;
        return plan || null;
    },

    // الحصول على تقدم المستخدم
    async getUserProgress(userId: string) {
        return await sql`
            SELECT * FROM user_progress
            WHERE user_id = ${userId}
        `;
    },

    // الحصول على إنجازات المستخدم
    async getUserAchievements(userId: string) {
        return await sql`
            SELECT * FROM achievements
            WHERE user_id = ${userId}
            ORDER BY achieved_at DESC
        `;
    }
};