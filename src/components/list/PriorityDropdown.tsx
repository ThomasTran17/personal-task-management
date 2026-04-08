import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import type { TaskPriority } from '@/types';

interface PriorityDropdownProps {
  priority: TaskPriority;
  getPriorityColor: (priority: TaskPriority) => string;
  getPriorityLabel: (priority: TaskPriority) => string;
  onPriorityChange: (priority: TaskPriority) => void;
  disabled?: boolean;
}

const PRIORITY_OPTIONS: { value: TaskPriority; label: string }[] = [
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export function PriorityDropdown({
  priority,
  getPriorityColor,
  getPriorityLabel,
  onPriorityChange,
  disabled = false,
}: PriorityDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          disabled={disabled}
          className={`inline-block px-3 py-1 rounded-full text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed ${getPriorityColor(priority)}`}
        >
          {getPriorityLabel(priority)}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background">
        {PRIORITY_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="bg-background"
            onClick={() => !disabled && onPriorityChange(option.value)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
