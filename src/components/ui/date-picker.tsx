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
import { cn } from "@/lib/utils";

export interface DatePickerProps {
  value?: number; // timestamp
  onChange: (timestamp: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  minDate,
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const date = value ? new Date(value) : undefined;

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Set to start of day (midnight)
      const dateAtMidnight = new Date(selectedDate);
      dateAtMidnight.setHours(0, 0, 0, 0);
      onChange(dateAtMidnight.getTime());
    } else {
      onChange(undefined);
    }
    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
  };

  const displayValue = date ? format(date, "PPP") : undefined;

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
            selected={date}
            onSelect={handleDateSelect}
            disabled={minDate ? { before: minDate } : undefined}
            initialFocus
          />
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
