
"use client"

import type { Task, Stage } from "@/lib/types";
import { STAGES, STAGE_LABELS } from "@/lib/types";
import TaskCard from "./note-card";
import TaskList from "./task-list";

interface TasksBoardProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  stages?: Stage[];
}

export default function TasksBoard({ tasks, onUpdateTask, onDeleteTask, stages = STAGES }: TasksBoardProps) {
  
  if (tasks.length === 0) {
    return (
        <div className="text-center py-12 text-muted-foreground">
            <p>No tasks yet.</p>
            <p className="text-sm">Click the microphone to create a new task.</p>
        </div>
    )
  }
  
  const groupedTasks = tasks.reduce((acc, task) => {
    if (stages.includes(task.stage)) {
        (acc[task.stage] = acc[task.stage] || []).push(task);
    }
    return acc;
  }, {} as Record<Stage, Task[]>);

  // If there's only one stage, use the list view.
  if (stages.length === 1) {
    return <TaskList tasks={tasks} onUpdateTask={onUpdateTask} onDeleteTask={onDeleteTask} />
  }

  return (
    <div className="w-full space-y-6">
      {stages.map((stage: Stage) => (
        <div key={stage}>
            <h2 className="text-xl font-semibold mb-4">{STAGE_LABELS[stage]}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(groupedTasks[stage] || []).map((task) => (
                <TaskCard key={task.id} task={task} onUpdate={onUpdateTask} onDelete={onDeleteTask} />
              ))}
              {(groupedTasks[stage] || []).length === 0 && (
                  <div className="text-center py-10 text-sm text-muted-foreground border-2 border-dashed rounded-lg col-span-full">
                      <p>No tasks in this stage.</p>
                  </div>
              )}
            </div>
        </div>
      ))}
    </div>
  );
}
