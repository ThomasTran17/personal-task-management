import { useState, useCallback, useMemo } from 'react';
import { useGetTasksQuery } from '@/api';
import type { TaskPriority, TaskStatus } from '@/types';
import type { Task } from '@/types/task';
import { cn, sortTasksByDeadline } from '@/lib';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
} from '@/components/ui';
import {
  ExpandableTaskRow,
  SubtaskContainer,
  SubtaskTableHeader,
  SubtaskTableRow,
  AddTaskRow,
  getStatusColor as getStatusBorderColors,
  BulkActions,
} from '@/components/tasks';

// Mock subtask type for testing UI hierarchy
interface Subtask {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
}

// Configuration mapping for status labels and colors
const STATUS_CONFIG = {
  TODO: {
    label: 'To Do',
    shortLabel: 'To Do',
    class: 'bg-red-100 text-red-800',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    shortLabel: 'Progress',
    class: 'bg-yellow-100 text-yellow-800',
  },
  DONE: {
    label: 'Done',
    shortLabel: 'Done',
    class: 'bg-green-100 text-green-800',
  },
} as const;

// Configuration mapping for priority labels and colors
const PRIORITY_CONFIG = {
  HIGH: {
    label: 'High',
    shortLabel: 'High',
    class: 'bg-red-100 text-red-800',
  },
  MEDIUM: {
    label: 'Medium',
    shortLabel: 'Med',
    class: 'bg-yellow-100 text-yellow-800',
  },
  LOW: {
    label: 'Low',
    shortLabel: 'Low',
    class: 'bg-green-100 text-green-800',
  },
} as const;

// Utility functions for color mapping
const getStatusColor = (status: TaskStatus): string => {
  return STATUS_CONFIG[status]?.class || 'bg-gray-100 text-gray-800';
};

const getStatusLabel = (status: TaskStatus, isShort = false): string => {
  return isShort ? STATUS_CONFIG[status]?.shortLabel || '' : STATUS_CONFIG[status]?.label || '';
};

const getPriorityColor = (priority: TaskPriority): string => {
  return PRIORITY_CONFIG[priority]?.class || 'bg-gray-100 text-gray-800';
};

const getPriorityLabel = (priority: TaskPriority, isShort = false): string => {
  return isShort
    ? PRIORITY_CONFIG[priority]?.shortLabel || ''
    : PRIORITY_CONFIG[priority]?.label || '';
};

// Mock data for testing table with subtasks and visual connectors
const MOCK_SUBTASKS_MAP: Record<string, Subtask[]> = {
  'task-1': [
    { id: 'sub-1-1', title: 'Design database schema', status: 'DONE', priority: 'HIGH' },
    { id: 'sub-1-2', title: 'Setup API endpoints', status: 'IN_PROGRESS', priority: 'HIGH' },
    { id: 'sub-1-3', title: 'Write unit tests', status: 'TODO', priority: 'MEDIUM' },
  ],
  'task-2': [
    { id: 'sub-2-2', title: 'Add password validation', status: 'TODO', priority: 'MEDIUM' },
  ],
};

// Mock tasks for UI demonstration
const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Setup Project Infrastructure',
    description: 'Initialize database, API setup, and deployment pipeline',
    status: 'DONE',
    priority: 'HIGH',
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-20'),
    dueDate: new Date('2026-04-05'),
  },
  {
    id: 'task-2',
    title: 'Implement User Authentication',
    description: 'Login, registration, password reset functionality',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    createdAt: new Date('2026-03-18'),
    updatedAt: new Date('2026-03-25'),
    dueDate: new Date('2026-04-10'),
  },
  {
    id: 'task-3',
    title: 'Design Dashboard UI',
    description: 'Create responsive dashboard with analytics',
    status: 'TODO',
    priority: 'MEDIUM',
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-20'),
    dueDate: new Date('2026-04-15'),
  },
  {
    id: 'task-4',
    title: 'Write API Documentation',
    description: 'Document all endpoints and authentication flows',
    status: 'TODO',
    priority: 'LOW',
    createdAt: new Date('2026-03-22'),
    updatedAt: new Date('2026-03-22'),
    dueDate: new Date('2026-04-20'),
  },
  {
    id: 'task-5',
    title: 'Deploy to Production',
    description: 'Setup CI/CD pipeline and deploy application',
    status: 'DONE',
    priority: 'HIGH',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-03-10'),
    dueDate: new Date('2026-03-10'),
  },
];

// SubtaskList Component - Extracted logic for rendering subtasks
interface SubtaskListProps {
  subtasks: Subtask[];
  parentTaskStatus: TaskStatus;
  onAddSubtask: (title: string) => void;
}

function SubtaskList({ subtasks, parentTaskStatus, onAddSubtask }: SubtaskListProps) {
  const midIndex = (subtasks.length - 1) >> 1;
  const isSingleSubtask = subtasks.length === 1;

  return (
    <SubtaskContainer parentStatus={parentTaskStatus}>
      <table className="w-full border-separate border-spacing-0 table-fixed">
        <SubtaskTableHeader parentStatus={parentTaskStatus}>
          <TableRow>
            <TableHead
              className={cn(
                'align-middle',
                'border-r-5 first:border-l-0 first:border-t-0',
                'p-0',
                getStatusBorderColors(parentTaskStatus).borderRight,
                'w-[3%]'
              )}
            />
            <TableHead className="w-[37%]">Title</TableHead>
            <TableHead className="w-[20%]">Description</TableHead>
            <TableHead className="w-[15%]">Status</TableHead>
            <TableHead className="w-[15%]">Priority</TableHead>
            <TableHead className="w-[10%]">Due Date</TableHead>
          </TableRow>
        </SubtaskTableHeader>
        <TableBody>
          {subtasks.map((subtask, index) => (
            <SubtaskTableRow
              key={subtask.id}
              status={subtask.status}
              parentStatus={parentTaskStatus}
              hasConnector={index === midIndex}
              isSingleSubtask={isSingleSubtask}
            >
              <TableCell className="text-sm">{subtask.title}</TableCell>
              <TableCell>
                <span>Description</span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status)}`}
                >
                  {getStatusLabel(subtask.status, true)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(subtask.priority)}`}
                >
                  {getPriorityLabel(subtask.priority, true)}
                </span>
              </TableCell>
              <TableCell>
                <span>Due Date</span>
              </TableCell>
            </SubtaskTableRow>
          ))}
          <AddTaskRow
            parentStatus={parentTaskStatus}
            onAddClick={() => console.warn('Add subtask clicked')}
            onAddTask={onAddSubtask}
          >
            + Add Subtask
          </AddTaskRow>
        </TableBody>
      </table>
    </SubtaskContainer>
  );
}

export default function TaskList() {
  const { data: tasksFromApi = [] } = useGetTasksQuery();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set(['task-1', 'task-2']));
  const [subtasksMap, setSubtasksMap] = useState<Record<string, Subtask[]>>(MOCK_SUBTASKS_MAP);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Use mock data if API data is empty, otherwise use API data
  const tasks = tasksFromApi.length > 0 ? tasksFromApi : MOCK_TASKS;

  // Sort tasks by deadline
  const filteredAndSortedTasks = sortTasksByDeadline([...tasks]);

  // Derived state for "Select All" logic
  const isAllSelected = useMemo(() => {
    return filteredAndSortedTasks.length > 0 && selectedIds.size === filteredAndSortedTasks.length;
  }, [selectedIds.size, filteredAndSortedTasks.length]);

  // Toggle single row selection
  const handleRowToggle = useCallback(
    (taskId: string) => {
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
    },
    [setSelectedIds]
  );

  // Toggle select all
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredAndSortedTasks.map((task) => task.id)));
    }
  }, [isAllSelected, filteredAndSortedTasks, setSelectedIds]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, [setSelectedIds]);

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    console.warn('Delete selected tasks:', Array.from(selectedIds));
    // TODO: Implement API call to delete tasks
    setSelectedIds(new Set());
  }, [selectedIds, setSelectedIds]);

  const handleBulkStatusChange = useCallback(
    (status: TaskStatus) => {
      console.warn('Change status to:', status, 'for tasks:', Array.from(selectedIds));
      // TODO: Implement API call to update task status
      setSelectedIds(new Set());
    },
    [selectedIds, setSelectedIds]
  );

  const handleBulkPriorityChange = useCallback(
    (priority: TaskPriority) => {
      console.warn('Change priority to:', priority, 'for tasks:', Array.from(selectedIds));
      // TODO: Implement API call to update task priority
      setSelectedIds(new Set());
    },
    [selectedIds, setSelectedIds]
  );

  // Toggle subtask expansion state
  const toggleExpanded = useCallback(
    (taskId: string) => {
      setExpandedTasks((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
    },
    [setExpandedTasks]
  );

  // Get subtasks for a task ID
  const getSubtasks = (taskId: string): Subtask[] => {
    return subtasksMap[taskId] || [];
  };

  // Handle adding a new subtask with immutable state update
  const handleAddSubtask = useCallback(
    (parentTaskId: string, title: string) => {
      setSubtasksMap((prev) => {
        const subtasks = prev[parentTaskId] || [];
        const newSubtask: Subtask = {
          id: `sub-${parentTaskId}-${subtasks.length + 1}`,
          title,
          status: 'TODO',
          priority: 'MEDIUM',
        };

        return {
          ...prev,
          [parentTaskId]: [...(prev[parentTaskId] || []), newSubtask],
        };
      });
    },
    [setSubtasksMap]
  );

  return (
    <div className="w-full min-h-screen bg-background pb-24 lg:pb-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Task List</h1>

        {/* Task Table */}
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No tasks available</p>
          </div>
        ) : (
          <div>
            <Table className="border-l-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%] ps-0 text-center">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all tasks"
                    />
                  </TableHead>
                  <TableHead className="w-[36%]">Title</TableHead>
                  <TableHead className="w-[20%]">Description</TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%]">Priority</TableHead>
                  <TableHead className="w-[10%]">Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task: Task) => {
                  const subtasks = getSubtasks(task.id);
                  const isExpanded = expandedTasks.has(task.id);
                  const hasSubtasks = subtasks.length > 0;

                  return (
                    <>
                      {/* Parent Task Row - Neobrutalism with primary sidebar border */}
                      <ExpandableTaskRow
                        hasSubtasks={hasSubtasks}
                        isExpanded={isExpanded}
                        onToggleSubtasks={() => toggleExpanded(task.id)}
                        status={task.status}
                        isSelected={selectedIds.has(task.id)}
                        onSelectionChange={() => handleRowToggle(task.id)}
                        titleContent={
                          <span className="font-semibold text-gray-900">{task.title}</span>
                        }
                        actionContent={
                          <>
                            <TableCell className="text-gray-600 truncate">
                              {task.description ?? '-'}
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}
                              >
                                {getStatusLabel(task.status)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                              >
                                {getPriorityLabel(task.priority)}
                              </span>
                            </TableCell>
                            <TableCell>
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString('vi-VN')
                                : '-'}
                            </TableCell>
                          </>
                        }
                      />

                      {/* Subtasks Container - L-shaped visual connectors */}
                      {hasSubtasks && isExpanded && (
                        <TableRow className={'border-b-0 border-l-1 p-0'}>
                          <TableCell
                            colSpan={7}
                            className={cn(
                              'p-0 border-r-0',
                              getStatusBorderColors(task.status).borderLeft
                            )}
                          >
                            <SubtaskList
                              subtasks={subtasks}
                              parentTaskStatus={task.status}
                              onAddSubtask={(title) => handleAddSubtask(task.id, title)}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  );
                })}
                <AddTaskRow onAddClick={() => console.warn('Add subtask clicked')}>
                  + Add Subtask
                </AddTaskRow>
              </TableBody>
            </Table>
          </div>
        )}

        {/* Bulk Actions Bar */}
        <BulkActions
          selectedCount={selectedIds.size}
          onDelete={handleBulkDelete}
          onStatusChange={handleBulkStatusChange}
          onPriorityChange={handleBulkPriorityChange}
          onClearSelection={handleClearSelection}
        />
      </div>
    </div>
  );
}
