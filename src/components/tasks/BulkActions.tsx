import { Trash2, Edit2, MoreVertical } from 'lucide-react';
import { cn } from '@/lib';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

interface BulkActionsProps {
  selectedCount: number;
  onDelete?: () => void;
  onEdit?: () => void;
  onStatusChange?: (status: 'TODO' | 'IN_PROGRESS' | 'DONE') => void;
  onPriorityChange?: (priority: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onClearSelection?: () => void;
  className?: string;
}

export function BulkActions({
  selectedCount,
  onDelete,
  onEdit,
  onStatusChange,
  onPriorityChange,
  onClearSelection,
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      className={cn(
        'fixed bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-40',
        'bg-white border-2 border-black rounded-lg shadow-lg',
        'px-4 py-3 flex items-center justify-between gap-4',
        'max-w-md lg:max-w-lg w-[calc(100%-2rem)]',
        'animate-in fade-in slide-in-from-bottom-3 duration-200',
        className
      )}
    >
      {/* Selection Count */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">{selectedCount} selected</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Delete Button */}
        {onDelete && (
          <Button
            variant="neutral"
            size="sm"
            onClick={onDelete}
            className="hover:bg-red-100 hover:text-red-600 transition-colors"
            title="Delete selected tasks"
          >
            <Trash2 className="size-4" />
          </Button>
        )}

        {/* Edit Button */}
        {onEdit && (
          <Button
            variant="neutral"
            size="sm"
            onClick={onEdit}
            className="hover:bg-blue-100 hover:text-blue-600 transition-colors"
            title="Edit selected tasks"
          >
            <Edit2 className="size-4" />
          </Button>
        )}

        {/* More Options Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="neutral" size="sm" className="hover:bg-gray-100" title="More options">
              <MoreVertical className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* Status Change Options */}
            {onStatusChange && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-foreground/60">Status</div>
                <DropdownMenuItem onClick={() => onStatusChange('TODO')}>To Do</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('IN_PROGRESS')}>
                  In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('DONE')}>Done</DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            {/* Priority Change Options */}
            {onPriorityChange && (
              <>
                <div className="px-2 py-1.5 text-xs font-medium text-foreground/60">Priority</div>
                <DropdownMenuItem onClick={() => onPriorityChange('LOW')}>Low</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPriorityChange('MEDIUM')}>
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onPriorityChange('HIGH')}>High</DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Clear Selection */}
        {onClearSelection && (
          <Button
            variant="neutral"
            size="sm"
            onClick={onClearSelection}
            className="text-foreground/60 hover:text-foreground ml-1"
            title="Clear selection"
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}
