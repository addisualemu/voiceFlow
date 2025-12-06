"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Save, X, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onNewNote: (audioBlob: Blob, title: string) => void;
}

export default function VoiceRecorder({ onNewNote }: VoiceRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (isRecording) {
      timerIntervalRef.current = setInterval(() => {
        setRecordingTime(prevTime => prevTime + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      setRecordingTime(0);
    }
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRecording]);

  const handleStartRecording = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
          audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop()); // Stop microphone access
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setAudioBlob(null);
        setTitle('');
      } catch (err) {
        console.error('Error accessing microphone:', err);
        toast({
          variant: 'destructive',
          title: 'Microphone Error',
          description: 'Could not access the microphone. Please check your browser permissions.',
        });
      }
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (audioBlob) {
      setIsProcessing(true);
      onNewNote(audioBlob, title);
      setIsProcessing(false);
      resetAndClose();
    }
  };
  
  const resetAndClose = () => {
    setIsOpen(false);
    setIsRecording(false);
    setAudioBlob(null);
    setTitle('');
    setRecordingTime(0);
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <Button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg z-50"
        size="icon"
        onClick={() => setIsOpen(true)}
        aria-label="Record new note"
      >
        <Mic className="h-8 w-8" />
      </Button>

      <Dialog open={isOpen} onOpenChange={(open) => !open && resetAndClose()}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>New Voice Note</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <Button
                variant={isRecording ? 'destructive' : 'default'}
                size="lg"
                className="h-20 w-20 rounded-full"
                onClick={isRecording ? handleStopRecording : handleStartRecording}
              >
                {isRecording ? <StopCircle className="h-10 w-10" /> : <Mic className="h-10 w-10" />}
              </Button>
              <div className="h-6">
                {isRecording && (
                    <div className="flex items-center gap-2 text-red-500">
                        <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                        <span className="font-mono">{formatTime(recordingTime)}</span>
                    </div>
                )}
              </div>
            </div>

            {audioBlob && (
              <div className="grid w-full items-center gap-1.5">
                <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Meeting idea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="mt-2">
                  <audio src={URL.createObjectURL(audioBlob)} controls className="w-full" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!audioBlob || isProcessing}>
              {isProcessing ? <LoaderCircle className="animate-spin" /> : <Save />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
