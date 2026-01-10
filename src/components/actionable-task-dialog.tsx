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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { TimePicker } from "@/components/ui/time-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { DaysOfWeekSelector } from "@/components/actionable-task-dialog/days-of-week-selector";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useContexts } from "@/hooks/use-contexts";
import type { Task, TimeOfDay } from "@/lib/types";

// Form schema with validation
const actionableTaskSchema = z.object({
  context: z.string().optional(),
  timeFrameStart: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }).optional(),
  timeFrameEnd: z.object({
    hour: z.number().min(0).max(23),
    minute: z.number().min(0).max(59),
  }).optional(),
  daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
  repeated: z.boolean().optional(),
  alertDateTime: z.number().optional(),
  deadlineDateTime: z.number().optional(),
  priority: z.number().min(1).max(4).optional(),
}).refine((data) => {
  // Validate end time is after start time
  if (data.timeFrameStart && data.timeFrameEnd) {
    const startMinutes = data.timeFrameStart.hour * 60 + data.timeFrameStart.minute;
    const endMinutes = data.timeFrameEnd.hour * 60 + data.timeFrameEnd.minute;
    return endMinutes > startMinutes;
  }
  return true;
}, {
  message: "End time must be after start time",
  path: ["timeFrameEnd"],
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

type FormValues = z.infer<typeof actionableTaskSchema>;

export interface ActionableTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSubmit: (updates: Partial<Task>) => void;
}

export function ActionableTaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
}: ActionableTaskDialogProps) {
  const { contexts, isLoading: contextsLoading } = useContexts();

  const form = useForm<FormValues>({
    resolver: zodResolver(actionableTaskSchema),
    defaultValues: {
      context: task.context?.name || undefined,
      timeFrameStart: task.timeFrame?.start,
      timeFrameEnd: task.timeFrame?.end,
      daysOfWeek: task.daysOfWeek || [],
      repeated: task.repeated || false,
      alertDateTime: task.alertDateTime,
      deadlineDateTime: task.deadlineDateTime,
      priority: task.priority || 2, // Default to Normal
    },
  });

  // Watch timeFrame and daysOfWeek to control repeated field visibility
  const timeFrameStart = form.watch("timeFrameStart");
  const timeFrameEnd = form.watch("timeFrameEnd");
  const daysOfWeek = form.watch("daysOfWeek");
  const hasSchedule = (timeFrameStart || timeFrameEnd) || (daysOfWeek && daysOfWeek.length > 0);

  // Watch alertDateTime for deadline validation
  const alertDateTime = form.watch("alertDateTime");

  const handleSubmit = (values: FormValues) => {
    // Find the context object from the name
    const contextObj = values.context
      ? contexts.find(c => c.name === values.context)
      : undefined;

    const updates: Partial<Task> = {
      context: contextObj,
      timeFrame: (values.timeFrameStart && values.timeFrameEnd) ? {
        start: values.timeFrameStart,
        end: values.timeFrameEnd,
      } : undefined,
      daysOfWeek: values.daysOfWeek && values.daysOfWeek.length > 0 ? values.daysOfWeek : undefined,
      repeated: values.repeated,
      alertDateTime: values.alertDateTime,
      deadlineDateTime: values.deadlineDateTime,
      priority: values.priority,
    };

    onSubmit(updates);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle>Configure Task</DialogTitle>
          <DialogDescription>
            Set when and where this task should be done
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-180px)] px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6 py-4">
              {/* Context */}
              <FormField
                control={form.control}
                name="context"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Context</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={contextsLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select context (optional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {contexts.map((context) => (
                          <SelectItem key={context.name} value={context.name}>
                            <div className="flex items-center gap-2">
                              {context.color && (
                                <div
                                  className="w-3 h-3 rounded-full"
                                  style={{ backgroundColor: context.color }}
                                />
                              )}
                              {context.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Where or in what situation can this task be done?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Frame */}
              <div className="space-y-2">
                <FormLabel>Time of Day</FormLabel>
                <FormDescription>
                  When during the day can this task be done? (Leave empty for any time)
                </FormDescription>
                <div className="flex items-center gap-2">
                  <FormField
                    control={form.control}
                    name="timeFrameStart"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">to</span>
                  <FormField
                    control={form.control}
                    name="timeFrameEnd"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <TimePicker
                            value={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Days of Week */}
              <FormField
                control={form.control}
                name="daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days</FormLabel>
                    <FormControl>
                      <DaysOfWeekSelector
                        value={field.value || []}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Which days can this task be done? (Leave empty for any day)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Repeated - only show if schedule is set */}
              {hasSchedule && (
                <FormField
                  control={form.control}
                  name="repeated"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Recurring Task
                        </FormLabel>
                        <FormDescription>
                          Does this repeat on the specified schedule?
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              )}

              {/* Alert Date */}
              <FormField
                control={form.control}
                name="alertDateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alert Date</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Set alert date (optional)"
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
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      <DatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="Set deadline (optional)"
                        minDate={alertDateTime ? new Date(alertDateTime) : undefined}
                      />
                    </FormControl>
                    <FormDescription>
                      When does this task fail if not completed?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value, 10))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">1 - Low</SelectItem>
                        <SelectItem value="2">2 - Normal</SelectItem>
                        <SelectItem value="3">3 - High</SelectItem>
                        <SelectItem value="4">4 - Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
          >
            Cancel
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
