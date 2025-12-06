"use client"

import type { Note, TaskStatus } from "@/lib/types";
import { TASK_STATUSES, TASK_STATUS_LABELS } from "@/lib/types";
import NoteCard from "./note-card";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Separator } from "./ui/separator";

interface TasksBoardProps {
  tasks: Note[];
  onUpdateNote: (id: string, updates: Partial<Note>) => void;
  onDeleteNote: (id: string) => void;
}

export default function TasksBoard({ tasks, onUpdateNote, onDeleteNote }: TasksBoardProps) {
  
  if (tasks.length === 0) {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <p>No tasks yet.</p>
            <p className="text-sm">Click the microphone to create a new note and move it to tasks.</p>
        </div>
    )
  }
  
  return (
    <div className="w-full">
      <div className="flex gap-6 overflow-x-auto pb-4 -mx-4 px-4">
        {TASK_STATUSES.map((status: TaskStatus) => (
          <div key={status} className="w-full md:w-96 flex-shrink-0">
            <Card className="h-full bg-background/50">
              <CardHeader>
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{TASK_STATUS_LABELS[status]}</span>
                    <span className="text-sm font-medium bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                        {tasks.filter(t => t.taskStatus === status).length}
                    </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 h-full">
                {tasks.filter(t => t.taskStatus === status).map((task) => (
                  <NoteCard key={task.id} note={task} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
                ))}
                {tasks.filter(t => t.taskStatus === status).length === 0 && (
                    <div className="text-center py-10 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                        <p>No tasks in this stage.</p>
                    </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}
