
"use client";

import { useMemo } from 'react';
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import TaskList from '@/components/task-list';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ContextSelector } from '@/components/context-selector';
import { useCurrentContext } from '@/components/current-context-provider';

export default function Home() {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTasks();
  const { currentContext } = useCurrentContext();

  const handleUpdate = (id: string, updates: Partial<(typeof tasks)[0]>) => {
    updateTask(id, updates);
  };

  const actionableTasks = useMemo(() => {
    return tasks.filter(task => task.stage === 'Actionable');
  }, [tasks]);

  const currentTasks = useMemo(() => {
    if (!actionableTasks.length) return [];

    return actionableTasks.filter(task => {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      // Check time frame
      if (task.timeFrame) {
        const { start, end } = task.timeFrame;
        const currentMinutes = currentHour * 60 + currentMinute;
        const startMinutes = start.hour * 60 + start.minute;
        const endMinutes = end.hour * 60 + end.minute;

        if (currentMinutes < startMinutes || currentMinutes > endMinutes) {
          return false;
        }
      }

      // Check days of week
      if (task.daysOfWeek && task.daysOfWeek.length > 0) {
        if (!task.daysOfWeek.includes(currentDay)) {
          return false;
        }
      }

      // Check context
      if (currentContext) {
        if (task.context && task.context.name !== currentContext) {
          return false;
        }
      }

      return true;
    });
  }, [actionableTasks, currentContext]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl font-headline font-bold text-primary">My Day</h1>
                <p className="text-muted-foreground mt-2">Your actionable tasks for today.</p>
              </div>
            </div>
            <ContextSelector />
          </div>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <div className="space-y-8" key={`context-${currentContext || 'any'}`}>
            {/* Current Tasks Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-primary">Current</h2>
                <p className="text-sm text-muted-foreground">
                  Tasks matching your current time, day, and context
                </p>
              </div>
              {currentTasks.length > 0 ? (
                <TaskList tasks={currentTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} />
              ) : (
                <p className="text-muted-foreground italic">No current tasks at this time.</p>
              )}
            </section>

            {/* All Actionable Tasks Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-primary">Actionable</h2>
                <p className="text-sm text-muted-foreground">
                  All tasks ready to be acted on
                </p>
              </div>
              {actionableTasks.length > 0 ? (
                <TaskList tasks={actionableTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} />
              ) : (
                <p className="text-muted-foreground italic">No actionable tasks.</p>
              )}
            </section>
          </div>
        )}
      </main>

      <VoiceRecorder onNewNote={addTask} />
    </div>
  );
}
