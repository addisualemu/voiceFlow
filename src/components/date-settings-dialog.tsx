"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { InlineDatePicker } from "@/components/inline-date-picker";
import type { Task } from "@/lib/types";

// Form schema with validation
const dateSettingsSchema = z.object({
  alertDateTime: z.number().optional(),
  deadlineDateTime: z.number().optional(),
}).refine((data) => {
  // Validate deadline is after alert
  if (data.alertDateTime && data.deadlineDateTime) {
    return data.deadlineDateTime > data.alertDateTime;
  }
  return true;
}, {
  message: "Deadline must be after alert time",
  path: ["deadlineDateTime"],
});

type FormValues = z.infer<typeof dateSettingsSchema>;

export interface DateSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  initialValues?: {
    alertDateTime?: number;
    deadlineDateTime?: number;
  };
  onSubmit: (dates: { alertDateTime?: number; deadlineDateTime?: number }) => void;
  onBack?: () => void;
}

export function DateSettingsDialog({
  open,
  onOpenChange,
  task,
  initialValues,
  onSubmit,
  onBack,
}: DateSettingsDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(dateSettingsSchema),
    defaultValues: {
      alertDateTime: initialValues?.alertDateTime || task.alertDateTime,
      deadlineDateTime: initialValues?.deadlineDateTime || task.deadlineDateTime,
    },
  });

  // Watch alertDateTime for deadline validation
  const alertDateTime = form.watch("alertDateTime");

  const handleSubmit = (values: FormValues) => {
    onSubmit(values);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Set Dates & Deadlines</DialogTitle>
          <DialogDescription>
            When should you be alerted about this task?
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
            {/* Alert Date */}
            <FormField
              control={form.control}
              name="alertDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InlineDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Set alert date (optional)"
                      label="Alert Date"
                    />
                  </FormControl>
                  <FormDescription>
                    When should you be alerted if this isn't complete?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Deadline */}
            <FormField
              control={form.control}
              name="deadlineDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <InlineDatePicker
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Set deadline (optional)"
                      minDate={alertDateTime ? new Date(alertDateTime) : undefined}
                      label="Deadline"
                    />
                  </FormControl>
                  <FormDescription>
                    When does this task fail if not completed?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter>
          {onBack && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
            >
              Back
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onSubmit(form.getValues());
              onOpenChange(false);
            }}
          >
            Skip
          </Button>
          <Button
            type="submit"
            onClick={form.handleSubmit(handleSubmit)}
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
