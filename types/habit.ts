export type RepeatType = 'daily' | 'weekly' | 'monthly';

export interface Habit {
  id: string;
  name: string;
  time: string; // HH:MM format
  repeatType: RepeatType;
  repeatValue: number; // Number of times per week/month
  repeatDays?: number[]; // For weekly: 0-6 (Sunday-Saturday)
  repeatDates?: number[]; // For monthly: 1-31
  createdAt: string;
  updatedAt: string;
}

export interface HabitCompletion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string;
}

export interface HabitWithStatus extends Habit {
  isCompleted?: boolean;
  completionId?: string;
  isScheduledForToday?: boolean;
}