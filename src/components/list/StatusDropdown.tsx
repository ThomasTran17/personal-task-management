import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { TaskStatus } from '@/types';

interface StatusDropdownProps {
  status: TaskStatus;
  getStatusColor: (status: TaskStatus) => string;
  getStatusLabel: (status: TaskStatus) => string;
  onStatusChange: (status: TaskStatus) => void;
  disabled?: boolean;
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'TODO', label: 'To Do' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'DONE', label: 'Done' },
];

export function StatusDropdown({
  status,
  getStatusColor,
  getStatusLabel,
  onStatusChange,
  disabled = false,
}: StatusDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${getStatusColor(status)}`}
        >
          {getStatusLabel(status)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="bg-background"
            onClick={() => !disabled && onStatusChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
