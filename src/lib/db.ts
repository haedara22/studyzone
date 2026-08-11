// ⚠️ DEPRECATED: This file is no longer used
// The project now uses Neon PostgreSQL (@neondatabase/serverless)
// All database operations are done via API routes using Neon

// Keeping this file for reference only - not imported anywhere

/*
import Database from 'better-sqlite3';
import path from 'path';

// مسار قاعدة البيانات
const dbPath = path.join(process.cwd(), 'study-bac.db');

// إنشاء اتصال بقاعدة البيانات
const db = new Database(dbPath);
*/

const db = null as any;

// Deprecated - Neon PostgreSQL is used instead
export const getDb = () => {
  throw new Error('SQLite is deprecated. Use Neon PostgreSQL via @neondatabase/serverless');
};

// توليد معرف فريد
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// دالة لإغلاق قاعدة البيانات
export const closeDb = () => {
  console.log('🔒 SQLite deprecated - no action needed');
};

export default null as any;