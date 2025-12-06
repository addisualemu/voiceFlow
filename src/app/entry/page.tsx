
"use client";

import { useMemo } from 'react';
import TasksBoard from "@/components/tasks-board";
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from "@/lib/types";
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function EntryPage() {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTasks();

  const handleUpdate = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const entryTasks = useMemo(() => {
    return tasks.filter(task => task.stage === 'Entry');
  }, [tasks]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 flex items-center justify-between">
             <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                    <h1 className="text-4xl font-headline font-bold text-primary">Entry</h1>
                    <p className="text-muted-foreground mt-2">Tasks that need to be processed.</p>
                </div>
            </div>
        </header>

        {isLoading ? (
          <div className="space-y-8">
            <Skeleton className="h-10 w-1/2 mx-auto" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
              <Skeleton className="h-64" />
            </div>
          </div>
        ) : (
          <TasksBoard tasks={entryTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} stages={['Entry']} showCheckbox={false} />
        )}
      </main>
      
      <VoiceRecorder onNewNote={addTask} />
    </div>
  );
}
