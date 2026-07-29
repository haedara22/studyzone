"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface AddSubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectAdded: () => void;
}

const colorOptions = [
  { name: "أزرق", value: "bg-blue-500" },
  { name: "أحمر", value: "bg-red-500" },
  { name: "أخضر", value: "bg-green-500" },
  { name: "أرجواني", value: "bg-purple-500" },
  { name: "برتقالي", value: "bg-orange-500" },
  { name: "وردي", value: "bg-pink-500" },
  { name: "تركواز", value: "bg-teal-500" },
  { name: "أصفر", value: "bg-yellow-500" },
];

const iconOptions = ["📚", "📐", "⚡", "🔬", "📖", "🎨", "🌍", "🧮", "✏️", "📝"];

export const AddSubjectModal = ({ isOpen, onClose, onSubjectAdded }: AddSubjectModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    icon: "📚",
    color: "bg-blue-500",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        onSubjectAdded();
        onClose();
        setFormData({
          name: "",
          icon: "📚",
          color: "bg-blue-500",
        });
      } else {
        const error = await res.json();
        alert((error as { error?: string }).error || "حدث خطأ");
      }
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("حدث خطأ في إضافة المادة");
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
                <h2 className="text-xl font-bold">📚 إضافة مادة جديدة</h2>
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
                    اسم المادة *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: رياضيات"
                    className="w-full rounded-lg border border-gray-200 px-4 py-2.5 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-secondary">
                    الأيقونة
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        className={`rounded-lg p-2 text-2xl transition-all ${
                          formData.icon === icon
                            ? "bg-primary/20 ring-2 ring-primary"
                            : "hover:bg-gray-100"
                        }`}
                        onClick={() => setFormData({ ...formData, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-secondary">
                    اللون
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`h-10 rounded-lg transition-all ${
                          color.value
                        } ${
                          formData.color === color.value
                            ? "ring-2 ring-offset-2 ring-primary"
                            : "hover:scale-105"
                        }`}
                        onClick={() => setFormData({ ...formData, color: color.value })}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-primary py-3 font-medium text-white hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      جاري الإضافة...
                    </span>
                  ) : (
                    "📚 إضافة المادة"
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