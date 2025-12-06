"use client"

import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, BookText, CheckSquare, Trash2, GitBranch, XCircle, ListTodo } from 'lucide-react';
import type { Note, NoteCategory, TaskStatus } from "@/lib/types";
import { TASK_STATUSES, TASK_STATUS_LABELS } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuPortal, DropdownMenuSubContent } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
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

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Note>) => void;
  onDelete: (id: string) => void;
}

const statusIcons: Record<TaskStatus, React.ReactNode> = {
    todo: <ListTodo className="h-4 w-4 mr-2" />,
    need_tobe_braken_down: <GitBranch className="h-4 w-4 mr-2" />,
    blocked: <XCircle className="h-4 w-4 mr-2" />,
}

export default function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {

  const handleCategoryChange = (category: NoteCategory) => {
    const updates: Partial<Note> = { category };
    if (category === 'task' && !note.taskStatus) {
      updates.taskStatus = 'todo';
    }
    onUpdate(note.id, updates);
  };

  const handleStatusChange = (status: TaskStatus) => {
    onUpdate(note.id, { taskStatus: status });
  };
  
  return (
    <Card className="w-full transition-all hover:shadow-md">
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle className="text-lg">{note.title}</CardTitle>
                <CardDescription>
                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                </CardDescription>
            </div>
          
            <AlertDialog>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleCategoryChange(note.category === 'task' ? 'memo' : 'task')}>
                        {note.category === 'task' ? <BookText className="mr-2 h-4 w-4" /> : <CheckSquare className="mr-2 h-4 w-4" />}
                        Move to {note.category === 'task' ? 'Memos' : 'Tasks'}
                    </DropdownMenuItem>
                    {note.category === 'task' && (
                        <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Change Status</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                            <DropdownMenuLabel>Task Status</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {TASK_STATUSES.map(status => (
                                <DropdownMenuItem key={status} onClick={() => handleStatusChange(status)}>
                                {statusIcons[status]}
                                {TASK_STATUS_LABELS[status]}
                                </DropdownMenuItem>
                            ))}
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                        </DropdownMenuSub>
                    )}
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
                        This action cannot be undone. This will permanently delete your note.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onDelete(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </CardHeader>
      <CardContent>
        {note.audioUrl ? (
          <audio src={note.audioUrl} controls className="w-full" />
        ) : (
          <div className="text-sm text-muted-foreground">Audio not available.</div>
        )}
      </CardContent>
      {note.category === 'task' && note.taskStatus && (
        <CardFooter>
            <Badge variant="secondary" className="flex items-center">
                {statusIcons[note.taskStatus]}
                {TASK_STATUS_LABELS[note.taskStatus]}
            </Badge>
        </CardFooter>
      )}
    </Card>
  );
}
