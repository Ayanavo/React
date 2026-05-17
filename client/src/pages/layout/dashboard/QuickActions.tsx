import React, { useState, useRef } from "react";
import { PlusCircle, Mic, Zap, UploadCloud } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-wrap items-center gap-3">
      <motion.div whileTap={{ scale: 0.97 }}>
        <Button variant="default" className="shadow-lg">
          <PlusCircle className="w-5 h-5" /> New Note
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button variant="secondary" className="shadow-lg" onClick={() => setRecOpen(true)}>
          <Mic className="w-5 h-5" /> Voice
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button variant="default" className="shadow-lg">
          <Zap className="w-5 h-5" /> AI Summarize
        </Button>
      </motion.div>

      <motion.div whileTap={{ scale: 0.97 }}>
        <Button variant="outline" className="shadow-lg">
          <UploadCloud className="w-5 h-5" /> Upload
        </Button>
      </motion.div>

      {recOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setRecOpen(false)} />
          <div className="relative z-10 p-6 rounded-3xl bg-card/95 border border-border shadow-2xl backdrop-blur-xl w-96">
            <h3 className="text-lg font-semibold text-foreground mb-3">Voice Note</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Record a short voice note to attach to your ideas.</p>
            <div className="flex flex-col gap-3">
              {!recording ?
                <Button variant="secondary" className="shadow-lg" onClick={startRecording}>
                  Start recording
                </Button>
              : <Button variant="default" className="shadow-lg" onClick={stopRecording}>
                  Stop recording
                </Button>
              }
              {audioUrl && <audio controls src={audioUrl} className="w-full rounded-xl bg-background p-2" />}
            </div>
            <div className="mt-4 text-right">
              <button onClick={() => setRecOpen(false)} className="text-slate-500 dark:text-slate-400 hover:text-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickActions;
