import Database from 'better-sqlite3';
import path from 'path';

// مسار قاعدة البيانات
const dbPath = path.join(process.cwd(), 'study-bac.db');

// إنشاء اتصال بقاعدة البيانات
const db = new Database(dbPath);

// تمكين المفاتيح الخارجية
db.pragma('foreign_keys = ON');

// إنشاء الجداول إذا لم تكن موجودة
db.exec(`
  -- جدول المستخدمين
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    grade TEXT,
    stream TEXT,
    phone TEXT,
    avatar_url TEXT,
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- جدول المواد
  CREATE TABLE IF NOT EXISTS user_subjects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    icon TEXT DEFAULT '📚',
    color TEXT DEFAULT 'bg-blue-500',
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- جدول المهام
  CREATE TABLE IF NOT EXISTS planner_tasks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    subject_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    duration INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES user_subjects(id) ON DELETE CASCADE
  );

  -- جدول الجلسات
  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  -- فهارس للبحث السريع
  CREATE INDEX IF NOT EXISTS idx_user_subjects_user_id ON user_subjects(user_id);
  CREATE INDEX IF NOT EXISTS idx_planner_tasks_user_id ON planner_tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_planner_tasks_date ON planner_tasks(date);
  CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
`);

console.log('✅ قاعدة البيانات جاهزة:', dbPath);

// دوال مساعدة
export const getDb = () => db;

// توليد معرف فريد
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// دالة لإغلاق قاعدة البيانات
export const closeDb = () => {
  db.close();
  console.log('🔒 تم إغلاق قاعدة البيانات');
};

export default db;