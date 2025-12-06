"use client";

import { useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MemosList from "@/components/memos-list";
import TasksBoard from "@/components/tasks-board";
import VoiceRecorder from "@/components/voice-recorder";
import { useVoiceNotes } from "@/hooks/use-voice-notes";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { notes, addNote, updateNote, deleteNote, isLoading } = useVoiceNotes();

  const memos = useMemo(() => notes.filter(n => n.category === 'memo'), [notes]);
  const tasks = useMemo(() => notes.filter(n => n.category === 'task'), [notes]);

  const handleUpdate = (id: string, updates: Partial<(typeof notes)[0]>) => {
    updateNote(id, updates);
  };
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-headline font-bold text-primary">VoiceFlow</h1>
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
          <Tabs defaultValue="tasks" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="memos">Memos</TabsTrigger>
            </TabsList>
            <TabsContent value="tasks" className="mt-6">
              <TasksBoard tasks={tasks} onUpdateNote={handleUpdate} onDeleteNote={deleteNote} />
            </TabsContent>
            <TabsContent value="memos" className="mt-6">
              <MemosList memos={memos} onUpdateNote={handleUpdate} onDeleteNote={deleteNote} />
            </TabsContent>
          </Tabs>
        )}
      </main>
      
      <VoiceRecorder onNewNote={addNote} />
    </div>
  );
}
