import { useState } from 'react';
import { cn } from '@/lib';
import type { Task } from '@/types';
import { Trash2 } from 'lucide-react';
import { Checkbox } from '../ui';

interface SubtaskListProps {
  subtasks: Task[];
  onSubtasksChange: (subtasks: Task[]) => void;
  onSubtaskClick: (subtask: Task) => void;
}

export default function SubtaskList({
  subtasks,
  onSubtasksChange,
  onSubtaskClick,
}: SubtaskListProps) {
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const handleAddSubtask = () => {
    if (!newSubtaskTitle.trim()) return;

    const newSubtask: Task = {
      id: `subtask-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      status: 'TODO',
      priority: 'MEDIUM',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ownerId: '', // Will be set by backend
      parentId: undefined, // Will be set when saved
    };

    onSubtasksChange([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const handleDeleteSubtask = (id: string) => {
    onSubtasksChange(subtasks.filter((subtask) => subtask.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Subtasks</label>
      </div>

      {/* Subtask List */}
      <div className="space-y-2">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className={cn(
              'flex items-center gap-3 px-2 py-2 h-14 rounded-base transition-colors group border border-table-border',
              'hover:bg-main-light relative'
            )}
          >
            {/* Title Content */}
            <div className="flex items-center flex-1 gap-2 truncate">
              <Checkbox
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSubtaskClick(subtask);
                }}
              />

              <span
                className={cn(
                  'flex-1 text-sm cursor-pointer hover:underline transition-all truncate',
                  'text-foreground'
                )}
                onClick={() => onSubtaskClick(subtask)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onSubtaskClick(subtask);
                  }
                }}
              >
                {subtask.title}
              </span>
            </div>

            {/* Delete Button - Hidden on mobile, visible on group hover */}
            <div className="flex items-center gap-2 flex-shrink-0 lg:hidden group-hover:flex">
              <button
                onClick={() => handleDeleteSubtask(subtask.id)}
                className={cn(
                  'inline-flex items-center justify-center w-6 h-6 flex-shrink-0',
                  'hover:bg-main/20 rounded-base transition-colors',
                  'text-red-500 hover:text-red-700'
                )}
                title="Delete subtask"
                aria-label="Delete subtask"
              >
                <Trash2 className="!size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Subtask Input */}
      <div className="flex gap-2 pt-2">
        <input
          type="text"
          value={newSubtaskTitle}
          onChange={(e) => setNewSubtaskTitle(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddSubtask();
            }
          }}
          placeholder="Add a new subtask..."
          className={cn(
            'flex-1 px-3 py-2 text-sm border border-border rounded-base',
            'bg-background placeholder:text-foreground/50',
            'focus:outline-none focus:ring-2 focus:ring-black'
          )}
        />
      </div>
    </div>
  );
}
