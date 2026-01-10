"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import type { TimeOfDay } from "@/lib/types";
import { cn } from "@/lib/utils";

export interface TimePickerProps {
  value?: TimeOfDay;
  onChange: (time: TimeOfDay | undefined) => void;
  disabled?: boolean;
  className?: string;
}

export function TimePicker({
  value,
  onChange,
  disabled,
  className,
}: TimePickerProps) {
  const [hour, setHour] = React.useState<string>(
    value?.hour !== undefined ? String(value.hour).padStart(2, '0') : ''
  );
  const [minute, setMinute] = React.useState<string>(
    value?.minute !== undefined ? String(value.minute).padStart(2, '0') : ''
  );

  // Update local state when value prop changes
  React.useEffect(() => {
    if (value) {
      setHour(String(value.hour).padStart(2, '0'));
      setMinute(String(value.minute).padStart(2, '0'));
    } else {
      setHour('');
      setMinute('');
    }
  }, [value]);

  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setHour('');
      onChange(undefined);
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 23) {
      const newHour = String(num).padStart(2, '0');
      setHour(newHour);

      if (minute !== '') {
        onChange({
          hour: num,
          minute: parseInt(minute, 10),
        });
      }
    }
  };

  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      setMinute('');
      onChange(undefined);
      return;
    }

    const num = parseInt(val, 10);
    if (!isNaN(num) && num >= 0 && num <= 59) {
      const newMinute = String(num).padStart(2, '0');
      setMinute(newMinute);

      if (hour !== '') {
        onChange({
          hour: parseInt(hour, 10),
          minute: num,
        });
      }
    }
  };

  const handleClear = () => {
    setHour('');
    setMinute('');
    onChange(undefined);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1">
        <Input
          type="number"
          min={0}
          max={23}
          value={hour}
          onChange={handleHourChange}
          placeholder="HH"
          disabled={disabled}
          className="w-16 text-center"
        />
        <span className="text-muted-foreground">:</span>
        <Input
          type="number"
          min={0}
          max={59}
          value={minute}
          onChange={handleMinuteChange}
          placeholder="MM"
          disabled={disabled}
          className="w-16 text-center"
        />
      </div>
      {value && !disabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleClear}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
