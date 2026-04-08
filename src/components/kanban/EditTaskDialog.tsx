import { useState, useEffect, useCallback } from 'react';
import type { EditorConfig } from '@satek-vn/react-editor';
import { Editor } from '@satek-vn/react-editor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  DatePicker,
} from '@/components';
import { ParticipantsDisplay } from '@/components/list';
import { SubtaskList } from '@/components/kanban';
import { useFormValidation } from '@/hooks';
import { useUpdateTaskMutation, canUpdateTask } from '@/api';
import { useGetProfileQuery } from '@/api/services/authApi';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { cn } from '@/lib';

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  parentTask?: Task | null;
}

const STATUS_OPTIONS = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
] as const;

const descriptionEditorConfig: EditorConfig = {
  placeholder: 'Enter task description (optional)',
  menubar: [
    'bold',
    'italic',
    'underline',
    'strike',
    '',
    'bullet-list',
    'ordered-list',
    '',
    'text-align',
    '',
    'link',
  ],
  uploadImage: async (files) => {
    return await Promise.resolve(Array.from(files).map((file) => URL.createObjectURL(file)));
  },
  popupLink: (previousUrl, submit) => {
    const url = window.prompt('URL', previousUrl);
    if (url === null) {
      return;
    }
    submit(url);
  },
};

export default function EditTaskDialog({
  isOpen,
  onOpenChange,
  task,
  parentTask: parentTaskProp,
}: EditTaskDialogProps) {
  const [prevTaskId, setPrevTaskId] = useState<string | null>(null);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  const [parentTask, setParentTask] = useState<Task | null>(parentTaskProp ?? null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [updateTask] = useUpdateTaskMutation();
  const { errors, validateForm, clearErrors, validateField } = useFormValidation();

  // Get current user for permission checks
  const { data: currentUser, isLoading: isLoadingProfile } = useGetProfileQuery();

  // Check edit permissions
  // currentUser.id is guaranteed to exist when not loading (checked in guards)
  const canUpdate =
    !isLoadingProfile && currentUser && currentTask
      ? canUpdateTask(currentTask, currentUser.id)
      : false;

  // Initialize with parent task
  if (task && task.id !== prevTaskId) {
    setCurrentTask(task);
    // Use provided parentTask or default to task itself if it's a parent task
    setParentTask(parentTaskProp ?? task);
    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ?? null);
    setParticipantIds(task.participantIds ?? []);
    setSubtasks(task.subtasks ?? []);
    setPrevTaskId(task.id);

    setTouched({});
  } else if (parentTaskProp && parentTask?.id !== parentTaskProp.id) {
    // Update parentTask if provided prop changes
    setParentTask(parentTaskProp);
  }

  // Initialize form with task data
  useEffect(() => {
    if (task && isOpen) {
      clearErrors();
    }
  }, [task, isOpen, clearErrors]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      onOpenChange(open);
    },
    [onOpenChange]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTask) return;

    const isValid = validateForm({ title, description });
    if (!isValid) return;

    void (async () => {
      try {
        // If editing a subtask, update parent task with modified subtasks
        if (parentTask && currentTask.id !== parentTask.id) {
          const updatedSubtasks =
            parentTask.subtasks?.map((st) =>
              st.id === currentTask.id
                ? {
                    ...currentTask,
                    title: title.trim(),
                    description: description.trim() || undefined,
                    status,
                    priority,
                    dueDate: dueDate ?? undefined,
                    participantIds: participantIds.length > 0 ? participantIds : undefined,
                  }
                : st
            ) ?? [];

          await updateTask({
            id: parentTask.id,
            updates: {
              subtasks: updatedSubtasks,
            },
          }).unwrap();
        } else {
          // Editing parent task
          await updateTask({
            id: currentTask.id,
            updates: {
              title: title.trim(),
              description: description.trim() || undefined,
              status,
              priority,
              dueDate: dueDate ?? undefined,
              participantIds: participantIds.length > 0 ? participantIds : undefined,
              subtasks: subtasks.length > 0 ? subtasks : undefined,
            },
          }).unwrap();
        }

        onOpenChange(false);
        setPrevTaskId(currentTask.id);
      } catch (error) {
        console.error('Failed to update task:', error);
      }
    })();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
    validateField('title', title);
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }));
    validateField('description', description);
  };

  const handleSubtaskClick = (subtask: Task) => {
    // Save current task state
    if (currentTask) {
      const updatedSubtasks = (parentTask?.subtasks ?? []).map((st) =>
        st.id === currentTask.id
          ? {
              ...currentTask,
              title,
              description,
              status,
              priority,
              dueDate: dueDate ?? undefined,
              participantIds,
              subtasks,
            }
          : st
      );
      setParentTask((prev) => (prev ? { ...prev, subtasks: updatedSubtasks } : null));
    }

    // Load subtask data
    setCurrentTask(subtask);
    setTitle(subtask.title);
    setDescription(subtask.description ?? '');
    setStatus(subtask.status);
    setPriority(subtask.priority);
    setDueDate(subtask.dueDate ?? null);
    setParticipantIds(subtask.participantIds ?? []);
    setSubtasks(subtask.subtasks ?? []);
    setTouched({});
  };

  const handleBackToParent = () => {
    if (!parentTask) return;

    // Save current subtask changes
    if (currentTask && currentTask.id !== parentTask.id) {
      const updatedSubtasks = (parentTask?.subtasks ?? []).map((st) =>
        st.id === currentTask.id
          ? {
              ...currentTask,
              title,
              description,
              status,
              priority,
              dueDate: dueDate ?? undefined,
              participantIds,
              subtasks,
            }
          : st
      );
      setParentTask((prev) => (prev ? { ...prev, subtasks: updatedSubtasks } : null));
    }

    // Load parent task data
    setCurrentTask(parentTask);
    setTitle(parentTask.title);
    setDescription(parentTask.description ?? '');
    setStatus(parentTask.status);
    setPriority(parentTask.priority);
    setDueDate(parentTask.dueDate ?? null);
    setParticipantIds(parentTask.participantIds ?? []);
    setSubtasks(parentTask.subtasks ?? []);
    setTouched({});
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[50vw] sm:max-h-[95vh] overflow-auto [&::-webkit-scrollbar]:!w-0">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              placeholder="Enter task title"
              disabled={!canUpdate}
              className={`w-full px-3 py-2 border-2 rounded-base bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                touched.title && errors.title ? 'border-red-500' : 'border-border'
              }`}
            />
            {touched.title && errors.title && (
              <p className="text-sm text-red-500 font-medium">{errors.title}</p>
            )}
          </div>

          {/* Status and Priority - Same Parent */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={status}
                onValueChange={(value) => setStatus(value as TaskStatus)}
                disabled={!canUpdate}
              >
                <SelectTrigger className="bg-main-light disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority Select */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select
                value={priority}
                onValueChange={(value) => setPriority(value as TaskPriority)}
                disabled={!canUpdate}
              >
                <SelectTrigger className="bg-main-light disabled:opacity-50 disabled:cursor-not-allowed">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map(({ value, label }) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Deadline and Participants - Same Parent */}
          <div className="flex flex-row justify-between gap-4">
            {/* Due Date Input */}
            <div
              className={cn(
                'w-[60%] flex flex-col',
                !canUpdate && 'opacity-50 pointer-events-none'
              )}
            >
              <label className="text-sm font-medium">Deadline</label>
              <DatePicker
                value={dueDate}
                onDateChange={setDueDate}
                placeholder="Select deadline date and time"
                withTime={true}
                className="bg-background"
                side="right"
                align="center"
                sideOffset={-200}
              />
            </div>

            {/* Participants Select */}
            <div className="w-[40%] flex flex-col">
              <label className="text-sm font-medium">Participants</label>
              <ParticipantsDisplay
                participantIds={participantIds}
                onParticipantsChange={setParticipantIds}
                isEditable={canUpdate}
                hasBorder={true}
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <div
              className={`border-2 rounded-base overflow-hidden transition-colors ${
                touched.description && errors.description ? 'border-red-500' : 'border-border'
              } ${!canUpdate ? 'opacity-50 pointer-events-none' : ''}`}
              onBlur={handleDescriptionBlur}
            >
              <Editor
                config={descriptionEditorConfig}
                value={description}
                onChange={setDescription}
              />
            </div>
            {touched.description && errors.description && (
              <p className="text-sm text-red-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Subtasks Section - Only show for parent tasks (not subtasks) */}
          {!currentTask?.parentId && (
            <div className={canUpdate ? '' : 'opacity-50 pointer-events-none'}>
              <SubtaskList
                subtasks={subtasks}
                onSubtasksChange={setSubtasks}
                onSubtaskClick={handleSubtaskClick}
              />
            </div>
          )}

          {/* Back Button - Show when editing subtask */}
          {currentTask && parentTask && currentTask.id !== parentTask.id && (
            <button
              type="button"
              onClick={handleBackToParent}
              className="w-full px-3 py-2 text-sm font-medium rounded-base transition-colors border border-border hover:bg-main-light/50"
            >
              ← Back to Parent Task: {parentTask.title}
            </button>
          )}

          {/* Dialog Footer */}
          <DialogFooter className="gap-2">
            <Button type="button" onClick={handleCancel} variant="neutral">
              Cancel
            </Button>
            <Button type="submit" variant="default" disabled={!canUpdate}>
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
