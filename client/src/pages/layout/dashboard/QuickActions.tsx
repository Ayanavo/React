import { Button } from "@/components/ui/button";
import { Mic, Plus, Upload, Zap } from "lucide-react";
import React, { useRef, useState } from "react";

const QuickActions: React.FC = () => {
  const [recOpen, setRecOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mr = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    mr.ondataavailable = (e) => chunks.push(e.data);
    mr.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/webm" });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);
    };
    mediaRef.current = mr;
    mr.start();
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Button>
          <Plus className="h-4 w-4" />
          New Note
        </Button>
        <Button variant="outline" onClick={() => setRecOpen(true)}>
          <Mic className="h-4 w-4" />
          Voice
        </Button>
        <Button variant="outline">
          <Zap className="h-4 w-4" />
          AI Summarize
        </Button>
        <Button variant="outline">
          <Upload className="h-4 w-4" />
          Import
        </Button>
      </div>

      {recOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setRecOpen(false)} />
          <div className="relative z-10 w-full max-w-md rounded-xl border bg-card p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-foreground">Voice Note</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record a short voice note to attach to your ideas.</p>
            <div className="mt-4 flex flex-col gap-3">
              {!recording ?
                <Button variant="secondary" onClick={startRecording}>
                  Start recording
                </Button>
              : <Button onClick={stopRecording}>Stop recording</Button>}
              {audioUrl && <audio controls src={audioUrl} className="w-full rounded-xl" />}
            </div>
            <div className="mt-4 text-right">
              <Button variant="ghost" size="sm" onClick={() => setRecOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default QuickActions;
