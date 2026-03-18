'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Task } from '@/types/task';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-blue-100 text-blue-800 border-blue-300',
  medium: 'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteConfirm = () => {
    onDelete(task.id);
    setIsDeleteDialogOpen(false);
  };

  return (
    <>
      <Card className="bg-background border-2 border-border shadow-shadow hover:shadow-md transition-shadow p-4">
        {/* Task Title */}
        <h3 className="font-bold text-foreground mb-3 break-words text-sm leading-snug">
          {task.title}
        </h3>

        {/* Task Description */}
        {task.description && (
          <p className="text-xs text-foreground/60 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Task Meta */}
        <div className="flex items-center justify-between gap-2">
          {/* Priority Badge */}
          <span
            className={cn(
              'text-xs font-semibold px-2 py-1 rounded border',
              priorityColors[task.priority]
            )}
          >
            {task.priority.toUpperCase()}
          </span>

          {/* Delete Button */}
          <Button
            onClick={() => setIsDeleteDialogOpen(true)}
            variant="neutral"
            size="icon"
            className="size-8 p-0 hover:bg-red-100"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task ?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex justify-end gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
