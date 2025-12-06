"use client"

import type { Note } from "@/lib/types";
import NoteCard from "./note-card";

interface MemosListProps {
    memos: Note[];
    onUpdateNote: (id: string, updates: Partial<Note>) => void;
    onDeleteNote: (id: string) => void;
}

export default function MemosList({ memos, onUpdateNote, onDeleteNote }: MemosListProps) {
    if (memos.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground">
                <p>No memos yet.</p>
                <p className="text-sm">Click the microphone to record a new voice note.</p>
            </div>
        )
    }

    return (
        <div className="max-w-2xl mx-auto space-y-4">
            {memos.map(memo => (
                <NoteCard key={memo.id} note={memo} onUpdate={onUpdateNote} onDelete={onDeleteNote} />
            ))}
        </div>
    )
}
