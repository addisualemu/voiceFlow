"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

export interface InlineDatePickerProps {
  value?: number; // timestamp
  onChange: (timestamp: number | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  className?: string;
  label?: string;
}

export function InlineDatePicker({
  value,
  onChange,
  disabled,
  placeholder = "Pick a date",
  minDate,
  className,
  label,
}: InlineDatePickerProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);
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
    setIsExpanded(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setIsExpanded(false);
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsExpanded(!isExpanded);
    }
  };

  const displayValue = date ? format(date, "PPP") : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </label>
      )}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground"
          )}
          disabled={disabled}
          onClick={handleToggle}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || placeholder}
        </Button>
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
      {isExpanded && !disabled && (
        <div className="rounded-md border bg-background p-3 shadow-md">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            disabled={minDate ? { before: minDate } : undefined}
            initialFocus
          />
        </div>
      )}
    </div>
  );
}
