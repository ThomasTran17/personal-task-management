'use client';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, TaskStatus } from '@/types/task';
import TaskCard from '@/components/kanban/TaskCard';

interface KanbanColumnProps {
  status: TaskStatus;
  label: string;
  bgColor: string;
  tasks: Task[];
  onDeleteTask: (id: string) => void;
}

export default function KanbanColumn({
  status,
  label,
  bgColor,
  tasks,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className={`${bgColor} border-2 border-border rounded-t-lg p-4 font-bold text-foreground`}>
        <div className="flex items-center justify-between">
          <span className="text-lg">{label}</span>
          <span className="bg-foreground text-background px-3 py-1 rounded-full text-sm font-bold">
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks Container */}
      <div className="flex-1 bg-secondary-background border-2 border-t-0 border-border rounded-b-lg p-4 space-y-3 overflow-y-auto">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={onDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
