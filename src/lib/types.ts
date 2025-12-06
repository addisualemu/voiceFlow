export type TaskStatus = 'todo' | 'need_tobe_braken_down' | 'blocked';

export const TASK_STATUSES: TaskStatus[] = ['todo', 'need_tobe_braken_down', 'blocked'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  need_tobe_braken_down: 'Needs Breakdown',
  blocked: 'Blocked',
};

export type NoteCategory = 'memo' | 'task';

export interface Note {
  id: string;
  createdAt: number; // timestamp
  audioUrl: string;
  title: string;
  category: NoteCategory;
  taskStatus?: TaskStatus;
}
