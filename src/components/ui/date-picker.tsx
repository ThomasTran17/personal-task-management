import { format } from 'date-fns';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';

import * as React from 'react';

import { Button, Calendar, Input, Popover, PopoverContent, PopoverTrigger } from '@/components';

interface DatePickerProps {
  value?: string | null;
  onDateChange: (date: string | null) => void;
  placeholder?: string;
  className?: string;
  withTime?: boolean;
}

export default function DatePicker({
  value,
  onDateChange,
  placeholder = 'Pick a date',
  className = 'w-full',
  withTime = false,
}: DatePickerProps) {
  const valueDate = value ? new Date(value) : null;
  const [hours, setHours] = React.useState<string>(
    valueDate ? String(valueDate.getHours()).padStart(2, '0') : '09'
  );
  const [minutes, setMinutes] = React.useState<string>(
    valueDate ? String(valueDate.getMinutes()).padStart(2, '0') : '00'
  );

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onDateChange(null);
      return;
    }

    if (withTime) {
      const hours_num = parseInt(hours) || 0;
      const minutes_num = parseInt(minutes) || 0;
      date.setHours(hours_num, minutes_num, 0, 0);
    }

    onDateChange(date.toISOString());
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newHours = e.target.value;
    const hoursNum = parseInt(newHours) || 0;

    // Limit hours to 0-23
    if (hoursNum < 0) {
      newHours = '0';
    } else if (hoursNum >= 24) {
      newHours = '23';
    }

    setHours(newHours);

    if (valueDate && withTime) {
      const hours_num = parseInt(newHours) || 0;
      const minutes_num = parseInt(minutes) || 0;
      const newDate = new Date(valueDate);
      newDate.setHours(hours_num, minutes_num, 0, 0);
      onDateChange(newDate.toISOString());
    }
  };

  const handleMinutesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMinutes = e.target.value;
    const minutesNum = parseInt(newMinutes) || 0;

    // Limit minutes to 0-59
    if (minutesNum < 0) {
      newMinutes = '0';
    } else if (minutesNum >= 60) {
      newMinutes = '59';
    }

    setMinutes(newMinutes);

    if (valueDate && withTime) {
      const hours_num = parseInt(hours) || 0;
      const minutes_num = parseInt(newMinutes) || 0;
      const newDate = new Date(valueDate);
      newDate.setHours(hours_num, minutes_num, 0, 0);
      onDateChange(newDate.toISOString());
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="noShadow" className={`justify-start text-left font-base ${className}`}>
          <CalendarIcon className="size-4 mr-2" />
          {valueDate ? (
            format(valueDate, withTime ? 'MMM dd, yyyy HH:mm' : 'MMM dd, yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-0! p-4">
        <div className="space-y-4">
          <Calendar
            mode="single"
            selected={valueDate ?? undefined}
            onSelect={handleDateSelect}
            initialFocus
          />

          {withTime && valueDate && (
            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <Clock className="size-4 text-foreground/60" />
              <Input
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={handleHoursChange}
                placeholder="HH"
                className="w-16 px-2 py-1 text-center"
              />
              <span className="text-foreground font-medium">:</span>
              <Input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={handleMinutesChange}
                placeholder="MM"
                className="w-16 px-2 py-1 text-center"
              />
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
