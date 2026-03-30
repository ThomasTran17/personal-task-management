import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormValidation } from '@/hooks/useFormValidation';
import { useTaskStore } from '@/store/taskStore';
import { TaskStatus, TaskPriority } from '@/types/task';
import DatePicker from '@/components/ui/date-picker';

interface AddTaskDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const INITIAL_FORM_STATE = {
  title: '',
  description: '',
  status: 'todo' as TaskStatus,
  priority: 'medium' as TaskPriority,
  dueDate: null as Date | null,
};

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
] as const;

const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

export default function AddTaskDialog({
  isOpen,
  onOpenChange,
}: AddTaskDialogProps) {
  const [title, setTitle] = useState(INITIAL_FORM_STATE.title);
  const [description, setDescription] = useState(INITIAL_FORM_STATE.description);
  const [status, setStatus] = useState(INITIAL_FORM_STATE.status);
  const [priority, setPriority] = useState(INITIAL_FORM_STATE.priority);
  const [dueDate, setDueDate] = useState<Date | null>(INITIAL_FORM_STATE.dueDate);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const { addTask } = useTaskStore();
  const { errors, validateForm, clearErrors, validateField } = useFormValidation();

  const resetForm = useCallback(() => {
    setTitle(INITIAL_FORM_STATE.title);
    setDescription(INITIAL_FORM_STATE.description);
    setStatus(INITIAL_FORM_STATE.status);
    setPriority(INITIAL_FORM_STATE.priority);
    setDueDate(INITIAL_FORM_STATE.dueDate);
    setTouched({});
    clearErrors();
  }, [clearErrors]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        resetForm();
      }
      onOpenChange(open);
    },
    [onOpenChange, resetForm]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const isValid = validateForm({ title, description });
    if (!isValid) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      status,
      priority,
      dueDate: dueDate || undefined,
    });

    resetForm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    resetForm();
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
      <DialogContent className="sm:max-w-[425px]">
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

          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={status} onValueChange={(value) => setStatus(value as TaskStatus)}>
              <SelectTrigger>
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

          {/* Due Date Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Deadline</label>
            <DatePicker
              value={dueDate}
              onDateChange={setDueDate}
              placeholder="Select deadline date and time"
              withTime={true}
            />
          </div>

          {/* Priority Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Priority</label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
              <SelectTrigger>
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

          {/* Dialog Footer */}
          <DialogFooter className="gap-2">
            <Button
              type="button"
              onClick={handleCancel}
              variant="neutral"
            >
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
