
"use client";

import { useMemo } from 'react';
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from "@/lib/types";
import TaskList from '@/components/task-list';
import { SidebarTrigger } from '@/components/ui/sidebar';

export default function ArchivePage() {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTasks();

  const handleUpdate = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const archiveTasks = useMemo(() => {
    return tasks.filter(task => task.stage === 'Archive');
  }, [tasks]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                    <h1 className="text-4xl font-headline font-bold text-primary">Archive</h1>
                    <p className="text-muted-foreground mt-2">Completed and archived tasks.</p>
                </div>
            </div>
        </header>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : (
          <TaskList tasks={archiveTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} showCheckbox={false} />
        )}
      </main>
      
      <VoiceRecorder onNewNote={addTask} />
    </div>
  );
}
