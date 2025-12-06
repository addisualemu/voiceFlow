
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Task, Stage } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'voiceflow-tasks';

const initialTasks: Task[] = [
  { id: '1', detail: 'Brainstorm marketing ideas. We should explore social media campaigns and influencer marketing.', createdAt: Date.now() - 1000 * 60 * 5, stage: 'Actionable', priority: 1, completed: false },
  { id: '2', detail: 'Weekly team sync feedback. The new sprint planning process is working well. Keep it up.', createdAt: Date.now() - 1000 * 60 * 60 * 2, stage: 'Reference', completed: false },
  { id: '3', detail: 'Refactor the authentication flow. The current implementation is complex. Need to break it down into smaller, manageable parts. Start with the JWT handling.', createdAt: Date.now() - 1000 * 60 * 60 * 24, stage: 'Actionable', priority: 2, completed: true },
  { id: '4', detail: 'Grocery list: Milk, eggs, bread, and coffee.', createdAt: Date.now() - 1000 * 60 * 30, stage: 'Entry', completed: false },
  { id: '5', detail: "API key is expiring. The billing API key needs to be rotated. I'm blocked by finance to get the new key.", createdAt: Date.now() - 1000 * 60 * 60 * 8, stage: 'Incubate', completed: false },
  { id: '6', detail: 'Follow up with Jane Doe. Send an email to Jane about the Q3 proposal.', createdAt: Date.now() - 1000 * 60 * 60 * 3, stage: 'Actionable', priority: 1, completed: false },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedTasksJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedTasksJson) {
        const savedTasks = JSON.parse(savedTasksJson);
        setTasks(savedTasks);
      } else {
        setTasks(initialTasks);
      }
    } catch (error) {
      console.error("Failed to load tasks from local storage:", error);
      setTasks(initialTasks);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveTasks = useCallback((updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedTasks));
    } catch (error) {
      console.error("Failed to save tasks to local storage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save tasks locally.",
      });
    }
  }, [toast]);

  const addTask = useCallback((content: string, title: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      detail: title ? `${title}\n${content}`: content,
      stage: 'Entry',
      completed: false,
    };
    saveTasks([newTask, ...tasks]);
    toast({
      title: "Task created!",
      description: "Your new task has been added.",
    });
  }, [tasks, saveTasks, toast]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, ...updates } : task
    );
    saveTasks(updatedTasks);
  }, [tasks, saveTasks]);

  const deleteTask = useCallback((id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    saveTasks(updatedTasks);
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  }, [tasks, saveTasks, toast]);
  

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
  };
}
