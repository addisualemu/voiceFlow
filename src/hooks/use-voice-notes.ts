
"use client";

import { useState, useEffect, useCallback } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp } from 'firebase/firestore';
import type { Task } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase } from "@/components/firebase-provider";

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { db } = useFirebase();

  // Real-time listener for tasks from Firestore
  useEffect(() => {
    if (!user || !db) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    const tasksRef = collection(db, 'users', user.uid, 'tasks');
    const q = query(tasksRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedTasks: Task[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        loadedTasks.push({
          id: doc.id,
          detail: data.detail,
          stage: data.stage,
          completed: data.completed,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
          priority: data.priority,
          context: data.context,
          timeFrame: data.timeFrame,
          dayOfWeek: data.dayOfWeek,
          dayOfMonth: data.dayOfMonth,
          alertDateTime: data.alertDateTime,
          deadlineDateTime: data.deadlineDateTime,
          children: data.children,
        });
      });
      setTasks(loadedTasks);
      setIsLoading(false);
    }, (error) => {
      console.error("Error loading tasks from Firestore:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load tasks from database.",
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, db, toast]);

  const addTask = useCallback(async (content: string, title: string) => {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to create tasks.",
      });
      return;
    }

    try {
      const tasksRef = collection(db, 'users', user.uid, 'tasks');
      await addDoc(tasksRef, {
        detail: title ? `${title}\n${content}` : content,
        stage: 'Entry',
        completed: false,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Task created!",
        description: "Your new task has been added.",
      });
    } catch (error) {
      console.error("Error adding task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create task.",
      });
    }
  }, [user, db, toast]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    if (!user || !db) return;

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);

      // Remove id and createdAt from updates if present (they shouldn't be updated)
      const { id: _, createdAt, ...updateData } = updates as any;

      await updateDoc(taskRef, updateData);
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update task.",
      });
    }
  }, [user, db, toast]);

  const deleteTask = useCallback(async (id: string) => {
    if (!user || !db) return;

    try {
      const taskRef = doc(db, 'users', user.uid, 'tasks', id);
      await deleteDoc(taskRef);

      toast({
        title: "Task deleted",
        description: "The task has been removed.",
      });
    } catch (error) {
      console.error("Error deleting task:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete task.",
      });
    }
  }, [user, db, toast]);

  return {
    tasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
  };
}
