// ============================================================
//  دوال التوقيت الموحدة - بتوقيت سوريا (+3)
// ============================================================

const TIMEZONE = 'Asia/Damascus'; // ✅ توقيت سوريا

// ===== الحصول على التاريخ الحالي بتوقيت سوريا =====
export const getToday = (): string => {
  const now = new Date();
  // تحويل إلى توقيت سوريا
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
};

// ===== الحصول على الوقت الحالي بتوقيت سوريا =====
export const getCurrentTime = (): string => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone: TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return formatter.format(now);
};

// ===== تحويل تاريخ إلى توقيت سوريا =====
export const toSyrianDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(d);
};

// ===== تحويل وقت إلى توقيت سوريا =====
export const toSyrianTime = (time: string): string => {
  // إذا كان الوقت بصيغة HH:mm
  if (time.includes(':')) return time;
  return time;
};

// ===== الحصول على نطاق الأسبوع بتوقيت سوريا =====
export const getWeekRange = () => {
  const today = new Date();
  const syrianDate = new Date(today.toLocaleString('en-US', { timeZone: TIMEZONE }));
  
  // اليوم الأول من الأسبوع (الأحد)
  const start = new Date(syrianDate);
  start.setDate(syrianDate.getDate() - syrianDate.getDay());
  start.setHours(0, 0, 0, 0);
  
  // اليوم الأخير من الأسبوع (السبت)
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
};

// ===== الحصول على أيام الأسبوع =====
export const getWeekDays = (): string[] => {
  return ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
};

// ===== تنسيق التاريخ =====
export const formatDate = (date: string): string => {
  const d = new Date(date + 'T00:00:00');
  const formatter = new Intl.DateTimeFormat('ar', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(d);
};

// ===== تنسيق الوقت =====
export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};

// ===== حساب إحصائيات الأسبوع =====
export const calculateWeeklyStats = (tasks: any[], startDate: string) => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'completed').length;
  const totalMinutes = tasks.reduce((sum: number, t: any) => sum + (t.duration || 0), 0);
  
  return {
    totalTasks,
    completedTasks,
    totalHours: (totalMinutes / 60).toFixed(1),
    completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
  };
};