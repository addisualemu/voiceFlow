
"use client"

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, Stage } from "@/lib/types";
import { STAGES, STAGE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent } from './ui/card';
import { cn } from '@/lib/utils';
import { ActionableTaskDialog } from '@/components/actionable-task-dialog';

// Stage transition mapping - defines which stages a task can move to from each stage
const STAGE_TRANSITIONS: Record<Stage, Stage[]> = {
  Entry: ['Incubate', 'Reference', 'Archive', 'Project', 'Actionable'],
  Incubate: ['Reference', 'Archive', 'Project', 'Actionable'],
  Reference: ['Archive'],
  Archive: [],
  Project: [],
  Actionable: [],
};

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showCheckbox?: boolean;
}

export default function TaskCard({ task, onUpdate, onDelete, showCheckbox = true }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showActionableDialog, setShowActionableDialog] = useState(false);
  const [pendingTask, setPendingTask] = useState<Task | null>(null);

  const handleStageChange = (stage: Stage) => {
    if (stage === 'Actionable') {
      // Intercept and show dialog
      setPendingTask(task);
      setShowActionableDialog(true);
    } else {
      // Direct update for other stages
      onUpdate(task.id, { stage });
    }
  };
  
  const handleCompleteToggle = () => {
    onUpdate(task.id, { completed: !task.completed });
  };
  
  const [title, ...details] = task.detail.split('\n');

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={cn("w-full transition-all hover:shadow-md overflow-hidden", task.completed && "bg-muted/50")}>
        <div className="flex items-center p-2 min-w-0">
            {showCheckbox && (
              <Checkbox
                id={`task-${task.id}`}
                checked={task.completed}
                onCheckedChange={handleCompleteToggle}
                className="mr-4"
                aria-label="Mark task as complete"
              />
            )}
            <CollapsibleTrigger asChild>
              <div className={cn("flex-grow cursor-pointer overflow-hidden min-w-0", !showCheckbox && 'ml-4')}>
                {!isOpen && title.length > 0 && (
                  <p className={cn("text-sm font-medium leading-none whitespace-normal break-all", task.completed && "line-through text-muted-foreground")}>
                    {title.substring(0, 60)}{title.length > 60 ? '...' : ''}
                  </p>
            
                )}
                {isOpen && title.length > 0 && (
                  <p className={cn("text-sm font-medium leading-none whitespace-normal break-all", task.completed && "line-through text-muted-foreground")}>
                    {title}
                  </p>
            
                )}
              </div>
            </CollapsibleTrigger>
             <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0 ml-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    </DropdownMenuContent>
                </DropdownMenu>
                <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your task.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(task.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <CollapsibleTrigger>
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </CollapsibleTrigger>
            </Button>
        </div>
        <CollapsibleContent>
            <CardContent className="px-12 py-2 break-words">
                {details.length > 0 && <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">{details.join('\n')}</p>}
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap gap-1.5">
                        {STAGE_TRANSITIONS[task.stage].map(stage => (
                            <Button
                                key={stage}
                                variant="outline"
                                size="sm"
                                onClick={() => handleStageChange(stage)}
                                className="text-xs h-8 px-2.5"
                                aria-label={`Move to ${STAGE_LABELS[stage]}`}
                            >
                                {STAGE_LABELS[stage]}
                            </Button>
                        ))}
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
                    </span>
                </div>
            </CardContent>
        </CollapsibleContent>
      </Card>

      {/* Actionable Task Configuration Dialog */}
      <ActionableTaskDialog
        open={showActionableDialog}
        onOpenChange={setShowActionableDialog}
        task={pendingTask || task}
        onSubmit={(updates) => {
          onUpdate(task.id, {
            ...updates,
            stage: 'Actionable'
          });
          setShowActionableDialog(false);
          setPendingTask(null);
        }}
      />
    </Collapsible>
  );
}
