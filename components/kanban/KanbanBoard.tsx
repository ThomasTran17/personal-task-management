'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';
import { Task, TaskStatus } from '@/types/task';
import { Plus, Trash2 } from 'lucide-react';
import KanbanColumn from '@/components/kanban/KanbanColumn';
import AddTaskDialog from '@/components/kanban/AddTaskDialog';

export default function KanbanBoard() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { tasks, deleteTask } = useTaskStore();

  const columns: { status: TaskStatus; label: string; bgColor: string }[] = [
    { status: 'todo', label: 'TO DO', bgColor: 'bg-red-100' },
    { status: 'in-progress', label: 'IN PROGRESS', bgColor: 'bg-yellow-100' },
    { status: 'done', label: 'DONE', bgColor: 'bg-green-100' },
  ];

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="w-full min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Kanban Board</h1>
            <p className="text-foreground/60">Manage your tasks efficiently</p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            variant="default"
            className="flex items-center gap-2"
          >
            <Plus className="size-5" />
            Add Task
          </Button>
        </div>

        {/* Kanban Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <KanbanColumn
              key={column.status}
              status={column.status}
              label={column.label}
              bgColor={column.bgColor}
              tasks={getTasksByStatus(column.status)}
              onDeleteTask={deleteTask}
            />
          ))}
        </div>
      </div>

      {/* Add Task Dialog */}
      <AddTaskDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
      />
    </div>
  );
}
