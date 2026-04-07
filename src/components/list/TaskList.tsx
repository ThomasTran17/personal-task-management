import React, { useState, useCallback, useMemo } from 'react';
import { Edit2, Trash2 } from 'lucide-react';
import { useAddTaskMutation, useAddSubtaskMutation, useUpdateTaskMutation } from '@/api';
import type { TaskPriority, TaskStatus } from '@/types';
import type { Task } from '@/types/task';
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';
import { cn, sortTasksByDeadline, formatISODateString, isDateOverdue } from '@/lib';
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
import { getStatusColor as getBorderColor } from '@/components/tasks/task-status-colors';
import { ParticipantsDisplay } from './ParticipantsDisplay';

interface TaskListProps {
  tasks: readonly Task[];
  isLoading?: boolean;
  error?: FetchBaseQueryError | SerializedError;
  searchQuery: string;
  filterStatus: TaskStatus | 'all';
  filterPriority: TaskPriority | 'all';
  onFilterStatusChange?: (status: TaskStatus | 'all') => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (task: Task) => void;
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

// SubtaskList Component - Renders nested subtasks directly from task data
interface SubtaskListProps {
  subtasks: readonly Task[];
  parentTaskStatus: TaskStatus;
  _parentTaskId: string;
  onAddSubtask: (title: string) => void;
  selectedIds: Set<string>;
  onSubtaskToggle: (subtaskId: string) => void;
  onSelectAllSubtasks: () => void;
  onUpdateParticipants?: (taskId: string, participantIds: string[]) => void;
  onEditSubtask?: (subtask: Task) => void;
  onDeleteSubtask?: (subtask: Task) => void;
}

function SubtaskList({
  subtasks,
  parentTaskStatus,
  _parentTaskId,
  onAddSubtask,
  selectedIds,
  onSubtaskToggle,
  onSelectAllSubtasks,
  onUpdateParticipants,
  onEditSubtask,
  onDeleteSubtask,
}: SubtaskListProps) {
  const midIndex = (subtasks.length - 1) >> 1;
  const isSingleSubtask = subtasks.length === 1;

  return (
    <SubtaskContainer>
      <table className="w-full border-separate border-spacing-0 table-fixed bg-secondary-background">
        <SubtaskTableHeader parentStatus={parentTaskStatus}>
          <TableRow>
            <TableHead
              className={cn(
                'align-middle',
                'border-r-5 first:border-l-0 first:border-t-0 bg-background',
                'p-0',
                getStatusBorderColors(parentTaskStatus).borderRight,
                'w-[5%]'
              )}
            />
            {/* Checkbox column header */}
            <TableHead className="w-[5%] ps-0 text-center">
              <Checkbox
                checked={
                  subtasks.length > 0 && subtasks.every((subtask) => selectedIds.has(subtask.id))
                }
                onCheckedChange={onSelectAllSubtasks}
                aria-label="Select all subtasks"
              />
            </TableHead>
            <TableHead className="w-[29.9%]">Title</TableHead>
            <TableHead className="w-[20%]">Participants</TableHead>
            <TableHead className="w-[12%]">Status</TableHead>
            <TableHead className="w-[15%]">Due Date</TableHead>
            <TableHead className="w-[13%] last:rounded-tr-none">Priority</TableHead>
          </TableRow>
        </SubtaskTableHeader>
        <TableBody>
          {subtasks.map((subtask, index) => (
            <SubtaskTableRow
              key={subtask.id}
              status={subtask.status as TaskStatus}
              parentStatus={parentTaskStatus}
              hasConnector={index === midIndex}
              isSingleSubtask={isSingleSubtask}
              isSelected={selectedIds.has(subtask.id)}
              onSelectionChange={() => onSubtaskToggle(subtask.id)}
            >
              <TableCell className="text-sm">
                <div className="flex items-center justify-start gap-2 group">
                  <span className="truncate">{subtask.title}</span>
                  <div className="lg:hidden group-hover:block flex items-center gap-2">
                    <button
                      onClick={() => onEditSubtask?.(subtask)}
                      className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-colors"
                      title="Edit subtask"
                      aria-label="Edit subtask"
                    >
                      <Edit2 className="size-4" />
                    </button>
                    <button
                      onClick={() => onDeleteSubtask?.(subtask)}
                      className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-colors"
                      title="Delete subtask"
                      aria-label="Delete subtask"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-gray-600 text-sm">
                <ParticipantsDisplay
                  participantIds={subtask.participantIds}
                  isEditable={true}
                  onParticipantsChange={(participantIds) =>
                    onUpdateParticipants?.(subtask.id, participantIds)
                  }
                />
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(subtask.status as TaskStatus)}`}
                >
                  {getStatusLabel(subtask.status as TaskStatus, true)}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={cn(
                    'inline-block text-xs font-medium',
                    isDateOverdue(subtask.dueDate) && 'text-red-600 font-semibold'
                  )}
                >
                  {subtask.dueDate ? formatISODateString(subtask.dueDate, 'dd/mm/yyyy') : '-'}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(subtask.priority as TaskPriority)}`}
                >
                  {getPriorityLabel(subtask.priority as TaskPriority, true)}
                </span>
              </TableCell>
            </SubtaskTableRow>
          ))}
          <AddTaskRow parentStatus={parentTaskStatus} onAddTask={onAddSubtask}>
            + Add Subtask
          </AddTaskRow>
        </TableBody>
      </table>
    </SubtaskContainer>
  );
}

export default function TaskList({
  tasks,
  isLoading = false,
  error,
  searchQuery,
  filterStatus,
  filterPriority,
  onEditTask,
  onDeleteTask,
}: TaskListProps) {
  const [addTask] = useAddTaskMutation();
  const [addSubtask] = useAddSubtaskMutation();
  const [updateTask] = useUpdateTaskMutation();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Filter tasks based on search query, status, and priority
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchQuery, filterStatus, filterPriority]);

  // Sort tasks by deadline - MUST be memoized to prevent ref cleanup loops
  const filteredAndSortedTasks = useMemo(() => {
    return sortTasksByDeadline([...filteredTasks]);
  }, [filteredTasks]);

  // Build parentToChildren mapping from nested subtasks
  const parentToChildrenMap = useMemo(() => {
    const mapping: Record<string, string[]> = {};
    filteredAndSortedTasks.forEach((task) => {
      mapping[task.id] = task.subtasks?.map((st: Task) => st.id) ?? [];
    });
    return mapping;
  }, [filteredAndSortedTasks]);

  // Calculate total visible count: parents + all visible children
  const totalVisibleCount = useMemo(() => {
    const parentCount = filteredAndSortedTasks.length;
    const childrenCount = Object.values(parentToChildrenMap).reduce(
      (sum, children) => sum + children.length,
      0
    );
    return parentCount + childrenCount;
  }, [filteredAndSortedTasks, parentToChildrenMap]);

  // Derived state: isAllSelected compares total visible count with selected count (Full-Tree)
  // Using selectedIds.size for comparison to avoid stale closure in callbacks
  const isAllSelected = selectedIds.size > 0 && selectedIds.size === totalVisibleCount;

  // Full-Tree Select All: Toggle ALL visible rows (Parents + Subtasks)
  const handleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      // Calculate whether all are selected based on current state
      const allSelected = prev.size > 0 && prev.size === totalVisibleCount;

      if (allSelected) {
        return new Set();
      }

      // Build set of all visible IDs: parents + all children
      const next = new Set<string>();
      filteredAndSortedTasks.forEach((task) => {
        next.add(task.id);
        const children = parentToChildrenMap[task.id];
        if (children) {
          children.forEach((childId) => next.add(childId));
        }
      });
      return next;
    });
  }, [totalVisibleCount, filteredAndSortedTasks, parentToChildrenMap]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  // Bulk actions
  const handleBulkDelete = useCallback(() => {
    console.warn('Delete selected tasks:', Array.from(selectedIds));
    // TODO: Implement API call to delete tasks
    setSelectedIds(new Set());
  }, [selectedIds]);

  const handleBulkStatusChange = useCallback(
    (status: TaskStatus) => {
      console.warn('Change status to:', status, 'for tasks:', Array.from(selectedIds));
      // TODO: Implement API call to update task status
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const handleBulkPriorityChange = useCallback(
    (priority: TaskPriority) => {
      console.warn('Change priority to:', priority, 'for tasks:', Array.from(selectedIds));
      // TODO: Implement API call to update task priority
      setSelectedIds(new Set());
    },
    [selectedIds]
  );

  const handleUpdateParticipants = useCallback(
    (taskId: string, participantIds: string[]) => {
      void (async () => {
        try {
          await updateTask({
            id: taskId,
            updates: {
              participantIds: participantIds.length > 0 ? participantIds : undefined,
            },
          }).unwrap();
        } catch (error) {
          console.error('Failed to update participants:', error);
        }
      })();
    },
    [updateTask]
  );

  // Toggle subtask expansion state
  const toggleExpanded = useCallback((taskId: string) => {
    setExpandedTasks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  }, []);

  // Handle adding a new subtask with API call
  const handleAddSubtask = useCallback(
    (parentTaskId: string, title: string) => {
      if (!title.trim()) return;

      addSubtask({
        parentId: parentTaskId,
        payload: {
          title: title.trim(),
          description: '',
          status: 'TODO',
          priority: 'MEDIUM',
        },
      })
        .unwrap()
        .catch((err) => {
          console.error('Failed to create subtask:', err);
        });
    },
    [addSubtask]
  );

  // Handle opening subtask input
  const handleOpenSubtaskInput = useCallback((parentTaskId: string) => {
    setExpandedTasks((prev) => new Set(prev).add(parentTaskId));
  }, []);

  // Handle adding a new parent task
  const handleAddTask = useCallback(
    (title: string) => {
      if (!title.trim()) return;

      addTask({
        title: title.trim(),
        description: '',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: new Date(new Date().setDate(new Date().getDate() + 7)).toISOString(), // Default to 7 days from now
      })
        .unwrap()
        .catch((err) => {
          console.error('Failed to create task:', err);
        });
    },
    [addTask]
  );

  // TOP-DOWN SYNC: Parent toggle syncs all visible children (View-Driven)
  // Pattern: Only operate on selectedIds Set (No separate subtask state)
  const handleParentSelectionChange = useCallback(
    (taskId: string, isChecking: boolean) => {
      setSelectedIds((prev) => {
        const visibleChildren = parentToChildrenMap[taskId] || [];
        const next = new Set(prev);

        if (isChecking) {
          // Add parent + all visible children
          next.add(taskId);
          visibleChildren.forEach((id) => next.add(id));
        } else {
          // Remove parent + all visible children
          next.delete(taskId);
          visibleChildren.forEach((id) => next.delete(id));
        }
        return next;
      });
    },
    [parentToChildrenMap]
  );

  // INDEPENDENT: Child toggle does NOT affect parent (No Bottom-Up sync)
  // Pattern: Only operate on selectedIds Set
  const handleSubtaskToggle = useCallback((_parentId: string, subtaskId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(subtaskId)) {
        next.delete(subtaskId);
      } else {
        next.add(subtaskId);
      }
      return next;
    });
  }, []);

  // Select/Deselect all visible subtasks under parent (header checkbox, View-Driven)
  // Pattern: Only operate on selectedIds Set
  const handleSelectAllSubtasks = useCallback((_parentId: string, subtasks: readonly Task[]) => {
    const subtaskIds = subtasks.map((s) => s.id);

    setSelectedIds((prev) => {
      const next = new Set(prev);
      const currentSelection = new Set(subtaskIds.filter((id) => next.has(id)));
      const isAllSelected = subtasks.length > 0 && currentSelection.size === subtasks.length;

      if (isAllSelected) {
        subtaskIds.forEach((id) => next.delete(id));
      } else {
        subtaskIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const getCurrentStatus: () => TaskStatus = useCallback(() => {
    if (tasks.every((task: Task) => task.status === 'DONE')) {
      return 'DONE';
    }
    return 'IN_PROGRESS';
  }, [tasks]);

  return (
    <div className="w-full min-h-screen bg-background pb-24">
      <div className="max-w-7xl mx-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">Loading tasks...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12 bg-red-50 rounded-lg border border-red-200">
            <p className="text-red-600 text-lg">Failed to load tasks. Please try again later.</p>
          </div>
        )}

        {/* Task Table */}
        {!isLoading && !error && filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <p className="text-gray-500 text-lg">No tasks available</p>
          </div>
        ) : !isLoading && !error ? (
          <div>
            <Table className="border-l-0">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[5%] ps-0 text-center relative border-l-0 overflow-visible">
                    <div
                      className={cn(
                        getBorderColor(getCurrentStatus()).background,
                        'absolute -left-[3px] -top-[1px] bottom-0 w-[5px] h-[50px]'
                      )}
                    />
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all tasks"
                    />
                  </TableHead>
                  <TableHead className="w-[35%]">Title</TableHead>
                  <TableHead className="w-[20%]">Participants</TableHead>
                  <TableHead className="w-[12%]">Status</TableHead>
                  <TableHead className="w-[15%]">Due Date</TableHead>
                  <TableHead className="w-[13%]">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedTasks.map((task: Task) => {
                  const subtasksData = task.subtasks ?? [];
                  const isExpanded = expandedTasks.has(task.id);
                  const hasSubtasks = subtasksData.length > 0;

                  return (
                    <React.Fragment key={task.id}>
                      {/* Parent Task Row - Neobrutalism with primary sidebar border */}
                      <ExpandableTaskRow
                        hasSubtasks={hasSubtasks}
                        isExpanded={isExpanded}
                        onToggleSubtasks={() => toggleExpanded(task.id)}
                        onAddSubtask={() => handleOpenSubtaskInput(task.id)}
                        status={task.status}
                        isSelected={selectedIds.has(task.id)}
                        onSelectionChange={() => {
                          const isCurrentlySelected = selectedIds.has(task.id);
                          handleParentSelectionChange(task.id, !isCurrentlySelected);
                        }}
                        titleContent={task.title}
                        onEditTask={() => onEditTask?.(task)}
                        onDeleteTask={() => onDeleteTask?.(task)}
                        actionContent={
                          <>
                            <TableCell className="text-gray-600 text-sm">
                              <ParticipantsDisplay
                                participantIds={task.participantIds}
                                isEditable={true}
                                onParticipantsChange={(participantIds) =>
                                  handleUpdateParticipants(task.id, participantIds)
                                }
                              />
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
                                className={cn(
                                  'inline-block text-sm font-medium',
                                  isDateOverdue(task.dueDate) && 'text-red-600 font-semibold'
                                )}
                              >
                                {task.dueDate
                                  ? formatISODateString(task.dueDate, 'dd/mm/yyyy')
                                  : '-'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span
                                className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}
                              >
                                {getPriorityLabel(task.priority)}
                              </span>
                            </TableCell>
                          </>
                        }
                      />

                      {/* Subtasks Container - L-shaped visual connectors */}
                      {isExpanded && (
                        <TableRow className={'border-b-0 border-l-1 p-0'}>
                          <TableCell
                            colSpan={7}
                            className={cn(
                              'p-0 border-r-0',
                              getStatusBorderColors(task.status).borderLeft
                            )}
                          >
                            <SubtaskList
                              subtasks={subtasksData}
                              parentTaskStatus={task.status}
                              _parentTaskId={task.id}
                              onAddSubtask={(title: string) => handleAddSubtask(task.id, title)}
                              selectedIds={selectedIds}
                              onSubtaskToggle={(subtaskId: string) =>
                                handleSubtaskToggle(task.id, subtaskId)
                              }
                              onSelectAllSubtasks={() =>
                                handleSelectAllSubtasks(task.id, subtasksData)
                              }
                              onUpdateParticipants={handleUpdateParticipants}
                              onEditSubtask={onEditTask}
                              onDeleteSubtask={onDeleteTask}
                            />
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })}
                <AddTaskRow onAddTask={handleAddTask} status={getCurrentStatus()}>
                  + Add Task
                </AddTaskRow>
              </TableBody>
            </Table>
          </div>
        ) : null}

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
