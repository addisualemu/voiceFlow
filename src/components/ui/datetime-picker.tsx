"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { TimePicker } from "@/components/ui/time-picker";
import type { TimeOfDay } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface DateTimePickerProps {
  value?: number; // timestamp
  onChange: (timestamp: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date and time",
  minDate,
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);
  const [selectedTime, setSelectedTime] = React.useState<TimeOfDay | undefined>(
    date ? { hour: date.getHours(), minute: date.getMinutes() } : undefined
  );

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value) {
      const d = new Date(value);
      setSelectedDate(d);
      setSelectedTime({ hour: d.getHours(), minute: d.getMinutes() });
    } else {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  }, [value]);

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date && selectedTime) {
      const newDate = new Date(date);
      newDate.setHours(selectedTime.hour, selectedTime.minute, 0, 0);
      onChange(newDate.getTime());
    } else if (date) {
      // Default to 12:00 if no time selected
      const newDate = new Date(date);
      newDate.setHours(12, 0, 0, 0);
      setSelectedTime({ hour: 12, minute: 0 });
      onChange(newDate.getTime());
    }
  };

  const handleTimeChange = (time: TimeOfDay | undefined) => {
    setSelectedTime(time);
    if (selectedDate && time) {
      const newDate = new Date(selectedDate);
      newDate.setHours(time.hour, time.minute, 0, 0);
      onChange(newDate.getTime());
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(undefined);
    setSelectedTime(undefined);
    onChange(undefined);
    setOpen(false);
  };

  const displayValue = selectedDate && selectedTime
    ? `${format(selectedDate, "PPP")} at ${String(selectedTime.hour).padStart(2, '0')}:${String(selectedTime.minute).padStart(2, '0')}`
    : undefined;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !displayValue && "text-muted-foreground"
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {displayValue || placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            disabled={minDate ? { before: minDate } : undefined}
            initialFocus
          />
          <div className="border-t p-3">
            <div className="text-sm font-medium mb-2">Time</div>
            <TimePicker
              value={selectedTime}
              onChange={handleTimeChange}
            />
          </div>
        </PopoverContent>
      </Popover>
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
