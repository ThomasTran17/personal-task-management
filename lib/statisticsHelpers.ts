import { Task } from '@/types/task';
import { TaskStats, EfficiencyMetrics } from '@/types/statistics';

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
