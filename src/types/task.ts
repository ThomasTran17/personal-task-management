export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: string; // ISO String - do NOT store Date objects in Redux
  updatedAt: string; // ISO String - do NOT store Date objects in Redux
  dueDate?: string; // ISO String - do NOT store Date objects in Redux
  ownerId: string;
  parentId?: string | null;
  participantIds?: string[];
  subtasks?: Task[];
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
