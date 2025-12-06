
"use client";

import { useMemo } from 'react';
import Link from 'next/link';
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';
import type { Task } from "@/lib/types";
import TaskList from '@/components/task-list';

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
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">Archive</h1>
          <p className="text-muted-foreground mt-2">Completed and archived tasks.</p>
          <nav className="mt-4 flex justify-center gap-4 text-primary">
            <Link href="/" className="hover:underline">My Day</Link>
            <Link href="/entry" className="hover:underline">Entry</Link>
            <Link href="/incubate" className="hover:underline">Incubate</Link>
            <Link href="/reference" className="hover:underline">Reference</Link>
          </nav>
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
