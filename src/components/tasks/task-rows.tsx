import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib';
import { useTaskInput } from '@/hooks/use-task-input';
import { TableCell } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import type { TaskStatus } from '@/types/task';
import { getStatusColor } from './task-status-colors';

// Subtask Table Row - with L-shaped connector visual
// CONNECTOR IMPLEMENTATION: Horizontal branch of L-shape
// The before:absolute pseudo-element creates the horizontal line connecting
// the vertical stem (at -left-6) to the subtask row at top-1/2 (vertical center)
interface SubtaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hasConnector?: boolean;
  isSingleSubtask?: boolean; // New prop to handle single subtask case
  status?: TaskStatus;
  parentStatus?: TaskStatus;
}

function SubtaskTableRowComponent({
  className,
  hasConnector = false,
  isSingleSubtask = false,
  status,
  parentStatus,
  children,
  ...props
}: SubtaskRowProps) {
  return (
    <tr
      className={cn('border-b-2 border-border transition-all hover:bg-main/10', className)}
      {...props}
    >
      <td
        className={cn(
          'align-middle truncate max-w-0 border-r-5 relative',
          getStatusColor(status).borderRight
        )}
      >
        {hasConnector && (
          <div
            className={cn(
              'absolute left-0 bottom-0 h-[1px] w-full',
              getStatusColor(parentStatus).background,
              isSingleSubtask && 'top-1/2 -translate-y-1/2'
            )}
          />
        )}
      </td>

      {children}
    </tr>
  );
}

export const SubtaskTableRow = React.memo(SubtaskTableRowComponent);

// Subtask Container with vertical connector stem
// CONNECTOR IMPLEMENTATION: Vertical stem of L-shape
// The before:absolute pseudo-element creates the vertical line connecting
// parent task to all subtasks in this container
interface SubtaskContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  parentStatus?: TaskStatus;
}

function SubtaskContainerComponent({ className, children, ...props }: SubtaskContainerProps) {
  return (
    <div className={cn('py-6', className)} {...props}>
      {children}
    </div>
  );
}

export const SubtaskContainer = React.memo(SubtaskContainerComponent);

// Expandable Task Row with toggle UI
// Primary Sidebar Implementation: border-s-[3px] creates prominent left border (Neubrutalism)
// This row represents the parent task and can expand/collapse its subtask container
// SLOT PATTERN: Strict type-safe API with explicit named slots
interface ExpandableTaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  onToggleSubtasks?: (expanded: boolean) => void;
  status?: TaskStatus;
  // Bulk Selection
  isSelected?: boolean;
  onSelectionChange?: () => void;
  // Slot Pattern - Explicit named slots for type-safety
  titleContent: React.ReactNode;
  actionContent?: React.ReactNode;
}

function ExpandableTaskRowComponent({
  className,
  hasSubtasks = false,
  isExpanded = false,
  onToggleSubtasks,
  status,
  isSelected = false,
  onSelectionChange,
  titleContent,
  actionContent,
  ...props
}: ExpandableTaskRowProps) {
  return (
    <tr
      className={cn(
        'border-y-1 border-table-border border-s-3 transition-all hover:bg-main/10 relative',
        className
      )}
      {...props}
    >
      {/* Checkbox cell - sticky for easy selection */}
      <TableCell className="ps-0 text-center">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label="Select task"
        />
      </TableCell>

      {/* Title cell with expand button */}
      <TableCell className={cn(getStatusColor(status).borderLeft)}>
        <div
          className={cn(
            getStatusColor(status).background,
            'absolute -left-[5px] top-0 bottom-0 w-[5px] h-[41px]'
          )}
        />
        <div className="flex items-center gap-2">
          {hasSubtasks && (
            <button
              onClick={() => onToggleSubtasks?.(!isExpanded)}
              className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-transform"
              style={{
                transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
              }}
            >
              <ChevronDown className="size-4" />
            </button>
          )}
          {titleContent}
        </div>
      </TableCell>
      {/* Action cells slot */}
      {actionContent}
    </tr>
  );
}

export const ExpandableTaskRow = React.memo(ExpandableTaskRowComponent);

// Subtask Header Row - smaller text and muted foreground
// Applied only when displaying subtask list headers (inside SubtaskContainer)
// Styling: text-xs + text-foreground/60 creates visual hierarchy differentiation from parent
interface SubtaskTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  parentStatus?: TaskStatus;
}

function SubtaskTableHeaderComponent({
  className,
  parentStatus,
  children,
  ...props
}: SubtaskTableHeaderProps) {
  return (
    <thead
      className={cn(
        'border border-border',
        'border-l-1 border-r-0',
        getStatusColor(parentStatus).borderLeft,
        'text-xs text-foreground/60',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

export const SubtaskTableHeader = React.memo(SubtaskTableHeaderComponent);

// Add Task Row - Styled like a subtask row with quick input functionality
// Footer Action: This row is placed at the bottom of subtask list
// Feature: Inline input for quick task title entry
interface AddTaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onAddClick?: () => void;
  onAddTask?: (title: string) => void;
  parentStatus?: TaskStatus;
}

function AddTaskRowComponent({
  className,
  onAddClick,
  onAddTask,
  parentStatus,
  children,
  ...props
}: AddTaskRowProps) {
  const {
    isEditing,
    inputValue,
    inputRef,
    handleClick,
    handleInputChange,
    handleSave,
    handleKeyDown,
  } = useTaskInput(onAddTask, onAddClick);

  return (
    <tr
      className={cn(
        'border-b-2 border-border border-s-3 transition-all hover:bg-main/10',
        getStatusColor(parentStatus).borderLeft,
        className
      )}
      {...props}
    >
      {parentStatus && (
        <td
          className={cn(
            'ps-4 pe-4 py-2 align-middle truncate max-w-0 border-r-5',
            getStatusColor(parentStatus).borderRight
          )}
        />
      )}
      <TableCell colSpan={6} className="ps-0 pe-0 border-b-1">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter task title..."
            className={cn(
              'w-full ps-4 pe-4 py-1 bg-transparent border-none outline-none text-foreground',
              'placeholder:text-foreground/50'
            )}
          />
        ) : (
          <div
            onClick={handleClick}
            className="w-full ps-4 pe-4 py-1 cursor-pointer text-foreground/60 hover:text-foreground transition-colors"
          >
            {children ?? '+ Add task'}
          </div>
        )}
      </TableCell>
    </tr>
  );
}

export const AddTaskRow = React.memo(AddTaskRowComponent);
