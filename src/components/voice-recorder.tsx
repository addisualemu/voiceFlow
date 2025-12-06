"use client";

import { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Save, LoaderCircle } from 'lucide-react';
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
import { Textarea } from './ui/textarea';

interface VoiceRecorderProps {
  onNewNote: (content: string, title: string) => void;
}

let SpeechRecognition: any = null;
if (typeof window !== 'undefined') {
  SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
}


export default function VoiceRecorder({ onNewNote }: VoiceRecorderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [recordingTime, setRecordingTime] = useState(0);

  const recognitionRef = useRef<any | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    if (!SpeechRecognition) {
      if(isOpen) {
        toast({
          variant: 'destructive',
          title: 'Browser Not Supported',
          description: 'Speech recognition is not supported in your browser.',
        });
      }
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setTranscript(transcript + finalTranscript + interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({
        variant: 'destructive',
        title: 'Recognition Error',
        description: `An error occurred: ${event.error}`,
      });
      setIsRecording(false);
    };

    recognitionRef.current = recognition;
  }, [toast, transcript, isOpen]);

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

  const handleStartRecording = () => {
    if (recognitionRef.current) {
      setTranscript('');
      recognitionRef.current.start();
      setIsRecording(true);
      setTitle('');
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSave = () => {
    if (transcript) {
      setIsProcessing(true);
      onNewNote(transcript, title);
      setIsProcessing(false);
      resetAndClose();
    }
  };
  
  const resetAndClose = () => {
    setIsOpen(false);
    setIsRecording(false);
    setTranscript('');
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
        disabled={!SpeechRecognition}
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

            {(transcript || isRecording) && (
              <div className="grid w-full items-center gap-1.5">
                 <Label htmlFor="title">Title (optional)</Label>
                <Input
                  id="title"
                  placeholder="e.g., Meeting idea"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <Label htmlFor="transcript">Transcript</Label>
                <Textarea
                  id="transcript"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={isRecording ? "Listening..." : "Your transcribed text will appear here."}
                  rows={8}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleSave} disabled={!transcript || isProcessing}>
              {isProcessing ? <LoaderCircle className="animate-spin" /> : <Save />}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
