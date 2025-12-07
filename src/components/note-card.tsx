
"use client"

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import type { Task, Stage } from "@/lib/types";
import { STAGES, STAGE_LABELS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
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

interface TaskCardProps {
  task: Task;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onDelete: (id: string) => void;
  showCheckbox?: boolean;
}

export default function TaskCard({ task, onUpdate, onDelete, showCheckbox = true }: TaskCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleStageChange = (stage: Stage) => {
    onUpdate(task.id, { stage });
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
                <p className={cn("text-sm font-medium leading-none whitespace-normal break-all", task.completed && "line-through text-muted-foreground")}>
                  {title}
                </p>
                {!isOpen && details.join(' ').length > 0 && (
                  <p className="text-xs text-muted-foreground whitespace-normal break-all">
                    {details.join(' ').substring(0, 30)}{details.join(' ').length > 30 ? '...' : ''}
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

                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Change Stage</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                          <DropdownMenuSubContent>
                          <DropdownMenuLabel>Move to</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STAGES.map(stage => (
                              <DropdownMenuItem key={stage} onClick={() => handleStageChange(stage)}>
                              {STAGE_LABELS[stage]}
                              </DropdownMenuItem>
                          ))}
                          </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <Badge variant="secondary">{STAGE_LABELS[task.stage]}</Badge>
                    <span>{formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}</span>
                </div>
            </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
