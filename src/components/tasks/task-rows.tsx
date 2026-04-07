import * as React from 'react';
import { ChevronDown, Edit2, Trash2, Plus } from 'lucide-react';
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
  isSelected?: boolean;
  onSelectionChange?: () => void;
}

function SubtaskTableRowComponent({
  className,
  hasConnector = false,
  isSingleSubtask = false,
  status,
  parentStatus,
  isSelected = false,
  onSelectionChange,
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
          'align-middle truncate max-w-0 border-r-5 relative bg-background',
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

      {/* NEW Checkbox TD - After Indent, before Content */}
      <td className="w-[5%] ps-0 text-center border-r-1 border-t-1 border-table-border">
        <Checkbox
          checked={isSelected}
          onCheckedChange={onSelectionChange}
          aria-label="Select subtask"
        />
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
type SubtaskContainerProps = React.HTMLAttributes<HTMLDivElement>;

function SubtaskContainerComponent({ className, children, ...props }: SubtaskContainerProps) {
  return (
    <div className={cn('py-6 bg-background', className)} {...props}>
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
  onAddSubtask?: () => void;
  status?: TaskStatus;
  // Bulk Selection
  isSelected?: boolean;
  onSelectionChange?: () => void;
  // Slot Pattern - Explicit named slots for type-safety
  titleContent: React.ReactNode;
  actionContent?: React.ReactNode;
  // Edit/Delete callbacks
  onEditTask?: () => void;
  onDeleteTask?: () => void;
  // Inline title editing support
  onSaveTitle?: (newTitle: string) => void;
}

function ExpandableTaskRowComponent({
  className,
  hasSubtasks = false,
  isExpanded = false,
  onToggleSubtasks,
  onAddSubtask,
  status,
  isSelected = false,
  onSelectionChange,
  titleContent,
  actionContent,
  onEditTask,
  onDeleteTask,
  onSaveTitle,
  ...props
}: ExpandableTaskRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editValue, setEditValue] = React.useState(titleContent as string);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  const handleStartQuickEdit = React.useCallback(() => {
    setIsEditing(true);
    setEditValue(titleContent as string);
    setTimeout(() => {
      inputRef.current?.select();
    }, 0);
  }, [titleContent]);

  const handleSaveQuickEdit = React.useCallback(() => {
    if (editValue.trim() && editValue.trim() !== (titleContent as string)) {
      onSaveTitle?.(editValue.trim());
    }
    setIsEditing(false);
  }, [editValue, titleContent, onSaveTitle]);

  const handleCancelEdit = React.useCallback(() => {
    setEditValue(titleContent as string);
    setIsEditing(false);
  }, [titleContent]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleSaveQuickEdit();
      } else if (e.key === 'Escape') {
        handleCancelEdit();
      }
    },
    [handleSaveQuickEdit, handleCancelEdit]
  );

  return (
    <tr
      className={cn(
        'border-y-1 border-table-border border-s-3 transition-all hover:bg-main/10 relative group',
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

      {/* Title cell with expand button and add subtask button */}
      <TableCell className={cn(getStatusColor(status).borderLeft)}>
        <div
          className={cn(
            getStatusColor(status).background,
            'absolute -left-[5px] top-0 bottom-0 w-[5px] h-[41px]'
          )}
        />
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center flex-start gap-2 truncate">
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
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSaveQuickEdit}
                onKeyDown={handleKeyDown}
                placeholder="Enter task title..."
                className={cn(
                  'flex-1 px-2 py-1 bg-background border border-main rounded outline-none text-foreground',
                  'placeholder:text-foreground/50 w-[400px]'
                )}
              />
            ) : (
              <div
                className="truncate cursor-pointer hover:underline transition-all"
                onClick={onEditTask}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    onEditTask?.();
                  }
                }}
              >
                {titleContent}
              </div>
            )}

            <div className="lg:hidden group-hover:block">
              {onSaveTitle && (
                <button
                  onClick={handleStartQuickEdit}
                  className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-colors"
                  title="Edit title"
                  aria-label="Edit title"
                >
                  <Edit2 className="size-[14px]" />
                </button>
              )}
              {onDeleteTask && (
                <button
                  onClick={onDeleteTask}
                  className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-colors"
                  title="Delete task"
                  aria-label="Delete task"
                >
                  <Trash2 className="size-[14px]" />
                </button>
              )}
            </div>
          </div>

          {/* Action Buttons - Add Subtask, Edit, Delete */}
          <div className="lg:hidden group-hover:block flex items-center gap-2 ml-auto">
            <button
              onClick={onAddSubtask}
              className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-colors"
              title="Add subtask"
              aria-label="Add subtask"
            >
              <Plus className="size-[14px]" />
            </button>
          </div>
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
  hasCheckbox?: boolean;
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
  status?: TaskStatus;
}

function AddTaskRowComponent({
  className,
  onAddClick,
  onAddTask,
  parentStatus,
  status,
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
        'border-b-2 border-border border-s-3 transition-all hover:bg-main/10 relative',
        getStatusColor(parentStatus).borderLeft,
        className
      )}
      {...props}
    >
      {parentStatus && (
        <td
          className={cn(
            'ps-4 pe-4 py-2 align-middle truncate max-w-0 border-r-5 bg-background',
            getStatusColor(parentStatus).borderRight
          )}
        />
      )}

      <TableCell colSpan={6} className={cn('ps-0 pe-0 border-b-1', status && 'rounded-br-base')}>
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
        {status && (
          <div
            className={cn(
              getStatusColor(status).background,
              'absolute -left-[5px] top-0 bottom-0 w-[5px] h-[45px]'
            )}
          />
        )}
      </TableCell>
    </tr>
  );
}

export const AddTaskRow = React.memo(AddTaskRowComponent);
