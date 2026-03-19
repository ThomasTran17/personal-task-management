export interface TaskStats {
  total: number;
  completed: number;
  overdue: number;
  completionRate: number;
}

/**
 * Efficiency metrics for task productivity analysis
 */
export interface EfficiencyMetrics {
  /** Average time to complete a task in days */
  leadTime: number;
  /** Number of tasks completed per week */
  velocity: number;
  /** Day with highest task completion (format: 'Monday', 'Tuesday', etc.) */
  peakProductivityDay: string;
  /** Number of tasks completed on peak day */
  peakProductivityCount: number;
}
