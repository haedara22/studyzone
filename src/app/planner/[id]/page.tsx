"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Container } from "@/components/layout/container";
import { motion } from "framer-motion";
import Link from "next/link";

interface TaskDetail {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  subjectName: string;
  subjectIcon: string;
  subjectColor: string;
}

// ✅ تعريف نوع الرد من API
interface TaskDetailResponse {
  task: TaskDetail;
}

export default function TaskDetailPage() {
  const router = useRouter();
  const params = useParams();
  const taskId = params.id as string;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ جلب تفاصيل المهمة
  const fetchTaskDetail = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/planner/${taskId}`);
      
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      
      if (!res.ok) {
        throw new Error("فشل في جلب تفاصيل المهمة");
      }
      
      // ✅ ✅ ✅ التصحيح: تحديد نوع البيانات
      const data = await res.json() as TaskDetailResponse;
      setTask(data.task);
    } catch (error) {
      console.error("Error fetching task detail:", error);
      setError("حدث خطأ في تحميل تفاصيل المهمة");
    } finally {
      setLoading(false);
    }
  }, [taskId, router]);

  useEffect(() => {
    if (taskId) {
      fetchTaskDetail();
    }
  }, [taskId, fetchTaskDetail]);

  // ✅ تنسيق المدة
  const formatDuration = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`;
    }
    return `${minutes} دقيقة`;
  };

  // ✅ تنسيق التاريخ
  const formatDate = (date: string): string => {
    const d = new Date(date + 'T00:00:00');
    return d.toLocaleDateString('ar', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // ✅ تحديث حالة المهمة
  const updateTaskStatus = async (status: string) => {
    try {
      const res = await fetch(`/api/planner/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      
      if (res.ok) {
        setTask(prev => prev ? { ...prev, status: status as any } : null);
      }
    } catch (error) {
      console.error("Error updating task:", error);
    }
  };

  // ✅ حذف المهمة
  const deleteTask = async () => {
    if (!confirm("هل أنت متأكد من حذف هذه المهمة؟")) return;
    
    try {
      const res = await fetch(`/api/planner/${taskId}`, {
        method: "DELETE",
      });
      
      if (res.ok) {
        router.push("/planner");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  if (loading) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="mt-4 text-secondary">جاري تحميل تفاصيل المهمة...</p>
          </div>
        </div>
      </Container>
    );
  }

  if (error || !task) {
    return (
      <Container>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
              <p className="text-red-600">❌ {error || "المهمة غير موجودة"}</p>
              <Link href="/planner">
                <button className="mt-4 rounded-xl bg-primary px-6 py-2 text-white hover:bg-primary-dark transition-colors">
                  العودة للمخطط
                </button>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    in_progress: 'bg-blue-100 text-blue-800 border-blue-300',
    completed: 'bg-green-100 text-green-800 border-green-300'
  };

  const statusLabels = {
    pending: '⏱️ معلق',
    in_progress: '🔄 قيد التنفيذ',
    completed: '✅ مكتمل'
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-red-100 text-red-800'
  };

  const priorityLabels = {
    low: '🟢 منخفضة',
    medium: '🟡 متوسطة',
    high: '🔴 عالية'
  };

  return (
    <Container>
      <div className="py-20 max-w-3xl mx-auto">
        {/* زر العودة */}
        <Link href="/planner">
          <button className="mb-6 flex items-center gap-2 text-secondary hover:text-primary transition-colors">
            <span>←</span> العودة للمخطط
          </button>
        </Link>

        {/* بطاقة المهمة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8 shadow-lg"
        >
          {/* الرأس */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{task.subjectIcon}</span>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{task.title}</h1>
                <p className="text-secondary">{task.subjectName}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-sm font-medium ${statusColors[task.status]}`}>
                {statusLabels[task.status]}
              </span>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColors[task.priority]}`}>
                {priorityLabels[task.priority]}
              </span>
            </div>
          </div>

          {/* خط فاصل */}
          <hr className="my-6 border-gray-200" />

          {/* المعلومات التفصيلية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* التاريخ */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-secondary">📅 التاريخ</p>
              <p className="text-lg font-medium">{formatDate(task.date)}</p>
            </div>

            {/* الوقت */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-secondary">⏰ الوقت</p>
              <p className="text-lg font-medium">
                {task.startTime} - {task.endTime}
              </p>
            </div>

            {/* المدة */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-secondary">⏱️ المدة</p>
              <p className="text-lg font-medium text-primary">{formatDuration(task.duration)}</p>
            </div>

            {/* الحالة */}
            <div className="rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-secondary">📊 الحالة</p>
              <div className="mt-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => updateTaskStatus('pending')}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    task.status === 'pending' 
                      ? 'bg-yellow-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ⏱️ معلق
                </button>
                <button
                  onClick={() => updateTaskStatus('in_progress')}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    task.status === 'in_progress' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  🔄 قيد التنفيذ
                </button>
                <button
                  onClick={() => updateTaskStatus('completed')}
                  className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                    task.status === 'completed' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  ✅ مكتمل
                </button>
              </div>
            </div>
          </div>

          {/* الوصف */}
          {task.description && (
            <div className="mt-6 rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-secondary">📝 الوصف</p>
              <p className="mt-1 text-gray-700 whitespace-pre-wrap">{task.description}</p>
            </div>
          )}

          {/* أزرار الإجراءات */}
          <div className="mt-8 flex flex-wrap gap-3 border-t border-gray-200 pt-6">
            <Link href={`/planner/${taskId}/edit`}>
              <button className="rounded-xl bg-blue-500 px-6 py-2.5 text-white hover:bg-blue-600 transition-colors">
                ✏️ تعديل
              </button>
            </Link>
            <button
              onClick={deleteTask}
              className="rounded-xl bg-red-500 px-6 py-2.5 text-white hover:bg-red-600 transition-colors"
            >
              🗑️ حذف
            </button>
            <Link href="/planner">
              <button className="rounded-xl border border-gray-300 px-6 py-2.5 hover:bg-gray-50 transition-colors">
                📋 العودة للمخطط
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </Container>
  );
}