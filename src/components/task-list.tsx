
"use client";

import type { Task } from "@/lib/types";
import TaskCard from "./note-card";

interface TaskMatches {
  timeFrame: boolean;
  context: boolean;
  daysOfWeek: boolean;
}

interface TaskListProps {
  tasks: Task[];
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onDeleteTask: (id: string) => void;
  showCheckbox?: boolean;
  taskMatches?: TaskMatches[];
}

export default function TaskList({ tasks, onUpdateTask, onDeleteTask, showCheckbox = true, taskMatches }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tasks in this view.</p>
        <p className="text-sm">Click the microphone to create a new task.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, index) => (
        <TaskCard
          key={task.id}
          task={task}
          onUpdate={onUpdateTask}
          onDelete={onDeleteTask}
          showCheckbox={showCheckbox}
          matches={taskMatches?.[index]}
        />
      ))}
    </div>
  );
}
