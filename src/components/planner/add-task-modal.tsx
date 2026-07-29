"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
  subjects: Subject[];
  selectedDate: string;
}

// تعريف نوع الرد من API
interface TaskResponse {
  success?: boolean;
  error?: string;
  message?: string;
  task?: any;
}

export const AddTaskModal = ({
  isOpen,
  onClose,
  onTaskAdded,
  subjects,
  selectedDate,
}: AddTaskModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subjectId: subjects[0]?.id || "",
    title: "",
    description: "",
    date: selectedDate,
    startTime: "09:00",
    endTime: "10:30",
    priority: "medium" as "low" | "medium" | "high",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/planner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onTaskAdded();
        onClose();
        setFormData({
          subjectId: subjects[0]?.id || "",
          title: "",
          description: "",
          date: selectedDate,
          startTime: "09:00",
          endTime: "10:30",
          priority: "medium",
        });
      } else {
        const errorData: TaskResponse = await res.json();
        alert(errorData.error || "حدث خطأ");
      }
    } catch (error: unknown) {
      console.error("Error adding task:", error);
      const errorMessage = error instanceof Error ? error.message : "حدث خطأ في إضافة المهمة";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">➕ إضافة مهمة جديدة</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 hover:bg-gray-100 transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary">
                    المادة *
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.subjectId}
                    onChange={(e) =>
                      setFormData({ ...formData, subjectId: e.target.value })
                    }
                  >
                    {subjects.length === 0 ? (
                      <option value="">لا توجد مواد - أضف مادة أولاً</option>
                    ) : (
                      subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.icon} {subject.name}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary">
                    عنوان المهمة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مراجعة التكامل"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary">
                    ملاحظات
                  </label>
                  <textarea
                    rows={2}
                    placeholder="أي ملاحظات إضافية..."
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary">
                      التاريخ *
                    </label>
                    <input
                      type="date"
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary">
                      الأولوية
                    </label>
                    <select
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.priority}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          priority: e.target.value as "low" | "medium" | "high",
                        })
                      }
                    >
                      <option value="low">🟢 منخفضة</option>
                      <option value="medium">🟡 متوسطة</option>
                      <option value="high">🔴 عالية</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary">
                      من *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.startTime}
                      onChange={(e) =>
                        setFormData({ ...formData, startTime: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary">
                      إلى *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={formData.endTime}
                      onChange={(e) =>
                        setFormData({ ...formData, endTime: e.target.value })
                      }
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || subjects.length === 0}
                  className="w-full rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الإضافة...
                    </span>
                  ) : (
                    "➕ إضافة المهمة"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AddTaskModal;