/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib';
import type { TaskStatus } from '@/types/task';

// Helper function to get accent border color based on task status
// eslint-disable-next-line react-refresh/only-export-components
export function getStatusBorderRightColor(status?: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'border-r-yellow-500'; // Yellow for TODO
    case 'IN_PROGRESS':
      return 'border-r-blue-500'; // Blue for IN_PROGRESS
    case 'DONE':
      return 'border-r-green-500'; // Green for DONE
    default:
      return 'border-r-border'; // Default border
  }
}

export function getStatusBorderLeftColor(status?: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'border-l-yellow-500'; // Yellow for TODO
    case 'IN_PROGRESS':
      return 'border-l-blue-500'; // Blue for IN_PROGRESS
    case 'DONE':
      return 'border-l-green-500'; // Green for DONE
    default:
      return 'border-l-border'; // Default border
  }
}

// Helper function to get border bottom color for connector lines based on task status
function getStatusBackgroundColor(status?: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'bg-yellow-500'; // Yellow for TODO
    case 'IN_PROGRESS':
      return 'bg-blue-500'; // Blue for IN_PROGRESS
    case 'DONE':
      return 'bg-green-500'; // Green for DONE
    default:
      return 'bg-border'; // Default border
  }
}

// Main Table Component - Inherits Neubrutalism tokens from index.css
export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full overflow-auto">
      <table
        className={cn(
          'w-full caption-bottom text-sm',
          'border-2 border-border rounded-base',
          className
        )}
        {...props}
      />
    </div>
  );
}

// Table Header - sticky positioning with Neubrutalism styling
export function TableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'text-main-foreground',
        'border-b-2 border-l-2 border-border',
        'sticky top-0 z-10',
        className
      )}
      {...props}
    />
  );
}

// Table Body - base styling
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn('', className)} {...props} />;
}

// Table Footer - Neubrutalism with muted styling
export function TableFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <tfoot
      className={cn(
        'border-t-2 border-border',
        'bg-secondary-background/50',
        'font-base font-weight-base',
        '[&>tr]:last:border-b-0',
        className
      )}
      {...props}
    />
  );
}

// Table Row - with hard borders and hover state (Neubrutalism)
export function TableRow({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn('border-t-2', 'transition-all', 'data-[state=selected]:bg-main/20', className)}
      {...props}
    />
  );
}

// Table Head - Neubrutalism header styling
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-12 ps-4 pe-4',
        'text-left align-middle',
        'font-weight-base font-base',
        'text-foreground',
        '[&:has([role=checkbox])]:pe-0',
        className
      )}
      {...props}
    />
  );
}

// Table Cell - Neubrutalism padding and borders
export function TableCell({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        'ps-4 pe-4 py-2',
        'align-middle',
        'truncate max-w-0',
        '[&:has([role=checkbox])]:pe-0',
        className
      )}
      {...props}
    />
  );
}

// Table Caption - muted foreground styling
export function TableCaption({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableCaptionElement>) {
  return <caption className={cn('mt-4 text-sm', 'text-foreground/60', className)} {...props} />;
}

// Subtask Table Row - with L-shaped connector visual
// CONNECTOR IMPLEMENTATION: Horizontal branch of L-shape
// The before:absolute pseudo-element creates the horizontal line connecting
// the vertical stem (at -left-6) to the subtask row at top-1/2 (vertical center)
interface SubtaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  targetIndex: number;
  index: number;
  isSingleSubtask?: boolean; // New prop to handle single subtask case
  status?: TaskStatus;
  parentStatus?: TaskStatus;
}

export function SubtaskTableRow({
  className,
  targetIndex,
  index,
  isSingleSubtask = false,
  status,
  parentStatus,
  children,
  ...props
}: SubtaskRowProps) {
  const hasConnector = index === targetIndex;

  return (
    <tr
      className={cn('border-b-2 border-border', 'transition-all', 'hover:bg-main/10', className)}
      {...props}
    >
      <td
        className={cn(
          'ps-4 pe-4 py-2',
          'align-middle',
          'truncate max-w-0',
          'border-r-2',
          'w-[5%]',
          'relative',
          getStatusBorderRightColor(status)
        )}
      >
        {hasConnector && (
          <div
            className={cn(
              'absolute left-0 bottom-0 h-[1px] w-full',
              getStatusBackgroundColor(parentStatus),
              isSingleSubtask && 'top-1/2 -translate-y-1/2'
            )}
          ></div>
        )}
      </td>

      {children}
    </tr>
  );
}

// Subtask Container with vertical connector stem
// CONNECTOR IMPLEMENTATION: Vertical stem of L-shape
// The before:absolute pseudo-element creates the vertical line connecting
// parent task to all subtasks in this container
interface SubtaskContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  isLast?: boolean;
  parentStatus?: TaskStatus;
}

export function SubtaskContainer({
  className,
  isLast = false,
  children,
  ...props
}: SubtaskContainerProps) {
  return (
    <div className={cn('relative py-5 z-10', className)} {...props}>
      {children}
    </div>
  );
}

// Expandable Task Row with toggle UI
// Primary Sidebar Implementation: border-s-[3px] creates prominent left border (Neubrutalism)
// This row represents the parent task and can expand/collapse its subtask container
interface ExpandableTaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  hasSubtasks?: boolean;
  isExpanded?: boolean;
  onToggleSubtasks?: (expanded: boolean) => void;
  status?: TaskStatus;
}

export function ExpandableTaskRow({
  className,
  hasSubtasks = false,
  isExpanded = false,
  onToggleSubtasks,
  status,
  children,
  ...props
}: ExpandableTaskRowProps) {
  const childrenArray = React.Children.toArray(children);
  const firstChild = childrenArray[0];
  const restChildren = childrenArray.slice(1);

  const firstChildProps = React.isValidElement(firstChild)
    ? (firstChild.props as React.HTMLAttributes<HTMLTableCellElement>)
    : null;

  return (
    <>
      <tr
        className={cn(
          'border-y-2 border-border',
          'border-s-3',
          getStatusBorderLeftColor(status),
          'transition-all',
          'hover:bg-main/10',
          'relative',
          className
        )}
        {...props}
      >
        {/* First cell with expand button and content together */}
        {firstChildProps && (
          <TableCell className={firstChildProps?.className}>
            <div className="flex items-center gap-2">
              {hasSubtasks && (
                <button
                  onClick={() => onToggleSubtasks?.(!isExpanded)}
                  className="inline-flex items-center justify-center w-6 h-6 flex-shrink-0 hover:bg-main/20 rounded-base transition-transform"
                  style={{
                    // -90deg rotation when collapsed, 0deg when expanded
                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}
                >
                  <ChevronDown className="size-4" />
                </button>
              )}
              {firstChildProps?.children}
            </div>
          </TableCell>
        )}
        {restChildren}
      </tr>
    </>
  );
}

// Subtask Header Row - smaller text and muted foreground
// Applied only when displaying subtask list headers (inside SubtaskContainer)
// Styling: text-xs + text-foreground/60 creates visual hierarchy differentiation from parent
interface SubtaskTableHeaderProps extends React.HTMLAttributes<HTMLTableSectionElement> {
  parentStatus?: TaskStatus;
}

export function SubtaskTableHeader({
  className,
  parentStatus,
  children,
  ...props
}: SubtaskTableHeaderProps) {
  return (
    <thead
      className={cn(
        'border border-border',
        'border-l-3 border-r-0',
        getStatusBorderLeftColor(parentStatus),
        'text-xs text-foreground/60',
        // z-9 ensures headers stay below sticky main TableHeader (z-10)
        'sticky top-0 z-9',
        className
      )}
      {...props}
    >
      {children}
    </thead>
  );
}

// Add Task Row - Styled like a subtask row with quick input functionality
// Footer Action: This row is placed at the bottom of subtask list
// Feature: Inline input for quick task title entry
interface AddTaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onAddClick?: () => void;
  onAddTask?: (title: string) => void;
  parentStatus?: TaskStatus;
}

export function AddTaskRow({
  className,
  onAddClick,
  onAddTask,
  parentStatus,
  children,
  ...props
}: AddTaskRowProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleClick = () => {
    setIsEditing(true);
    onAddClick?.();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSave = () => {
    if (inputValue.trim()) {
      onAddTask?.(inputValue);
      setInputValue('');
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setInputValue('');
      setIsEditing(false);
    }
  };

  React.useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  return (
    <tr
      className={cn(
        'border-b-2 border-border',
        'border-s-3',
        getStatusBorderLeftColor(parentStatus),
        'transition-all',
        'hover:bg-main/10',
        className
      )}
      {...props}
    >
      <td
        className={cn(
          'ps-4 pe-4 py-2',
          'align-middle',
          'truncate max-w-0',
          'border-r-2',
          'w-[5%]',
          getStatusBorderRightColor(parentStatus)
        )}
      />
      <TableCell colSpan={6} className="ps-0 pe-0">
        {isEditing ? (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            placeholder="Enter task title..."
            className={cn(
              'w-full ps-4 pe-4 py-1',
              'bg-transparent',
              'border-none',
              'outline-none',
              'text-foreground',
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
