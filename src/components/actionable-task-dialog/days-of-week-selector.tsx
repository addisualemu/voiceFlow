"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface DaysOfWeekSelectorProps {
  value: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  onChange: (days: number[]) => void;
  disabled?: boolean;
  className?: string;
}

const DAYS = [
  { value: 0, label: 'S', full: 'Sunday' },
  { value: 1, label: 'M', full: 'Monday' },
  { value: 2, label: 'T', full: 'Tuesday' },
  { value: 3, label: 'W', full: 'Wednesday' },
  { value: 4, label: 'T', full: 'Thursday' },
  { value: 5, label: 'F', full: 'Friday' },
  { value: 6, label: 'S', full: 'Saturday' },
];

export function DaysOfWeekSelector({
  value,
  onChange,
  disabled,
  className,
}: DaysOfWeekSelectorProps) {
  const toggleDay = (day: number) => {
    if (disabled) return;

    if (value.includes(day)) {
      // Remove day
      onChange(value.filter(d => d !== day));
    } else {
      // Add day
      onChange([...value, day].sort((a, b) => a - b));
    }
  };

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {DAYS.map((day) => {
        const isSelected = value.includes(day.value);
        return (
          <Button
            key={day.value}
            type="button"
            variant={isSelected ? "default" : "outline"}
            size="sm"
            className={cn(
              "w-10 h-10 p-0 font-medium",
              isSelected && "bg-primary text-primary-foreground"
            )}
            onClick={() => toggleDay(day.value)}
            disabled={disabled}
            title={day.full}
          >
            {day.label}
          </Button>
        );
      })}
    </div>
  );
}
