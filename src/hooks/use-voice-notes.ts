"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Note, NoteCategory, TaskStatus } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";

const FAKE_AUDIO_URL = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA==";
const LOCAL_STORAGE_KEY = 'voiceflow-notes';

const initialNotes: Note[] = [
  { id: '1', title: 'Brainstorm marketing ideas', createdAt: Date.now() - 1000 * 60 * 5, audioUrl: FAKE_AUDIO_URL, category: 'task', taskStatus: 'todo' },
  { id: '2', title: 'Weekly team sync feedback', createdAt: Date.now() - 1000 * 60 * 60 * 2, audioUrl: FAKE_AUDIO_URL, category: 'memo' },
  { id: '3', title: 'Refactor the authentication flow', createdAt: Date.now() - 1000 * 60 * 60 * 24, audioUrl: FAKE_AUDIO_URL, category: 'task', taskStatus: 'need_tobe_braken_down' },
  { id: '4', title: 'Grocery list', createdAt: Date.now() - 1000 * 60 * 30, audioUrl: FAKE_AUDIO_URL, category: 'memo' },
  { id: '5', title: 'API key is expiring', createdAt: Date.now() - 1000 * 60 * 60 * 8, audioUrl: FAKE_AUDIO_URL, category: 'task', taskStatus: 'blocked' },
  { id: '6', title: 'Follow up with Jane Doe', createdAt: Date.now() - 1000 * 60 * 60 * 3, audioUrl: FAKE_AUDIO_URL, category: 'task', taskStatus: 'todo' },
];

export function useVoiceNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    // Simulate loading from local storage and Firebase
    try {
      const savedNotesJson = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedNotesJson) {
        const savedNotes = JSON.parse(savedNotesJson);
        // Note: audioUrl from createObjectURL is not persistent. This is a limitation of this scaffold.
        // A real app would upload to a service like Firebase Storage and save the persistent URL.
        setNotes(savedNotes);
      } else {
        // First time load, use initial mock data
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
    // This is where you would also sync with Firebase
    setNotes(updatedNotes);
    try {
      // We only store metadata, not the audio blob itself in local storage.
      const notesToSave = updatedNotes.map(({ audioUrl, ...rest }) => ({
        ...rest,
        audioUrl: FAKE_AUDIO_URL, // Use placeholder for stored notes
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(notesToSave));
    } catch (error) {
      console.error("Failed to save notes to local storage:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not save notes locally.",
      });
    }
  }, [toast]);

  const addNote = useCallback((audioBlob: Blob, title: string) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const newNote: Note = {
      id: Date.now().toString(),
      createdAt: Date.now(),
      title: title || `Note on ${new Date().toLocaleDateString()}`,
      audioUrl,
      category: 'memo', // Default to memo
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
