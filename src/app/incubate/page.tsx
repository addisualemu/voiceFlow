
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import TasksBoard from "@/components/tasks-board";
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from "@/lib/types";

export default function IncubatePage() {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTasks();

  const handleUpdate = (id: string, updates: Partial<Task>) => {
    updateTask(id, updates);
  };

  const incubateTasks = useMemo(() => {
    return tasks.filter(task => task.stage === 'Incubate');
  }, [tasks]);
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">Incubate</h1>
          <p className="text-muted-foreground mt-2">Tasks that are on hold.</p>
          <nav className="mt-4 flex justify-center gap-4 text-primary">
            <Link href="/" className="hover:underline">My Day</Link>
            <Link href="/entry" className="hover:underline">Entry</Link>
            <Link href="/reference" className="hover:underline">Reference</Link>
          </nav>
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
          <TasksBoard tasks={incubateTasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} stages={['Incubate']} showCheckbox={false} />
        )}
      </main>
      
      <VoiceRecorder onNewNote={addTask} />
    </div>
  );
}
