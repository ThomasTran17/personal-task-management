// Constants
export const ONE_HOUR_MS = 60 * 60 * 1000;
export const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Calculate time remaining until deadline in milliseconds
 * @param dueDate - The deadline date
 * @param currentTime - Optional current timestamp (for consistency across calculations)
 * @returns Time remaining in milliseconds (negative if overdue)
 */
export const getTimeUntilDeadline = (dueDate: Date, currentTime?: number): number => {
  const now = currentTime ?? new Date().getTime();
  return new Date(dueDate).getTime() - now;
};

/**
 * Interface for deadline status
 */
export interface DeadlineStatus {
  isOverdue: boolean;
  isDueSoon: boolean;
  isUrgent: boolean;
}

/**
 * Get deadline status based on due date and task status
 * @param dueDate - The deadline date
 * @param status - The task status
 * @param currentTime - Optional current timestamp (for consistency across calculations)
 * @returns Object with boolean flags for deadline states
 */
export const getDeadlineStatus = (
  dueDate: Date | undefined,
  status: string,
  currentTime?: number
): DeadlineStatus => {
  if (!dueDate || status === 'done') {
    return { isOverdue: false, isDueSoon: false, isUrgent: false };
  }

  const timeUntil = getTimeUntilDeadline(dueDate, currentTime);
  return {
    isOverdue: timeUntil < 0,
    isUrgent: timeUntil > 0 && timeUntil < ONE_HOUR_MS,
    isDueSoon: timeUntil >= ONE_HOUR_MS && timeUntil < ONE_DAY_MS,
  };
};

/**
 * Get CSS class string for deadline status styling
 * @param isOverdue - Whether the deadline has passed
 * @param isUrgent - Whether deadline is within 1 hour
 * @param isDueSoon - Whether deadline is within 24 hours
 * @returns Tailwind CSS class string for styling
 */
export const getDeadlineStatusClass = (
  isOverdue: boolean,
  isUrgent: boolean,
  isDueSoon: boolean
): string => {
  if (isOverdue) {
    return 'bg-red-100 text-red-800 border-red-300';
  }
  if (isUrgent) {
    return 'bg-red-50 text-red-700 border-red-400 shadow-shadow';
  }
  if (isDueSoon) {
    return 'bg-amber-100 text-amber-800 border-amber-300';
  }
  return 'bg-green-100 text-green-800 border-green-300';
};

/**
 * Format date to short format (e.g., "Mar 19, 2026")
 * @param date - The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format date and time (e.g., "Mar 19, 2:30 PM")
 * @param date - The date to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Get deadline status label
 * @param isOverdue - Whether the deadline has passed
 * @param isDueSoon - Whether deadline is within 24 hours
 * @returns Status label string
 */
export const getDeadlineStatusLabel = (
  isOverdue: boolean,
  isDueSoon: boolean
): string => {
  if (isOverdue) return 'Overdue';
  if (isDueSoon) return 'Due Today/Tomorrow';
  return 'Due';
};

/**
 * Sort tasks by deadline status and time
 * Tasks with deadlines appear first, sorted by deadline urgency
 * Tasks without deadlines appear last
 * @param tasks - Array of tasks to sort
 * @returns Sorted array of tasks
 */
export const sortTasksByDeadline = <T extends { dueDate?: Date; status?: string }>(
  tasks: T[]
): T[] => {
  return [...tasks].sort((a, b) => {
    // Tasks with deadlines come first
    const aHasDeadline = !!a.dueDate;
    const bHasDeadline = !!b.dueDate;

    if (aHasDeadline && !bHasDeadline) return -1;
    if (!aHasDeadline && bHasDeadline) return 1;

    // If both have deadlines, sort by earliest deadline
    if (aHasDeadline && bHasDeadline) {
      const aTime = new Date(a.dueDate!).getTime();
      const bTime = new Date(b.dueDate!).getTime();
      return aTime - bTime;
    }

    // If neither has deadline, maintain original order
    return 0;
  });
};
