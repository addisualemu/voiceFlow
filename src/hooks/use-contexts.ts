"use client";

import { useState, useEffect, useCallback } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { Identifier } from '@/lib/types';
import { DEFAULT_CONTEXTS } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useFirebase } from "@/components/firebase-provider";

export function useContexts() {
  const [contexts, setContexts] = useState<Identifier[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const { db } = useFirebase();

  // Load contexts from Firestore user document
  useEffect(() => {
    if (!user || !db) {
      setContexts([]);
      setIsLoading(false);
      return;
    }

    const loadContexts = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.contexts && Array.isArray(data.contexts)) {
            setContexts(data.contexts);
          } else {
            // Initialize with default contexts if field doesn't exist
            setContexts(DEFAULT_CONTEXTS);
            // Save defaults to Firestore
            await setDoc(userDocRef, { contexts: DEFAULT_CONTEXTS }, { merge: true });
          }
        } else {
          // User document doesn't exist, initialize with defaults
          setContexts(DEFAULT_CONTEXTS);
          await setDoc(userDocRef, { contexts: DEFAULT_CONTEXTS }, { merge: true });
        }
      } catch (error) {
        console.error("Error loading contexts:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Could not load contexts.",
        });
        // Fallback to defaults on error
        setContexts(DEFAULT_CONTEXTS);
      } finally {
        setIsLoading(false);
      }
    };

    loadContexts();
  }, [user, db, toast]);

  const addContext = useCallback(async (context: Identifier) => {
    if (!user || !db) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must be logged in to add contexts.",
      });
      return;
    }

    try {
      const newContexts = [...contexts, context];
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { contexts: newContexts }, { merge: true });
      setContexts(newContexts);

      toast({
        title: "Context added",
        description: `"${context.name}" has been added to your contexts.`,
      });
    } catch (error) {
      console.error("Error adding context:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not add context.",
      });
    }
  }, [user, db, contexts, toast]);

  const updateContext = useCallback(async (name: string, updates: Partial<Identifier>) => {
    if (!user || !db) return;

    try {
      const newContexts = contexts.map(ctx =>
        ctx.name === name ? { ...ctx, ...updates } : ctx
      );
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { contexts: newContexts }, { merge: true });
      setContexts(newContexts);

      toast({
        title: "Context updated",
        description: `"${name}" has been updated.`,
      });
    } catch (error) {
      console.error("Error updating context:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not update context.",
      });
    }
  }, [user, db, contexts, toast]);

  const deleteContext = useCallback(async (name: string) => {
    if (!user || !db) return;

    try {
      const newContexts = contexts.filter(ctx => ctx.name !== name);
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, { contexts: newContexts }, { merge: true });
      setContexts(newContexts);

      toast({
        title: "Context deleted",
        description: `"${name}" has been removed from your contexts.`,
      });
    } catch (error) {
      console.error("Error deleting context:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete context.",
      });
    }
  }, [user, db, contexts, toast]);

  return {
    contexts,
    isLoading,
    addContext,
    updateContext,
    deleteContext,
  };
}
