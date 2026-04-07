import type { TaskStatus } from '@/types/task';

// Status color variants using CVA - stored at module level (DRY)
export const statusColorMap: Record<
  TaskStatus | 'default',
  { borderRight: string; borderLeft: string; borderBottom: string; background: string }
> = {
  TODO: {
    borderRight: 'border-r-yellow-500',
    borderLeft: 'border-l-yellow-500',
    borderBottom: 'border-b-yellow-500',
    background: 'bg-yellow-500',
  },
  IN_PROGRESS: {
    borderRight: 'border-r-blue-500',
    borderLeft: 'border-l-blue-500',
    borderBottom: 'border-b-blue-500',
    background: 'bg-blue-500',
  },
  DONE: {
    borderRight: 'border-r-green-500',
    borderLeft: 'border-l-green-500',
    borderBottom: 'border-b-green-500',
    background: 'bg-green-500',
  },
  default: {
    borderRight: 'border-r-border',
    borderLeft: 'border-l-border',
    borderBottom: 'border-b-border',
    background: 'bg-border',
  },
};

// Helper function to get status colors based on task status
export function getStatusColor(status: TaskStatus | undefined): {
  borderRight: string;
  borderLeft: string;
  borderBottom: string;
  background: string;
} {
  return statusColorMap[status as keyof typeof statusColorMap] ?? statusColorMap.default;
}
