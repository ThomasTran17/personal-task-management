import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Calendar } from 'lucide-react';
import { cn, formatISODateString, isDateOverdue } from '@/lib';
import DatePicker from '@/components/ui/date-picker';

interface DueDateDropdownProps {
  dueDate: string | null;
  onDueDateChange: (date: string | null) => void;
}

const QUICK_DATE_OPTIONS = [
  { label: 'Today', getDays: () => 0 },
  { label: 'Tomorrow', getDays: () => 1 },
  { label: 'Next Week', getDays: () => 7 },
  { label: 'Next Month', getDays: () => 30 },
  { label: 'Clear', value: null },
];

export function DueDateDropdown({ dueDate, onDueDateChange }: DueDateDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getQuickDate = (days: number): string => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    // Set to 9:00 AM by default
    date.setHours(9, 0, 0, 0);
    return date.toISOString();
  };

  const handleQuickDateClick = (option: (typeof QUICK_DATE_OPTIONS)[0]) => {
    if (option.value === null) {
      onDueDateChange(null);
    } else {
      onDueDateChange(getQuickDate(option.getDays?.() ?? 0));
    }
    setIsOpen(false);
  };

  const displayDate = dueDate ? formatISODateString(dueDate, 'dd/mm/yyyy HH:mm') : '-';
  const isOverdue = dueDate ? isDateOverdue(dueDate) : false;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className={cn(
            'inline-block text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity',
            isOverdue ? 'text-red-600 font-semibold' : 'text-gray-700'
          )}
        >
          <span className="flex items-center gap-1">
            <Calendar className="size-4" />
            {displayDate}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-background w-48" side="left" align="start">
        {QUICK_DATE_OPTIONS.map((option, index) => (
          <DropdownMenuItem
            key={index}
            className="bg-background cursor-pointer"
            onClick={() => handleQuickDateClick(option)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
        <div className="border-t my-1" />
        <DatePicker
          className="w-full bg-background border-0 p-2 pointer-cursor"
          value={dueDate}
          onDateChange={(date: string | null, isTimeChange?: boolean) => {
            if (date) {
              onDueDateChange(date);
              if (!isTimeChange) {
                setIsOpen(false);
              }
            }
          }}
          withTime={true}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
