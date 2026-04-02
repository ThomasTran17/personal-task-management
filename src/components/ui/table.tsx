/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib';
import type { TaskStatus } from '@/types/task';

// Helper function to get accent border color based on task status
function getStatusBorderColor(status?: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'border-s-yellow-500'; // Yellow for TODO
    case 'IN_PROGRESS':
      return 'border-s-blue-500'; // Blue for IN_PROGRESS
    case 'DONE':
      return 'border-s-green-500'; // Green for DONE
    default:
      return 'border-s-border'; // Default border
  }
}

// Helper function to get background color for connector lines based on task status
function getStatusBgColor(status?: TaskStatus): string {
  switch (status) {
    case 'TODO':
      return 'before:bg-yellow-500'; // Yellow for TODO
    case 'IN_PROGRESS':
      return 'before:bg-blue-500'; // Blue for IN_PROGRESS
    case 'DONE':
      return 'before:bg-green-500'; // Green for DONE
    default:
      return 'before:bg-border'; // Default border
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
          // 'bg-secondary-background',
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
        'bg-main text-main-foreground',
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
  return <tbody className={cn('[&_tr:last-child]:border-0', className)} {...props} />;
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
      className={cn(
        'border-t-2 border-border',
        'border-s-1',
        'transition-all',
        'data-[state=selected]:bg-main/20',
        className
      )}
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
  isLast?: boolean;
  isExpanded?: boolean;
  status?: TaskStatus;
  parentStatus?: TaskStatus;
}

export function SubtaskTableRow({
  className,
  isLast = false,
  isExpanded = false,
  status,
  parentStatus,
  ...props
}: SubtaskRowProps) {
  return (
    <tr
      className={cn(
        'border-b-2 border-border',
        'border-s-3',
        getStatusBorderColor(status),
        'transition-all',
        'hover:bg-main/10',
        // Connector Branch: Horizontal line from vertical stem to subtask row
        'before:absolute before:w-11 before:h-[1px]',
        getStatusBgColor(parentStatus),
        'before:-left-11 before:top-1/2 before:-translate-y-1/2',
        className
      )}
      {...props}
    />
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
  parentStatus,
  children,
  ...props
}: SubtaskContainerProps) {
  return (
    <div
      className={cn(
        'relative ms-11 py-5',
        'border-border',
        isLast
          ? `before:absolute before:left-0 before:top-0 before:bottom-1/2 before:w-[1px] ${getStatusBgColor(parentStatus)}`
          : `before:absolute before:-start-11 before:top-0 before:bottom-0 before:w-[1px] ${getStatusBgColor(parentStatus)}`,
        className
      )}
      {...props}
    >
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
          getStatusBorderColor(status),
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
export function SubtaskTableHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead
      className={cn(
        'bg-main',
        'border border-border',
        'text-xs text-foreground/60',
        // z-9 ensures headers stay below sticky main TableHeader (z-10)
        'sticky top-0 z-9',
        className
      )}
      {...props}
    />
  );
}

// Add Task Row - ghost button styling, aligned with task name column
// Footer Action: This row is placed at the bottom of subtask list
// Styling: dashed border + reduced background for "ghost" effect
// Alignment: colSpan ensures button aligns with task name column in parent
interface AddTaskRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  onAddClick?: () => void;
}

export function AddTaskRow({ className, onAddClick, ...props }: AddTaskRowProps) {
  return (
    <tr
      className={cn(
        'border-b-2 border-border',
        'bg-secondary-background/30',
        'hover:bg-secondary-background/60',
        'transition-colors',
        className
      )}
      {...props}
    >
      <td colSpan={6} className="ps-4 pe-4 py-2">
        <button
          onClick={onAddClick}
          className={cn(
            'text-sm font-base',
            'text-foreground/60 hover:text-foreground',
            'px-3 py-1 rounded-base',
            // Dashed border for ghost button aesthetic (Neubrutalism)
            'border-2 border-dashed border-border',
            // On hover: solid border appears, background activates
            'hover:bg-main/5 hover:border-solid',
            'transition-all',
            'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-border'
          )}
        >
          + Add subtask
        </button>
      </td>
    </tr>
  );
}

// Connector Line Component - for visual hierarchy in nested structures
// UTILITY COMPONENT: Can be used standalone if manual connector placement is needed
// Variants:
// - vertical: Full height stem (top-0 bottom-0)
// - horizontal: Cross branch with offset centering (top-1/2 -translate-y-1/2)
// - corner: Terminator branch for last child (bottom-0 alignment)
// All use: w-[2px] + bg-border for Neubrutalism hard line aesthetic
interface ConnectorLineProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'vertical' | 'horizontal' | 'corner';
}

export function ConnectorLine({ className, variant = 'vertical', ...props }: ConnectorLineProps) {
  const variantClasses = {
    // Full height vertical line: spans entire container height
    vertical: 'absolute -left-6 top-0 bottom-0 w-[2px] bg-border',
    // Horizontal line centered: crosses from stem (-left-6) to content
    horizontal: 'absolute w-6 h-[2px] bg-border -left-6 top-1/2 -translate-y-1/2',
    // Terminator corner: bottom-aligned branch for last child
    corner: 'absolute w-6 h-[2px] bg-border -left-6 bottom-0',
  };

  return <div className={cn(variantClasses[variant], className)} {...props} />;
}
