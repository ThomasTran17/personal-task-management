/**
 * Notification Types and Interfaces
 */

export interface NotificationState {
  oneHourNotified: Set<string>;
  oneDayNotified: Set<string>;
}

export interface NotificationPayload {
  title: string;
  body: string;
  tag: string;
  isUrgent: boolean;
}

export interface TaskNotificationStatus {
  isUrgent: boolean;
  isUpcoming: boolean;
}
