import { useState, useCallback } from 'react';
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
import { useAddTaskMutation } from '@/api';
import type { TaskStatus, TaskPriority } from '@/types';

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  status: 'TODO' as TaskStatus,
  priority: 'MEDIUM' as TaskPriority,
  dueDate: null as string | null,
};

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

export default function AddTaskDialog({ isOpen, onOpenChange }: AddTaskDialogProps) {
  const [title, setTitle] = useState(INITIAL_FORM_STATE.title);
  const [description, setDescription] = useState(INITIAL_FORM_STATE.description);
  const [status, setStatus] = useState(INITIAL_FORM_STATE.status);
  const [priority, setPriority] = useState(INITIAL_FORM_STATE.priority);
  const [dueDate, setDueDate] = useState<string | null>(INITIAL_FORM_STATE.dueDate);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [addTask] = useAddTaskMutation();
  const { errors, validateForm, clearErrors, validateField } = useFormValidation();

  const resetForm = useCallback(() => {
    setTitle(INITIAL_FORM_STATE.title);
    setDescription(INITIAL_FORM_STATE.description);
    setStatus(INITIAL_FORM_STATE.status);
    setPriority(INITIAL_FORM_STATE.priority);
    setDueDate(INITIAL_FORM_STATE.dueDate);
    setParticipantIds([]);
    setTouched({});
    clearErrors();
  }, [clearErrors]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setTimeout(resetForm, 300);
      }

      onOpenChange(open);
    },
    [onOpenChange, resetForm]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = validateForm({ title, description });
    if (!isValid) return;

    void (async () => {
      try {
        await addTask({
          title: title.trim(),
          description: description.trim() || undefined,
          priority,
          status,
          dueDate: dueDate ?? undefined,
          participantIds: participantIds.length > 0 ? participantIds : undefined,
        }).unwrap();

        onOpenChange(false);
      } catch (error) {
        console.error('Failed to add task:', error);
      }
    })();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleTitleBlur = () => {
    if (!isOpen) return;
    setTouched((prev) => ({ ...prev, title: true }));
    validateField('title', title);
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }));
    validateField('description', description);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[50vw] sm:max-h-[90vh] overflow-auto [&::-webkit-scrollbar]:!w-0">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
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
              Add Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
