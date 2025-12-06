
"use client";

import { useMemo } from 'react';
import TasksBoard from "@/components/tasks-board";
import VoiceRecorder from "@/components/voice-recorder";
import { useTasks } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { tasks, addTask, updateTask, deleteTask, isLoading } = useTasks();

  const handleUpdate = (id: string, updates: Partial<(typeof tasks)[0]>) => {
    updateTask(id, updates);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">My Day</h1>
          <p className="text-muted-foreground mt-2">Capture your thoughts, organize your life.</p>
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
          <TasksBoard tasks={tasks} onUpdateTask={handleUpdate} onDeleteTask={deleteTask} />
        )}
      </main>
      
      <VoiceRecorder onNewNote={addTask} />
    </div>
  );
}
