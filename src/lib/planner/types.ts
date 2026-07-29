export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
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
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyStats {
  date: string;
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  completionRate: number;
}
export interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  days: DailyStats[];
  totalTasks: number;
  completedTasks: number;
  totalHours: number;
  completedHours: number;
  completionRate: number;
}