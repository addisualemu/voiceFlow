
"use client";

import { useMemo } from 'react';
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import TaskList from '@/components/task-list';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ContextSelector } from '@/components/context-selector';
import { useCurrentContext } from '@/components/current-context-provider';
import type { Task } from '@/lib/types';

type TaskWithPriority = {
  task: Task;
  priority: {
    score: number;
    matches: {
      timeFrame: boolean;
      context: boolean;
      daysOfWeek: boolean;
    };
  };
};

function calculatePriority(task: Task, currentContext: string | null): {
  score: number;
  matches: {
    timeFrame: boolean;
    context: boolean;
    daysOfWeek: boolean;
  };
} {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentDay = now.getDay();
  
  let score = 0;
  const matches = {
    timeFrame: false,
    context: false,
    daysOfWeek: false
  };
  
  // Check timeFrame (weight: 3)
  if (task.timeFrame && task.timeFrame.start && task.timeFrame.end) {
    const { start, end } = task.timeFrame;
    const currentMinutes = currentHour * 60 + currentMinute;
    const startMinutes = start.hour * 60 + start.minute;
    const endMinutes = end.hour * 60 + end.minute;
    
    if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
      matches.timeFrame = true;
      score += 3;
    }
  }
  
  // Check context (weight: 2)
  if (currentContext && task.context?.name === currentContext) {
    matches.context = true;
    score += 2;
  }
  
  // Check daysOfWeek (weight: 1)
  if (task.daysOfWeek && task.daysOfWeek.length > 0) {
    if (task.daysOfWeek.includes(currentDay)) {
      matches.daysOfWeek = true;
      score += 1;
    }
  }
  
  return { score, matches };
}

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

    // First filter tasks that match current criteria
    const filtered = actionableTasks.filter(task => {
      // Exclude completed tasks
      if (task.completed) {
        return false;
      }

      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentDay = now.getDay();

      // Check time frame
      if (task.timeFrame && task.timeFrame.start && task.timeFrame.end) {
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

    // Calculate priority for each task and create TaskWithPriority objects
    const tasksWithPriority: TaskWithPriority[] = filtered.map(task => ({
      task,
      priority: calculatePriority(task, currentContext)
    }));

    // Sort by priority score (descending), then by creation date (newest first)
    tasksWithPriority.sort((a, b) => {
      if (b.priority.score !== a.priority.score) {
        return b.priority.score - a.priority.score;
      }
      return b.task.createdAt - a.task.createdAt;
    });

    return tasksWithPriority;
  }, [actionableTasks, currentContext]);

  const moreTasks = useMemo(() => {
    // Get IDs of tasks that are in the current section
    const currentTaskIds = new Set(currentTasks.map(twp => twp.task.id));
    
    // Filter out tasks that are already in the current section
    return actionableTasks.filter(task => !currentTaskIds.has(task.id));
  }, [actionableTasks, currentTasks]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-4xl font-headline font-bold text-primary">Actionable</h1>
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
                  Tasks matching your current time, day or context
                </p>
              </div>
              {currentTasks.length > 0 ? (
                <TaskList 
                  tasks={currentTasks.map(twp => twp.task)} 
                  taskMatches={currentTasks.map(twp => twp.priority.matches)}
                  onUpdateTask={handleUpdate} 
                  onDeleteTask={deleteTask} 
                />
              ) : (
                <p className="text-muted-foreground italic">No current tasks at this time.</p>
              )}
            </section>

            {/* All Actionable Tasks Section */}
            <section>
              <div className="mb-4">
                <h2 className="text-2xl font-bold text-primary">More</h2>
                <p className="text-sm text-muted-foreground">
                  All tasks ready to be acted on
                </p>
              </div>
              {moreTasks.length > 0 ? (
                <TaskList tasks={moreTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} />
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
