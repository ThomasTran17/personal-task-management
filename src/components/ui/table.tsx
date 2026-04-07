import * as React from 'react';
import { cn } from '@/lib';

// Shared Tailwind class patterns (DRY - reused across multiple components)
const TABLE_BASE_CLASSES =
  'w-full min-w-[1004px] caption-bottom text-sm bg-secondary-background table-fixed border-separate border-spacing-0 border-0';
const TABLE_HEADER_BORDER_CLASSES = 'border-b-1 border-l-1 border-table-border';
const TABLE_ROW_BORDER_CLASSES = 'border-t-1 border-table-border';
const CELL_BASE_CLASSES =
  'ps-4 pe-4 align-middle truncate max-w-0 border-r-1 border-t-1 first:border-l-1 border-table-border';
const CELL_CHECKBOX_ADJUSTMENT = '[&:has([role=checkbox])]:pe-0';

// Main Table Component - Inherits Neubrutalism tokens from index.css
export function Table({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="w-full ">
      <table className={cn(TABLE_BASE_CLASSES, className)} {...props} />
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
      className={cn('text-main-foreground top-0 z-10', TABLE_HEADER_BORDER_CLASSES, className)}
      {...props}
    />
  );
}

// Table Body - base styling
export function TableBody({ className, ...props }: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody className={cn(className)} {...props} />;
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
  return <tr className={cn(TABLE_ROW_BORDER_CLASSES, 'transition-all', className)} {...props} />;
}

// Table Head - Neubrutalism header styling
export function TableHead({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        'h-12 text-left text-foreground font-weight-base font-base last:rounded-tr-base',
        CELL_BASE_CLASSES,
        CELL_CHECKBOX_ADJUSTMENT,
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
        'py-2',
        CELL_BASE_CLASSES,
        CELL_CHECKBOX_ADJUSTMENT,
        'has-[.no-padding]:p-0',
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
