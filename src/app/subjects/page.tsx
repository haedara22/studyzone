"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { 
  Clock, 
  BookOpen, 
  Coffee, 
  Play, 
  BrainCircuit,
  AlertCircle,
  RefreshCw,
  Sparkles,
  Trash2,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  BarChart3,
  CheckCircle,
  Hourglass
} from "lucide-react";

interface SubjectPlan {
  id: string;
  name: string;
  totalLessons: number;
  completedLessons: number;
  targetDays: number;
  estimatedMinutesPerLesson: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  color?: string;
  examDate?: string;
  notes?: string;
}

interface DailyScheduleSlot {
  id: string;
  subjectId?: string;
  type: "LESSON" | "BREAK";
  title: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  color?: string;
}

interface SubjectSummary {
  id: string;
  name: string;
  dailyLessonsCount: number;
  remainingLessons: number;
  daysToFinish: number;
  color?: string;
  progressPercentage: number;
}

interface GeneratedPlanState {
  scheduleSlots: DailyScheduleSlot[];
  totalRequiredMinutes: number;
  totalAvailableMinutes: number;
  isOvercapacity: boolean;
  totalDailyLessonsFinished: number;
  subjectSummaries: SubjectSummary[];
}

interface ScheduleApiResponse {
  hasActivePlan?: boolean;
  slots?: DailyScheduleSlot[];
  preferredStartTime?: string;
  totalRequiredMinutes?: number;
  subjectSummaries?: SubjectSummary[];
}

interface StudyPlansApiResponse {
  subjects?: SubjectPlan[];
}

const PALETTE = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#06b6d4",
];

export default function UnifiedLightPlanner() {
  const [subjects, setSubjects] = useState<SubjectPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 1️⃣ حل مشكلة الـ Hydration: إعطاء قيمة افتراضية ثابتة للجميع أولاً
  const [dailyAvailableHours, setDailyAvailableHours] = useState<number>(4);
  const [preferredStartTime, setPreferredStartTime] = useState<string>("16:00");
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlanState | null>(null);

  // 2️⃣ قراءة التفضيلات من localStorage بعد اكتمال التحميل عند العميل حصراً
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHours = localStorage.getItem("planner_available_hours");
      if (savedHours) setDailyAvailableHours(Number(savedHours));

      const savedTime = localStorage.getItem("planner_start_time");
      if (savedTime) setPreferredStartTime(savedTime);
    }
  }, []);

  const handleHoursChange = (hours: number) => {
    setDailyAvailableHours(hours);
    if (typeof window !== "undefined") {
      localStorage.setItem("planner_available_hours", String(hours));
    }
  };

  const handleStartTimeChange = (time: string) => {
    setPreferredStartTime(time);
    if (typeof window !== "undefined") {
      localStorage.setItem("planner_start_time", time);
    }
  };

  const fetchUserPlans = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/user/study-plans", { credentials: "include" });
      if (!res.ok) throw new Error("فشل في جلب قائمة المواد الدراسية");
      
      const data = (await res.json()) as SubjectPlan[] | StudyPlansApiResponse;
      const loadedSubjects: SubjectPlan[] = Array.isArray(data) 
        ? data 
        : Array.isArray(data?.subjects) 
        ? data.subjects 
        : [];
        
      const enrichedSubjects = loadedSubjects.map((sub, idx) => ({
        ...sub,
        estimatedMinutesPerLesson: sub.estimatedMinutesPerLesson || 45,
        color: sub.color || PALETTE[idx % PALETTE.length],
      }));

      setSubjects(enrichedSubjects);

      const scheduleRes = await fetch("/api/user/save-schedule", { credentials: "include" });
      if (scheduleRes.ok) {
        const scheduleData = (await scheduleRes.json()) as ScheduleApiResponse;
        
        if (scheduleData?.hasActivePlan && Array.isArray(scheduleData.slots)) {
          if (scheduleData.preferredStartTime) {
            const cleanTime = String(scheduleData.preferredStartTime).slice(0, 5);
            setPreferredStartTime(cleanTime);
            if (typeof window !== "undefined") {
              localStorage.setItem("planner_start_time", cleanTime);
            }
          }

          const lessonSlots = scheduleData.slots.filter((s) => s.type === "LESSON");

          setGeneratedPlan({
            scheduleSlots: scheduleData.slots,
            totalRequiredMinutes: scheduleData.totalRequiredMinutes || 0,
            totalAvailableMinutes: dailyAvailableHours * 60,
            isOvercapacity: false,
            totalDailyLessonsFinished: lessonSlots.length,
            subjectSummaries: scheduleData.subjectSummaries || [],  
          });
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "حدث خطأ غير متوقع أثناء تحميل البيانات";
      console.error(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [dailyAvailableHours]);

  useEffect(() => {
    fetchUserPlans();
  }, [fetchUserPlans]);

  const handleResetPlan = async () => {
    if (!confirm("هل أنت تأكد من رغبتك في مسح خطة اليوم وتوليد خطة جديدة؟")) return;

    try {
      const res = await fetch("/api/user/save-schedule", { method: "DELETE" });
      if (res.ok) {
        setGeneratedPlan(null);
      } else {
        throw new Error("فشل مسح الخطة من الخادم");
      }
    } catch (err: unknown) {
      console.error("فشل في مسح الخطة", err);
      alert("حدث خطأ أثناء مسح الخطة.");
    }
  };

  const handleSubjectChange = (
    id: string, 
    field: keyof SubjectPlan, 
    value: string | number
  ) => {
    setSubjects((prev) =>
      prev.map((sub) => (sub.id === id ? { ...sub, [field]: value } : sub))
    );
  };

  const generatePlan = async () => {
    const totalAvailableMinutes = dailyAvailableHours * 60;
    
    const activeSubjects = subjects.filter(
      (s) => s.totalLessons > 0 && s.targetDays > 0
    );

    if (activeSubjects.length === 0) {
      setError("يرجى تحديد عدد الدروس ومهلة الأيام لمادة واحدة على الأقل لتوليد الخطة.");
      return;
    }

    setError(null);

    const rawRequirements = activeSubjects.map((sub) => {
      const remaining = Math.max(0, sub.totalLessons - (sub.completedLessons || 0));
      const dailyLessonsNeeded = sub.targetDays > 0 ? Math.ceil(remaining / sub.targetDays) : 0;
      const lessonDuration = sub.estimatedMinutesPerLesson || 45;
      const requiredMinutes = dailyLessonsNeeded * lessonDuration;
      const progressPercentage = sub.totalLessons > 0 
        ? Math.round(((sub.completedLessons || 0) / sub.totalLessons) * 100) 
        : 0;

      return {
        ...sub,
        remainingLessons: remaining,
        dailyLessonsNeeded,
        requiredMinutes,
        lessonDuration,
        progressPercentage
      };
    });

    const totalRequiredMinutes = rawRequirements.reduce((sum, item) => sum + item.requiredMinutes, 0);
    const isOvercapacity = totalRequiredMinutes > totalAvailableMinutes;

    const sorted = [...rawRequirements].sort((a, b) => {
      const diffWeight: Record<SubjectPlan["difficulty"], number> = { HARD: 3, MEDIUM: 2, EASY: 1 };
      const priorityA = (diffWeight[a.difficulty] * 10) / (a.targetDays || 1);
      const priorityB = (diffWeight[b.difficulty] * 10) / (b.targetDays || 1);
      return priorityB - priorityA;
    });

    const scheduleSlots: DailyScheduleSlot[] = [];
    const subjectSummaries: SubjectSummary[] = [];

    const [startHour, startMinute] = preferredStartTime.split(":").map(Number);
    let currentClockMinutes = (startHour || 16) * 60 + (startMinute || 0);
    let allocatedMinutes = 0;
    let totalDailyLessonsFinished = 0;

    const formatTime = (totalMins: number) => {
      const h = Math.floor(totalMins / 60) % 24;
      const m = totalMins % 60;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    for (const sub of sorted) {
      let actualLessonsInSlot = 0;

      for (let i = 0; i < sub.dailyLessonsNeeded; i++) {
        const lessonDuration = sub.lessonDuration;
        
        if (allocatedMinutes + lessonDuration > totalAvailableMinutes) break;

        const startTime = formatTime(currentClockMinutes);
        currentClockMinutes += lessonDuration;
        const endTime = formatTime(currentClockMinutes);
        allocatedMinutes += lessonDuration;
        actualLessonsInSlot++;
        totalDailyLessonsFinished++;

        scheduleSlots.push({
          id: `slot-${sub.id}-${i}`,
          subjectId: sub.id,
          type: "LESSON",
          title: `مذاكرة: ${sub.name}`,
          durationMinutes: lessonDuration,
          startTime,
          endTime,
          color: sub.color
        });

        if (allocatedMinutes + 10 <= totalAvailableMinutes) {
          const breakStart = formatTime(currentClockMinutes);
          currentClockMinutes += 10;
          const breakEnd = formatTime(currentClockMinutes);
          allocatedMinutes += 10;

          scheduleSlots.push({
            id: `break-${sub.id}-${i}`,
            type: "BREAK",
            title: "فترة استراحة وتنشيط",
            durationMinutes: 10,
            startTime: breakStart,
            endTime: breakEnd,
          });
        }
      }

      if (actualLessonsInSlot > 0) {
        const daysToFinish = Math.ceil(sub.remainingLessons / actualLessonsInSlot);
        subjectSummaries.push({
          id: sub.id,
          name: sub.name,
          dailyLessonsCount: actualLessonsInSlot,
          remainingLessons: sub.remainingLessons,
          daysToFinish,
          color: sub.color,
          progressPercentage: sub.progressPercentage
        });
      }
    }

    setGeneratedPlan({
      scheduleSlots,
      totalRequiredMinutes,
      totalAvailableMinutes,
      isOvercapacity,
      totalDailyLessonsFinished,
      subjectSummaries,
    });

    try {
      const todayStr = new Date().toISOString().split("T")[0];
      await fetch("/api/user/save-schedule", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: todayStr,
          slots: scheduleSlots,
          preferredStartTime,
          dailyAvailableHours,
          totalRequiredMinutes,
          subjectSummaries
        }),
      });
    } catch (err: unknown) {
      console.error("فشل حفظ الجدول:", err);
    }
  };

  const totalLessonsAll = subjects.reduce((acc, s) => acc + (s.totalLessons || 0), 0);
  const completedLessonsAll = subjects.reduce((acc, s) => acc + (s.completedLessons || 0), 0);
  const totalProgressPercent = totalLessonsAll > 0 ? Math.round((completedLessonsAll / totalLessonsAll) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 pb-20 pt-10 dir-rtl font-sans">
      <Container>
        
        {/* Header Section */}
        <div className="mb-8 rounded-3xl border border-slate-200/80 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-100 mb-3">
                <BrainCircuit className="h-4 w-4" />
                <span>المخطط الدراسي المباشر الشامل</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                إدارة المواد وتوليد الخطة الذكية
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mt-1">
                عرض التقييمات الحقيقية لكل مادة مع الجدول الزمني المحسوب بدقة بناءً على طاقتك المتاحة.
              </p>
            </div>

            {/* Global Controls */}
            <div className="flex flex-wrap items-center gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">الوقت المتاح يومياً:</label>
                <select
                  value={dailyAvailableHours}
                  onChange={(e) => handleHoursChange(Number(e.target.value))}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value={2}>2 ساعات</option>
                  <option value={3}>3 ساعات</option>
                  <option value={4}>4 ساعات</option>
                  <option value={5}>5 ساعات</option>
                  <option value={6}>6 ساعات</option>
                  <option value={8}>8 ساعات</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">وقت البدء:</label>
                <input
                  type="time"
                  value={preferredStartTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 sm:pt-0">
                <Button 
                  onClick={generatePlan} 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 rounded-xl text-xs px-5 py-2.5 shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <Sparkles className="h-4 w-4" />
                  توليد الخطة
                </Button>
              </div>
            </div>
          </div>

          {/* Overall Stats Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">إجمالي المواد</div>
                <div className="text-base font-black text-slate-900">{subjects.length} مواد</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">إنجاز الدروس الكلي</div>
                <div className="text-base font-black text-slate-900">{completedLessonsAll} / {totalLessonsAll}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">نسبة التقدم الإجمالية</div>
                <div className="text-base font-black text-slate-900">{totalProgressPercent}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Flame className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[11px] text-slate-500 font-bold">ساعات الدراسة اليومية</div>
                <div className="text-base font-black text-slate-900">{dailyAvailableHours} ساعات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 text-xs">
            <span>{error}</span>
            <Button size="sm" variant="outline" onClick={fetchUserPlans} className="gap-1 text-xs">
              <RefreshCw className="h-3.5 w-3.5" />
              إعادة التحميل
            </Button>
          </div>
        )}

        {generatedPlan?.isOvercapacity && (
          <div className="mb-8 flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            <AlertCircle className="h-6 w-6 shrink-0 text-amber-600" />
            <div className="text-xs leading-relaxed">
              <strong className="block text-sm font-bold mb-0.5 text-amber-900">
                تنبيه: الوقت المتاح لا يتسع لجميع دروس المواد المقررة اليوم!
              </strong>
              تم بناء الجدول بالاعتماد على أولوية المواد والصعوبة واستيعاب أكبر قدر ممكن ضمن ({dailyAvailableHours} ساعات).
            </div>
          </div>
        )}

        {/* Daily Completion Summary Banner */}
        {generatedPlan && (
          <div className="mb-8 rounded-3xl bg-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400" />
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="text-xs text-blue-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  مستهدف الإنجاز اليومي المتوقع
                </div>
                <div className="text-xl md:text-2xl font-extrabold">
                  ستنهي <span className="text-emerald-400 font-black">{generatedPlan.totalDailyLessonsFinished} دروس</span> يومياً عند التزامك بالجدول
                </div>
              </div>

              {generatedPlan.subjectSummaries && generatedPlan.subjectSummaries.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                  {generatedPlan.subjectSummaries.map((summary) => (
                    <div key={summary.id} className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-3.5 py-2 text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: summary.color || "#3b82f6" }} />
                        {summary.name}
                      </div>
                      <div className="text-slate-300 text-[11px] mt-0.5">
                        <span className="font-bold text-emerald-300">{summary.dailyLessonsCount} دروس/يوم</span>
                        <span className="mx-1.5">•</span>
                        <span>ينتهي خلال {summary.daysToFinish} أيام</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Detailed Subject Cards */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-600" />
                <span>تفاصيل ومعايير المواد ({subjects.length})</span>
              </h2>
            </div>

            {loading ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                جاري جلب بيانات المواد من قاعدة البيانات...
              </div>
            ) : subjects.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                لم يتم العثور على مواد مسجلة بحسابك.
              </div>
            ) : (
              subjects.map((sub) => {
                const remaining = Math.max(0, sub.totalLessons - (sub.completedLessons || 0));
                const daily = sub.targetDays > 0 ? Math.ceil(remaining / sub.targetDays) : 0;
                const progress = sub.totalLessons > 0 ? Math.round(((sub.completedLessons || 0) / sub.totalLessons) * 100) : 0;

                return (
                  <div 
                    key={sub.id} 
                    className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm hover:shadow-md transition-shadow space-y-4 relative overflow-hidden"
                  >
                    <div 
                      className="absolute right-0 top-0 bottom-0 w-1.5" 
                      style={{ backgroundColor: sub.color || "#3b82f6" }} 
                    />

                    <div className="flex items-start justify-between border-b border-slate-100 pb-3 pr-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-base text-slate-900">{sub.name}</span>
                          {sub.examDate && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-bold border border-amber-200">
                              <Calendar className="h-3 w-3" />
                              {sub.examDate}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Hourglass className="h-3 w-3 text-slate-400" />
                            زمن الدرس: <strong>{sub.estimatedMinutesPerLesson} دقيقة</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <label className="text-[11px] text-slate-500 font-bold">الصعوبة:</label>
                        <select
                          value={sub.difficulty}
                          onChange={(e) => handleSubjectChange(sub.id, "difficulty", e.target.value as SubjectPlan["difficulty"])}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 focus:outline-none"
                        >
                          <option value="EASY">سهلة</option>
                          <option value="MEDIUM">متوسطة</option>
                          <option value="HARD">صعبة</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[11px] font-bold">
                        <span className="text-slate-600">نسبة التقدم بالمادة:</span>
                        <span className="text-blue-600">{progress}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500" 
                          style={{ width: `${progress}%`, backgroundColor: sub.color || "#3b82f6" }} 
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5 text-xs">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">إجمالي الدروس:</label>
                        <input
                          type="number"
                          min="0"
                          value={sub.totalLessons}
                          onChange={(e) => handleSubjectChange(sub.id, "totalLessons", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">المنجز منها:</label>
                        <input
                          type="number"
                          min="0"
                          value={sub.completedLessons}
                          onChange={(e) => handleSubjectChange(sub.id, "completedLessons", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">المهلة (أيام):</label>
                        <input
                          type="number"
                          min="1"
                          value={sub.targetDays}
                          onChange={(e) => handleSubjectChange(sub.id, "targetDays", Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-bold text-slate-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl text-xs text-slate-700 font-medium">
                      <span>المستهدف للإنهاء بالوقت المحدد:</span>
                      <span className="font-extrabold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {daily} دروس / يوم
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Column: Interactive Schedule Display */}
          <div className="lg:col-span-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                <span>جدول اليوم المقترح</span>
              </h2>

              {generatedPlan && (
                <Button 
                  onClick={handleResetPlan}
                  variant="outline"
                  className="group h-8 px-3 flex items-center gap-2 text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 rounded-xl shadow-sm gap-1.5"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span>حذف الخطة</span>
                </Button>
              )}
            </div>

            {!generatedPlan ? (
              <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center bg-white space-y-3">
                <BrainCircuit className="h-10 w-10 text-slate-300 mx-auto" />
                <div className="text-sm font-bold text-slate-700">لم يتم توليد الجدول بعد</div>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  حدد معايير المواد المقررة والوقت المتاح على اليمين ثم اضغط على <strong>"توليد الخطة"</strong>.
                </p>
              </div>
            ) : (
              <div className="space-y-3 relative before:absolute before:right-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {generatedPlan.scheduleSlots.map((slot) => {
                  const isBreak = slot.type === "BREAK";

                  return (
                    <div key={slot.id} className="relative flex items-center gap-4 pr-12">
                      <div 
                        className={`absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full border-2 ${
                          isBreak ? "bg-white border-amber-400" : "bg-white border-blue-600"
                        }`}
                        style={!isBreak && slot.color ? { borderColor: slot.color } : {}}
                      />

                      <div className={`w-full rounded-2xl p-4 border shadow-sm transition-all ${
                        isBreak ? "bg-amber-50/40 border-amber-200/60" : "bg-white border-slate-200/90 hover:border-slate-300"
                      }`}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {isBreak ? (
                              <div className="p-2 bg-amber-100/60 rounded-xl">
                                <Coffee className="h-4 w-4 text-amber-600" />
                              </div>
                            ) : (
                              <div 
                                className="p-2 rounded-xl text-white"
                                style={{ backgroundColor: slot.color || "#3b82f6" }}
                              >
                                <Play className="h-4 w-4 fill-current" />
                              </div>
                            )}
                            <div>
                              <div className="text-sm font-bold text-slate-900">{slot.title}</div>
                              <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                <span>المدة: <strong>{slot.durationMinutes} دقيقة</strong></span>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg dir-ltr">
                            {slot.startTime} - {slot.endTime}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {generatedPlan.scheduleSlots.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-400 text-xs bg-white">
                    لا توجد دروس أو مواعيد دراسية مطابقة للمدخلات الحالية.
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </Container>
    </div>
  );
}