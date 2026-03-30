import { Task } from '@/types/task';
import {
  TaskStats,
  EfficiencyMetrics,
  TrendAnalysis,
  BurndownDataPoint,
  CompletionTrendDataPoint,
} from '@/types/statistics';

export function calculateTaskStats(tasks: Task[]): TaskStats {
  const now = new Date();

  const completed = tasks.filter((task) => task.status === 'done').length;
  const overdue = tasks.filter(
    (task) =>
      task.status !== 'done' &&
      task.dueDate &&
      new Date(task.dueDate) < now
  ).length;

  const completionRate = tasks.length > 0
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return {
    total: tasks.length,
    completed,
    overdue,
    completionRate,
  };
}

/**
 * Calculate efficiency metrics based on task completion history
 */
export function calculateEfficiencyMetrics(tasks: Task[]): EfficiencyMetrics {
  const completedTasks = tasks.filter((task) => task.status === 'done');

  // Calculate Lead Time (average days to complete)
  const leadTime = calculateLeadTime(completedTasks);

  // Calculate Velocity (tasks completed per week)
  const velocity = calculateVelocity(completedTasks);

  // Calculate Peak Productivity Day
  const { peakDay, peakCount } = calculatePeakProductivityDay(completedTasks);

  return {
    leadTime,
    velocity,
    peakProductivityDay: peakDay,
    peakProductivityCount: peakCount,
  };
}

/**
 * Calculate average time to complete tasks in days
 */
function calculateLeadTime(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  const totalDays = completedTasks.reduce((sum, task) => {
    const start = new Date(task.createdAt);
    const end = new Date(task.updatedAt);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return sum + Math.max(0, days); // Avoid negative values
  }, 0);

  return Math.round((totalDays / completedTasks.length) * 10) / 10;
}

/**
 * Calculate tasks completed per week
 */
function calculateVelocity(completedTasks: Task[]): number {
  if (completedTasks.length === 0) return 0;

  const now = new Date();
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const tasksInLastTwoWeeks = completedTasks.filter((task) => {
    const completedDate = new Date(task.updatedAt);
    return completedDate >= twoWeeksAgo;
  }).length;

  return Math.round((tasksInLastTwoWeeks / 2) * 10) / 10;
}

/**
 * Find the day of week with the most completed tasks
 */
function calculatePeakProductivityDay(completedTasks: Task[]): {
  peakDay: string;
  peakCount: number;
} {
  if (completedTasks.length === 0) {
    return { peakDay: 'N/A', peakCount: 0 };
  }

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCount: Record<number, number> = {};

  completedTasks.forEach((task) => {
    const dayOfWeek = new Date(task.updatedAt).getDay();
    dayCount[dayOfWeek] = (dayCount[dayOfWeek] || 0) + 1;
  });

  const maxDay = Object.entries(dayCount).reduce(
    (max, [day, count]) => (count > max.count ? { day: parseInt(day), count } : max),
    { day: 0, count: 0 }
  );

  return {
    peakDay: dayNames[maxDay.day],
    peakCount: maxDay.count,
  };
}

/**
 * Calculate trend analysis data for burn down and completion charts
 */
export function calculateTrendAnalysis(tasks: Task[]): TrendAnalysis {
  const burndownData = calculateBurndownData(tasks);
  const completionTrendData = calculateCompletionTrendData(tasks);

  return {
    burndownData,
    completionTrendData,
  };
}

/**
 * Generate burndown data - remaining tasks over time
 * Shows how many tasks are incomplete at each point in time
 */
function calculateBurndownData(tasks: Task[]): BurndownDataPoint[] {
  if (tasks.length === 0) return [];

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all unique dates from task creation and completion
  const dates = new Set<string>();
  tasks.forEach((task) => {
    const createdDate = new Date(task.createdAt);
    if (createdDate >= thirtyDaysAgo) {
      dates.add(formatDate(createdDate));
    }
    if (task.status === 'done') {
      const updatedDate = new Date(task.updatedAt);
      if (updatedDate >= thirtyDaysAgo) {
        dates.add(formatDate(updatedDate));
      }
    }
  });

  // Sort dates and generate burndown points
  const sortedDates = Array.from(dates).sort();

  return sortedDates.map((date) => {
    const dateObj = new Date(date);
    const completed = tasks.filter((task) => {
      if (task.status !== 'done') return false;
      const completedDate = new Date(task.updatedAt);
      return completedDate <= dateObj;
    }).length;

    const total = tasks.filter((task) => {
      const createdDate = new Date(task.createdAt);
      return createdDate <= dateObj;
    }).length;

    return {
      date: formatDateShort(dateObj),
      remaining: Math.max(0, total - completed),
      completed,
    };
  });
}

/**
 * Generate 7-day completion trend data
 * Shows how many tasks were completed each day in the last 7 days
 */
function calculateCompletionTrendData(tasks: Task[]): CompletionTrendDataPoint[] {
  const completedTasks = tasks.filter((task) => task.status === 'done');

  if (completedTasks.length === 0) {
    return generateEmptySevenDays();
  }

  const dayData: Record<string, number> = {};
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    dayData[dateStr] = 0;
  }

  // Count completed tasks per day
  completedTasks.forEach((task) => {
    const completedDate = new Date(task.updatedAt);
    if (completedDate >= sevenDaysAgo) {
      const dateStr = formatDate(completedDate);
      if (dateStr in dayData) {
        dayData[dateStr]++;
      }
    }
  });

  // Convert to array with day labels
  const result: CompletionTrendDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    result.push({
      day: formatDayLabel(date),
      completed: dayData[dateStr],
      fullDate: dateStr,
    });
  }

  return result;
}

/**
 * Generate empty 7-day array when no data available
 */
function generateEmptySevenDays(): CompletionTrendDataPoint[] {
  const result: CompletionTrendDataPoint[] = [];
  const now = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    result.push({
      day: formatDayLabel(date),
      completed: 0,
      fullDate: formatDate(date),
    });
  }

  return result;
}

/**
 * Format date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format date as short label (e.g., "Mon", "Tue")
 */
function formatDateShort(date: Date): string {
  const day = date.getDate();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${monthNames[date.getMonth()]} ${day}`;
}

/**
 * Format date as day label (e.g., "Mon", "Tue", "Today", "Yesterday")
 */
function formatDayLabel(date: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const diffTime = today.getTime() - targetDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return dayNames[date.getDay()];
}
