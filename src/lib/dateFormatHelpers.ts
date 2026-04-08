/**
 * Date Formatting Utilities
 * Convert ISO strings to readable formats at render-time
 * Constraint: Always work with ISO strings from Redux store
 * Formatting happens ONLY at the view/component layer
 */

/**
 * Format ISO string date to Vietnamese locale date string
 * @param dateString - ISO string from Redux store
 * @param locale - Locale code (default: 'vi-VN')
 * @returns Formatted date string or empty string if invalid
 */
export const formatDateToLocale = (dateString: string | undefined, locale = 'vi-VN'): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (Number.isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleDateString(locale);
  } catch {
    return '';
  }
};

/**
 * Format ISO string to custom pattern (year, month, day)
 * @param dateString - ISO string from Redux store
 * @param pattern - Format pattern: 'yyyy-mm-dd', 'dd/mm/yyyy', 'mm-dd-yyyy'
 * @returns Formatted date string or empty string if invalid
 */
export const formatISODateString = (
  dateString: string | undefined,
  pattern = 'dd/mm/yyyy'
): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    switch (pattern.toLowerCase()) {
      case 'yyyy-mm-dd':
        return `${year}-${month}-${day}`;
      case 'dd/mm/yyyy':
        return `${day}/${month}/${year}`;
      case 'mm-dd-yyyy':
        return `${month}-${day}-${year}`;
      case 'mm/dd/yyyy':
        return `${month}/${day}/${year}`;
      default:
        return `${day}/${month}/${year}`;
    }
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g., '2 days ago', 'in 3 hours')
 * @param dateString - ISO string from Redux store
 * @returns Relative time string
 */
export const getRelativeTimeFromISO = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return diff > 0
        ? `in ${days} day${days > 1 ? 's' : ''}`
        : `${days} day${days > 1 ? 's' : ''} ago`;
    }

    if (hours > 0) {
      return diff > 0
        ? `in ${hours} hour${hours > 1 ? 's' : ''}`
        : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    if (minutes > 0) {
      return diff > 0
        ? `in ${minutes} minute${minutes > 1 ? 's' : ''}`
        : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    return 'just now';
  } catch {
    return '';
  }
};

/**
 * Get relative time string (e.g., '2 days ago', 'in 3 hours')
 * @param dateString - ISO string from Redux store
 * @returns Relative time string
 */
export const getRelativeTime = (dateString: string | undefined): string => {
  if (!dateString) return '';

  try {
    const date = new Date(dateString);
    // Validate date is valid
    if (Number.isNaN(date.getTime())) {
      return '';
    }

    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const absDiff = Math.abs(diff);

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return diff > 0
        ? `in ${days} day${days > 1 ? 's' : ''}`
        : `${days} day${days > 1 ? 's' : ''} ago`;
    }

    if (hours > 0) {
      return diff > 0
        ? `in ${hours} hour${hours > 1 ? 's' : ''}`
        : `${hours} hour${hours > 1 ? 's' : ''} ago`;
    }

    if (minutes > 0) {
      return diff > 0
        ? `in ${minutes} minute${minutes > 1 ? 's' : ''}`
        : `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    }

    return 'just now';
  } catch {
    return '';
  }
};

/**
 * Check if date string is in the past
 * @param dateString - ISO string from Redux store
 * @returns True if date is in the past
 */
export const isPastDate = (dateString: string | undefined): boolean => {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    return date < new Date();
  } catch {
    return false;
  }
};

/**
 * Check if date string is today
 * @param dateString - ISO string from Redux store
 * @returns True if date is today
 */
export const isToday = (dateString: string | undefined): boolean => {
  if (!dateString) return false;

  try {
    const date = new Date(dateString);
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  } catch {
    return false;
  }
};

/**
 * Check if a date is overdue (today > due date)
 * @param dateString - ISO string from Redux store
 * @returns true if date is in the past (overdue), false otherwise
 */
export const isDateOverdue = (dateString: string | undefined): boolean => {
  if (!dateString) return false;

  try {
    const dueDate = new Date(dateString);
    if (Number.isNaN(dueDate.getTime())) {
      return false;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return today > dueDate;
  } catch {
    return false;
  }
};
