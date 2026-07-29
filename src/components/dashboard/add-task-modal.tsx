"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Subject {
  id: string;
  name: string;
  icon: string;
}

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskAdded: () => void;
}

interface SubjectsResponse {
  subjects: Subject[];
}

export const AddTaskModal = ({ isOpen, onClose, onTaskAdded }: AddTaskModalProps) => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    subject_id: "",
    start_time: "09:00",
    end_time: "10:30",
    duration: 90,
  });

  // جلب المواد
  useEffect(() => {
    if (isOpen) {
      fetchSubjects();
    }
  }, [isOpen]);

  const fetchSubjects = async () => {
    try {
      const res = await fetch("/api/subjects");
      if (res.ok) {
        const data: SubjectsResponse = await res.json();
        setSubjects(data.subjects || []);
        if (data.subjects && data.subjects.length > 0) {
          setFormData(prev => ({ ...prev, subject_id: data.subjects[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onTaskAdded();
        onClose();
        setFormData({
          title: "",
          subject_id: subjects[0]?.id || "",
          start_time: "09:00",
          end_time: "10:30",
          duration: 90,
        });
      } else {
        const error = await res.json();
        alert((error as { error?: string }).error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error adding task:", error);
      alert("حدث خطأ في إضافة المهمة");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Background Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Modal */}
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
                    عنوان المهمة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مراجعة التكامل"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary">
                    المادة *
                  </label>
                  <select
                    required
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.subject_id}
                    onChange={(e) =>
                      setFormData({ ...formData, subject_id: e.target.value })
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-secondary">
                      من *
                    </label>
                    <input
                      type="time"
                      required
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={formData.start_time}
                      onChange={(e) =>
                        setFormData({ ...formData, start_time: e.target.value })
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
                      className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                      value={formData.end_time}
                      onChange={(e) =>
                        setFormData({ ...formData, end_time: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-secondary">
                    المدة (دقيقة)
                  </label>
                  <input
                    type="number"
                    min="15"
                    step="15"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.duration}
                    onChange={(e) =>
                      setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })
                    }
                  />
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