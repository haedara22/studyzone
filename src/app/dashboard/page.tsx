"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { motion } from "framer-motion";
import { AddTaskModal } from "@/components/dashboard/add-task-modal";
import { AddSubjectModal } from "@/components/dashboard/add-subject-modal";

// ===== أنواع البيانات =====
interface User {
  id: string;
  email: string;
  name: string;
  grade: string;
  stream: string;
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  progress: number;
  total_lessons: number;
  completed_lessons: number;
}

interface Task {
  id: string;
  title: string;
  subject_name: string;
  start_time: string;
  end_time: string;
  status: 'pending' | 'completed' | 'in_progress';
  completed: boolean;
}

interface Stats {
  total_subjects: number;
  completed_subjects: number;
  total_lessons: number;
  completed_lessons: number;
  study_hours_today: number;
  study_hours_goal: number;
  completion_rate: number;
  streak_days: number;
  days_until_exam: number;
  pending_reviews: number;
}

interface DashboardData {
  user: User;
  stats: Stats;
  subjects: Subject[];
  todayTasks: Task[];
}

interface ErrorResponse {
  error?: string;
}

// ===== المكون الرئيسي =====
export default function DashboardPage() {
  const router = useRouter();

  // ===== الحالات =====
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState<boolean>(false);
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState<boolean>(false);
  const [isStudyTimerActive, setIsStudyTimerActive] = useState<boolean>(false);
  const [studyTime, setStudyTime] = useState<number>(25 * 60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);

  // ===== جلب البيانات =====
  const fetchDashboardData = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/dashboard");

      if (res.status === 401) {
        router.push("/login");
        return;
      }

      if (!res.ok) {
        const errorData = (await res.json()) as ErrorResponse;
        throw new Error(errorData.error ?? "فشل في جلب البيانات");
      }

      const dashboardData = (await res.json()) as DashboardData;
      setData(dashboardData);
    } catch (error: unknown) {
      console.error("Error fetching dashboard:", error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("حدث خطأ غير متوقع أثناء تحميل البيانات");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  // ===== تحديث حالة المهمة =====
  const toggleTaskStatus = useCallback(
    async (taskId: string, completed: boolean): Promise<void> => {
      try {
        const res = await fetch("/api/tasks", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ task_id: taskId, completed: !completed }),
        });

        if (res.ok) {
          await fetchDashboardData();
        }
      } catch (error) {
        console.error("Error updating task:", error);
      }
    },
    [fetchDashboardData]
  );

  // ===== حذف مهمة =====
  const deleteTask = useCallback(
    async (taskId: string): Promise<void> => {
      if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;

      try {
        const res = await fetch(`/api/tasks?id=${taskId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          await fetchDashboardData();
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    },
    [fetchDashboardData]
  );

  // ===== مؤقت الدراسة =====
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isTimerActive && studyTime > 0) {
      interval = setInterval(() => {
        setStudyTime((prev) => prev - 1);
      }, 1000);
    } else if (studyTime === 0 && isTimerActive) {
      setIsTimerActive(false);
      alert("⏰ وقت الدراسة انتهى! خذ استراحة 5 دقائق");
      setStudyTime(5 * 60);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerActive, studyTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ===== حالة التحميل =====
  if (loading) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-secondary">جاري تحميل بياناتك...</p>
          </div>
        </div>
      </Container>
    );
  }

  // ===== حالة الخطأ =====
  if (error) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <p className="text-red-600">❌ {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 rounded-xl bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors"
              >
                إعادة المحاولة
              </button>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  // ===== لا توجد بيانات =====
  if (!data) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <p className="text-secondary">لا توجد بيانات لعرضها</p>
          </div>
        </div>
      </Container>
    );
  }

  const { user, stats, subjects, todayTasks } = data;

  // ===== العرض الرئيسي =====
  return (
    <Container>
      <div className="py-20">
        {/* قسم الترحيب */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-2xl bg-gradient-to-r from-primary to-accent p-6 md:p-8 text-white"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">مرحباً {user.name} 👋</h1>
              <p className="mt-1 text-sm md:text-base text-white/80">
                أنت على بعد {stats.days_until_exam} يوم من البكالوريا 🎯
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-xl bg-white/20 px-3 py-1.5 text-sm">
                <span>🔥</span>
                <span className="font-bold">{stats.streak_days}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* الأزرار السريعة */}
        <div className="mb-8 grid grid-cols-3 gap-3 md:grid-cols-6">
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            onClick={() => setIsAddTaskOpen(true)}
            className="rounded-xl bg-primary p-3 md:p-4 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-xl md:text-2xl">➕</div>
            <p className="mt-0.5 text-xs md:text-sm font-medium">مهمة</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            onClick={() => setIsAddSubjectOpen(true)}
            className="rounded-xl bg-purple-500 p-3 md:p-4 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-xl md:text-2xl">📚</div>
            <p className="mt-0.5 text-xs md:text-sm font-medium">مادة</p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => setIsStudyTimerActive(!isStudyTimerActive)}
            className={`rounded-xl p-3 md:p-4 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center ${
              isStudyTimerActive ? "bg-red-500" : "bg-green-500"
            }`}
          >
            <div className="text-xl md:text-2xl">⏱️</div>
            <p className="mt-0.5 text-xs md:text-sm font-medium">
              {isStudyTimerActive ? "إغلاق" : "مؤقت"}
            </p>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => router.push("/settings")}
            className="rounded-xl bg-orange-500 p-3 md:p-4 text-white shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-xl md:text-2xl">⚙️</div>
            <p className="mt-0.5 text-xs md:text-sm font-medium">إعدادات</p>
          </motion.button>

          {/* ✅ زر OCR الجديد */}
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
            onClick={() => router.push("/ocr-tools")}
            className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 
                       p-3 md:p-4 text-white shadow-lg hover:shadow-xl 
                       transition-all hover:-translate-y-1 text-center"
          >
            <div className="text-xl md:text-2xl">🧠</div>
            <p className="mt-0.5 text-xs md:text-sm font-medium">OCR</p>
          </motion.button>
        </div>

        {/* مؤقت الدراسة */}
        {isStudyTimerActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-8 rounded-2xl bg-white p-4 md:p-6 shadow-lg text-center border border-gray-200"
          >
            <h3 className="text-base md:text-lg font-bold">⏱️ مؤقت الدراسة</h3>
            <div className="my-3 md:my-4 text-4xl md:text-6xl font-bold text-primary">
              {formatTime(studyTime)}
            </div>
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              <button
                onClick={() => setIsTimerActive(!isTimerActive)}
                className="rounded-xl bg-primary px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base text-white hover:bg-primary-dark transition-colors"
              >
                {isTimerActive ? "⏸️ إيقاف" : "▶️ بدء"}
              </button>
              <button
                onClick={() => {
                  setIsTimerActive(false);
                  setStudyTime(25 * 60);
                }}
                className="rounded-xl border border-gray-200 px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base hover:bg-gray-50 transition-colors"
              >
                🔄 25د
              </button>
              <button
                onClick={() => {
                  setIsTimerActive(false);
                  setStudyTime(5 * 60);
                }}
                className="rounded-xl border border-gray-200 px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-base hover:bg-gray-50 transition-colors"
              >
                ☕ 5د
              </button>
            </div>
          </motion.div>
        )}

        {/* الإحصائيات السريعة */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-secondary">📚 المواد</p>
            <p className="text-xl md:text-2xl font-bold">{stats.total_subjects}</p>
            <p className="text-xs text-secondary">{stats.completed_subjects} مكتملة</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-secondary">⏱️ ساعات</p>
            <p className="text-xl md:text-2xl font-bold">{stats.study_hours_today}</p>
            <p className="text-xs text-secondary">من {stats.study_hours_goal}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-secondary">🎯 الإنجاز</p>
            <p className="text-xl md:text-2xl font-bold">{stats.completion_rate}%</p>
            <div className="mt-1 h-1.5 rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{ width: `${stats.completion_rate}%` }}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-secondary">🧠 المراجعة</p>
            <p className="text-xl md:text-2xl font-bold">{stats.pending_reviews}</p>
            <p className="text-xs text-secondary">دروس</p>
          </motion.div>
        </div>

        {/* الشبكة الرئيسية */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* مهام اليوم */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold">📋 خطة اليوم</h2>
                <button
                  onClick={() => setIsAddTaskOpen(true)}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  + إضافة
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                  <p className="text-secondary text-sm">لا توجد مهام</p>
                  <button
                    onClick={() => setIsAddTaskOpen(true)}
                    className="mt-2 text-sm text-primary hover:underline transition-colors"
                  >
                    + أضف مهمة
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task, index) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                        task.status === "completed"
                          ? "border-green-200 bg-green-50/50"
                          : "border-gray-100 hover:border-primary/20"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={task.status === "completed"}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                        onChange={() => toggleTaskStatus(task.id, task.completed)}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            task.status === "completed" ? "text-gray-500 line-through" : ""
                          }`}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs text-secondary truncate">
                          {task.subject_name} • 🕐 {task.start_time} - {task.end_time}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs ${
                            task.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {task.status === "completed" ? "✓" : "⏱️"}
                        </span>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="rounded-full p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="حذف المهمة"
                        >
                          ✕
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* تقدم المواد */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg md:text-xl font-bold">📊 المواد</h2>
                <button
                  onClick={() => setIsAddSubjectOpen(true)}
                  className="text-sm text-primary hover:underline transition-colors"
                >
                  + إضافة
                </button>
              </div>

              {subjects.length === 0 ? (
                <div className="rounded-xl border-2 border-dashed border-gray-200 p-6 text-center">
                  <p className="text-secondary text-sm">لم تضف أي مادة</p>
                  <button
                    onClick={() => setIsAddSubjectOpen(true)}
                    className="mt-2 text-sm text-primary hover:underline transition-colors"
                  >
                    + أضف مادة
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {subjects.map((subject, index) => (
                    <motion.div
                      key={subject.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="group cursor-pointer rounded-xl p-2 transition-all hover:bg-gray-50"
                      onClick={() => router.push(`/subjects/${subject.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{subject.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium truncate">{subject.name}</span>
                            <span className="text-secondary">{subject.progress}%</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-gray-200">
                            <div
                              className={`h-full rounded-full ${subject.color} transition-all duration-1000`}
                              style={{ width: `${subject.progress}%` }}
                            />
                          </div>
                          <p className="mt-0.5 text-xs text-secondary">
                            {subject.completed_lessons}/{subject.total_lessons}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* النوافذ المنبثقة */}
      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onTaskAdded={fetchDashboardData}
      />

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onSubjectAdded={fetchDashboardData}
      />
    </Container>
  );
}