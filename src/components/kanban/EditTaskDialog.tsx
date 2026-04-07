import { useState, useEffect, useCallback } from 'react';
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
import { useFormValidation } from '@/hooks';
import { useUpdateTaskMutation } from '@/api';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface EditTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
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

export default function EditTaskDialog({ isOpen, onOpenChange, task }: EditTaskDialogProps) {
  const [prevTaskId, setPrevTaskId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [dueDate, setDueDate] = useState<string | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [updateTask] = useUpdateTaskMutation();
  const { errors, validateForm, clearErrors, validateField } = useFormValidation();

  if (task && task.id !== prevTaskId) {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setStatus(task.status);
    setPriority(task.priority);
    setDueDate(task.dueDate ?? null);
    setParticipantIds(task.participantIds ?? []);
    setPrevTaskId(task.id);

    setTouched({});
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
    if (!task) return;

    const isValid = validateForm({ title, description });
    if (!isValid) return;

    void (async () => {
      try {
        await updateTask({
          id: task.id,
          updates: {
            title: title.trim(),
            description: description.trim() || undefined,
            status,
            priority,
            dueDate: dueDate ?? undefined,
            participantIds: participantIds.length > 0 ? participantIds : undefined,
          },
        }).unwrap();

        onOpenChange(false);
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
              className={`w-full px-3 py-2 border-2 rounded-base bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors ${
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
              <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
                <SelectTrigger className="bg-main-light">
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
              >
                <SelectTrigger className="bg-main-light">
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
            <div className="w-[60%] flex flex-col">
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
                isEditable={true}
                hasBorder={true}
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              placeholder="Enter task description (optional)"
              className={`w-full px-3 py-2 border-2 rounded-base bg-background text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black resize-none transition-colors ${
                touched.description && errors.description ? 'border-red-500' : 'border-border'
              }`}
              rows={3}
            />
            {touched.description && errors.description && (
              <p className="text-sm text-red-500 font-medium">{errors.description}</p>
            )}
          </div>

          {/* Dialog Footer */}
          <DialogFooter className="gap-2">
            <Button type="button" onClick={handleCancel} variant="neutral">
              Cancel
            </Button>
            <Button type="submit" variant="default">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
