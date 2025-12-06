"use client";

import { useState, useEffect, useCallback } from 'react';
import type { Note } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const LOCAL_STORAGE_KEY = 'voiceflow-notes';

const initialNotes: Note[] = [
  { id: '1', title: 'Brainstorm marketing ideas', createdAt: Date.now() - 1000 * 60 * 5, content: 'We should explore social media campaigns and influencer marketing.', category: 'task', taskStatus: 'todo' },
  { id: '2', title: 'Weekly team sync feedback', createdAt: Date.now() - 1000 * 60 * 60 * 2, content: 'The new sprint planning process is working well. Keep it up.', category: 'memo' },
  { id: '3', title: 'Refactor the authentication flow', createdAt: Date.now() - 1000 * 60 * 60 * 24, content: 'The current implementation is complex. Need to break it down into smaller, manageable parts. Start with the JWT handling.', category: 'task', taskStatus: 'need_tobe_braken_down' },
  { id: '4', title: 'Grocery list', createdAt: Date.now() - 1000 * 60 * 30, content: 'Milk, eggs, bread, and coffee.', category: 'memo' },
  { id: '5', title: 'API key is expiring', createdAt: Date.now() - 1000 * 60 * 60 * 8, content: "The billing API key needs to be rotated. I'm blocked by finance to get the new key.", category: 'task', taskStatus: 'blocked' },
  { id: '6', title: 'Follow up with Jane Doe', createdAt: Date.now() - 1000 * 60 * 60 * 3, content: 'Send an email to Jane about the Q3 proposal.', category: 'task', taskStatus: 'todo' },
];

export function useVoiceNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const savedNotesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNotesJson) {
        const savedNotes = JSON.parse(savedNotesJson);
        setNotes(savedNotes);
      } else {
        setNotes(initialNotes);
      }
    } catch (error) {
      console.error("Failed to load notes from local storage:", error);
      setNotes(initialNotes);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveNotes = useCallback((updatedNotes: Note[]) => {
    setNotes(updatedNotes);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedNotes));
    } catch (error) {
      console.error("Failed to save notes to local storage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save notes locally.",
      });
    }
  }, [toast]);

  const addNote = useCallback((content: string, title: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      title: title || `Note on ${new Date().toLocaleDateString()}`,
      content,
      category: 'memo',
    };
    saveNotes([newNote, ...notes]);
    toast({
      title: "Note saved!",
      description: "Your new voice note has been added to memos.",
    });
  }, [notes, saveNotes, toast]);

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const updatedNotes = notes.map(note =>
      note.id === id ? { ...note, ...updates } : note
    );
    saveNotes(updatedNotes);
  }, [notes, saveNotes]);

  const deleteNote = useCallback((id: string) => {
    const updatedNotes = notes.filter(note => note.id !== id);
    saveNotes(updatedNotes);
    toast({
      title: "Note deleted",
      description: "The note has been removed.",
    });
  }, [notes, saveNotes, toast]);
  

  return {
    notes,
    isLoading,
    addNote,
    updateNote,
    deleteNote,
  };
}
