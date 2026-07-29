"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const stats = [
  { label: "الأيام المتبقية", value: "126", color: "text-primary" },
  { label: "نسبة الإنجاز", value: "82%", color: "text-success" },
  { label: "ساعات اليوم", value: "4.5", color: "text-accent" },
];

const subjects = [
  { name: "رياضيات", progress: 90, color: "bg-primary" },
  { name: "فيزياء", progress: 65, color: "bg-accent" },
  { name: "عربية", progress: 40, color: "bg-success" },
];

export const DashboardPreview = () => {
  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300 }}
      className="relative"
    >
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl shadow-primary/10 backdrop-blur-sm">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-secondary">مرحبًا 👋</p>
            <h3 className="text-xl font-bold">أحمد</h3>
          </div>
          <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            طالب بكالوريا
          </div>
        </div>

        {/* Stats Grid */}
        <div className="mb-6 grid grid-cols-3 gap-4">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl bg-gray-50 p-3 text-center"
            >
              <p className={cn("text-2xl font-bold", stat.color)}>
                {stat.value}
              </p>
              <p className="text-xs text-secondary">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Subjects Progress */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-secondary">مواد اليوم</p>
          {subjects.map((subject, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>{subject.name}</span>
                <span className="text-secondary">{subject.progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${subject.progress}%` }}
                  transition={{ duration: 1, delay: i * 0.2 }}
                  className={cn("h-full rounded-full", subject.color)}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Weekly Progress */}
        <div className="mt-4 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">إنجاز الأسبوع</p>
              <p className="text-2xl font-bold">82%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 p-2">
              <div className="h-full w-full rounded-full border-4 border-primary/30 border-t-primary" />
            </div>
          </div>
        </div>
      </div>

      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-primary/10 blur-2xl"
      />
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-accent/10 blur-2xl"
      />
    </motion.div>
  );
};