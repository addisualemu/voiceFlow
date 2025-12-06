
export type Stage = 'Entry' | 'Actionable' | 'Incubate' | 'Reference' | 'Archive';

export const STAGES: Stage[] = ['Entry', 'Actionable', 'Incubate', 'Reference', 'Archive'];

export const STAGE_LABELS: Record<Stage, string> = {
  Entry: 'Entry',
  Actionable: 'Actionable',
  Incubate: 'Incubate',
  Reference: 'Reference',
  Archive: 'Archive',
};

export interface Identifier {
  name: string;
  color?: string;
  icon?: string;
}

export interface Task {
  id: string;
  detail: string; // Formerly title/content
  context?: Identifier;
  timeFrame?: {
    start?: number; // timestamp
    end?: number; // timestamp
  };
  dayOfWeek?: number;
  dayOfMonth?: number;
  alertDateTime?: number; // timestamp
  deadlineDateTime?: number; // timestamp
  priority?: number;
  children?: Task[];
  stage: Stage;
  createdAt: number; // timestamp
  completed: boolean;
}
