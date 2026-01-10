
export type Stage = 'Entry' | 'Actionable' | 'Incubate' | 'Reference' | 'Archive' | 'Project';

export const STAGES: Stage[] = ['Entry', 'Actionable', 'Incubate', 'Reference', 'Archive', 'Project'];

export const STAGE_LABELS: Record<Stage, string> = {
  Entry: 'Entry',
  Actionable: 'Actionable',
  Incubate: 'Incubate',
  Reference: 'Reference',
  Archive: 'Archive',
  Project: 'Project',
};

export interface Identifier {
  name: string;
  color?: string;
  icon?: string;
}

export interface TimeOfDay {
  hour: number;    // 0-23
  minute: number;  // 0-59
}

export interface Task {
  id: string;
  detail: string; // Formerly title/content
  context?: Identifier;
  timeFrame?: {
    start?: TimeOfDay;
    end?: TimeOfDay;
  };
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dayOfMonth?: number;
  repeated?: boolean; // Whether task repeats on timeFrame/daysOfWeek schedule
  alertDateTime?: number; // timestamp (date only, at midnight) - when task is at risk
  deadlineDateTime?: number; // timestamp (date only, at midnight) - when task fails if not complete
  priority?: number;
  children?: Task[];
  stage: Stage;
  createdAt: number; // timestamp
  completed: boolean;
}

export const DEFAULT_CONTEXTS: Identifier[] = [
  { name: 'Home', color: '#3b82f6', icon: 'Home' },
  { name: 'Office', color: '#10b981', icon: 'Briefcase' },
  { name: 'Computer', color: '#8b5cf6', icon: 'Monitor' },
  { name: 'Phone', color: '#f59e0b', icon: 'Phone' },
  { name: 'Errands', color: '#ef4444', icon: 'ShoppingCart' },
];
