"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/layout/container";
import { motion } from "framer-motion";
import { 
  getToday, 
  getWeekRange, 
  getWeekDays, 
  formatDate, 
  formatTime,
  calculateWeeklyStats 
} from "@/lib/planner/utils";
import { AddTaskModal } from "@/components/planner/add-task-modal";

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Task {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

interface PlannerData {
  subjects: Subject[];
  tasks: Task[];
}

interface PlannerResponse {
  subjects: Subject[];
  tasks: Task[];
}

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<PlannerData | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const weekDays = getWeekDays();
  const weekRange = getWeekRange();

  const fetchPlannerData = useCallback(async (): Promise<void> => {
    try {
      console.log("🔄 جلب بيانات المخطط...");
      const res = await fetch("/api/planner");
      
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`فشل في جلب البيانات: ${errorText}`);
      }
      
      const data: PlannerResponse = await res.json();
      console.log("📊 البيانات المستلمة:", {
        subjects: data.subjects?.length || 0,
        tasks: data.tasks?.length || 0,
        sampleTask: data.tasks?.[0]
      });
      
      setData(data);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      console.error("❌ خطأ في جلب البيانات:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void fetchPlannerData();
  }, [fetchPlannerData]);

  const handleTaskUpdate = useCallback(async (taskId: string, status: string): Promise<void> => {
    try {
      const res = await fetch(`/api/planner/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchPlannerData();
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  }, [fetchPlannerData]);

  const handleTaskDelete = useCallback(async (taskId: string): Promise<void> => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    try {
      const res = await fetch(`/api/planner/${taskId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        await fetchPlannerData();
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  }, [fetchPlannerData]);

  const getTasksForDate = useCallback((date: string): Task[] => {
    if (!data) return [];
    return data.tasks.filter((t: Task) => {
      if (!t.date) return false;
      let taskDate = t.date;
      if (typeof taskDate === 'string' && taskDate.includes('T')) {
        taskDate = taskDate.split('T')[0];
      } else if (typeof taskDate === 'string' && taskDate.includes('-')) {
        taskDate = taskDate.substring(0, 10);
      }
      return taskDate === date;
    });
  }, [data]);

  const getDayStats = useCallback((date: string) => {
    const tasks = getTasksForDate(date);
    const total = tasks.length;
    const completed = tasks.filter((t: Task) => t.status === 'completed').length;
    return { total, completed, rate: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [getTasksForDate]);

  const changeDate = useCallback((days: number): void => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(date.toISOString().split('T')[0]);
  }, [selectedDate]);

  // ✅ تنسيق المدة
  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`;
    }
    return `${minutes} دقيقة`;
  };

  // ✅ الانتقال لصفحة التفاصيل
  const goToTaskDetails = (taskId: string) => {
    router.push(`/planner/${taskId}`);
  };

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-secondary">جاري تحميل المخطط...</p>
          </div>
        </div>
      </Container>
    );
  }

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

  const todayTasks = getTasksForDate(selectedDate);
  const todayStats = getDayStats(selectedDate);
  
  const tasksForStats = data?.tasks.map((task) => ({
    ...task,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) || [];
  
  const weekStats = data && data.tasks.length > 0 ? calculateWeeklyStats(tasksForStats as any, weekRange.start) : null;

  const hasSubjects = data?.subjects && data.subjects.length > 0;

  return (
    <Container>
      <div className="py-20">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">📅 المخطط الدراسي</h1>
            <p className="mt-1 text-secondary">نظم وقتك وخطط ليومك</p>
          </div>
          <button
            onClick={() => setShowAddTask(true)}
            className="rounded-xl bg-primary px-6 py-3 text-white hover:bg-primary-dark transition-colors shadow-lg"
          >
            ➕ إضافة مهمة
          </button>
        </div>

        {/* إحصائيات الأسبوع */}
        {weekStats ? (
          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-secondary">📋 المهام</p>
              <p className="text-2xl font-bold">{weekStats.totalTasks}</p>
              <p className="text-xs text-secondary">{weekStats.completedTasks} مكتملة</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-secondary">⏱️ ساعات</p>
              <p className="text-2xl font-bold">{weekStats.totalHours}</p>
              <p className="text-xs text-secondary">هذا الأسبوع</p>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-secondary">🎯 الإنجاز</p>
              <p className="text-2xl font-bold">{weekStats.completionRate}%</p>
              <div className="mt-1 h-1.5 rounded-full bg-gray-200">
                <div className="h-full rounded-full bg-primary transition-all duration-1000" style={{ width: `${weekStats.completionRate}%` }} />
              </div>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-center">
              <p className="text-sm text-secondary">🔥 السلسلة</p>
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-secondary">أيام متواصلة</p>
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-secondary">
            لا توجد مهام هذا الأسبوع
          </div>
        )}

        {/* أيام الأسبوع */}
        <div className="mt-6 grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const date = new Date(weekRange.start);
            date.setDate(date.getDate() + index);
            const dateStr = date.toISOString().split('T')[0];
            const isToday = dateStr === getToday();
            const stats = getDayStats(dateStr);
            const isActive = dateStr === selectedDate;

            return (
              <motion.button
                key={day}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedDate(dateStr)}
                className={`rounded-xl p-3 text-center transition-all ${
                  isActive
                    ? 'bg-primary text-white shadow-lg'
                    : isToday
                    ? 'border-2 border-primary bg-white'
                    : 'border border-gray-200 bg-white hover:border-primary/30'
                }`}
              >
                <p className={`text-xs font-medium ${isActive ? 'text-white/80' : 'text-secondary'}`}>
                  {day}
                </p>
                <p className={`text-lg font-bold ${isActive ? 'text-white' : 'text-foreground'}`}>
                  {date.getDate()}
                </p>
                {stats.total > 0 && (
                  <p className={`text-xs ${isActive ? 'text-white/70' : 'text-secondary'}`}>
                    {stats.completed}/{stats.total}
                  </p>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* مهام اليوم المحدد */}
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 rounded-2xl border border-gray-200 bg-white p-4 md:p-6 shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg md:text-xl font-bold">
              📋 {formatDate(selectedDate)}
            </h2>
            <div className="flex items-center gap-3">
              <span className="text-xs md:text-sm text-secondary">
                {todayStats.completed}/{todayStats.total} مكتملة ({todayStats.rate}%)
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => changeDate(-1)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs md:text-sm hover:bg-gray-50 transition-colors"
                >
                  ←
                </button>
                <button
                  onClick={() => changeDate(1)}
                  className="rounded-lg border border-gray-200 px-2 py-1 text-xs md:text-sm hover:bg-gray-50 transition-colors"
                >
                  →
                </button>
              </div>
            </div>
          </div>

          {todayTasks.length === 0 ? (
            <div className="mt-4 rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
              <p className="text-secondary">لا توجد مهام في هذا اليوم</p>
              <button 
                onClick={() => setShowAddTask(true)}
                className="mt-2 text-sm text-primary hover:underline transition-colors"
              >
                + أضف مهمة
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {todayTasks.map((task, index) => (
                <motion.div
                  key={task.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex flex-col md:flex-row md:items-center gap-3 rounded-xl border p-4 transition-all cursor-pointer hover:shadow-md ${
                    task.status === 'completed'
                      ? 'border-green-200 bg-green-50/50'
                      : 'border-gray-100 hover:border-primary/20'
                  }`}
                  onClick={() => goToTaskDetails(task.id)}
                >
                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <input
                      type="checkbox"
                      checked={task.status === 'completed'}
                      className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer flex-shrink-0"
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => {
                        const newStatus = task.status === 'completed' ? 'pending' : 'completed';
                        void handleTaskUpdate(task.id, newStatus);
                      }}
                    />
                    <span className="text-xl flex-shrink-0">{task.subjectIcon}</span>
                  </div>
                  
                  <div className="flex-1 min-w-0 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className={`font-medium truncate ${task.status === 'completed' ? 'text-gray-500 line-through' : ''}`}>
                        {task.title}
                      </p>
                      {task.priority === 'high' && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 flex-shrink-0">عاجل</span>
                      )}
                    </div>
                    
                    {/* ✅ معلومات الوقت التفصيلية */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm text-secondary mt-1">
                      <span className="flex items-center gap-1">
                        <span>🕐</span>
                        <span>{formatTime(task.startTime)} - {formatTime(task.endTime)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        <span className="font-medium text-primary">{formatDuration(task.duration)}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <span>📖</span>
                        <span className="truncate max-w-[100px]">{task.subjectName}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 flex-shrink-0 self-end md:self-center">
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      task.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {task.status === 'completed' ? '✓ مكتمل' : '⏱️ معلق'}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void handleTaskDelete(task.id);
                      }}
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
        </motion.div>

        {!hasSubjects && (
          <div className="mt-4 rounded-xl bg-yellow-50 p-4 text-center text-yellow-800">
            ⚠️ لا توجد مواد مضافة. يرجى إضافة مواد من صفحة المواد أولاً.
          </div>
        )}
      </div>

      <AddTaskModal
        isOpen={showAddTask}
        onClose={() => setShowAddTask(false)}
        onTaskAdded={() => {
          console.log("🔄 تحديث البيانات بعد إضافة مهمة");
          void fetchPlannerData();
        }}
        subjects={data?.subjects || []}
        selectedDate={selectedDate}
      />
    </Container>
  );
}