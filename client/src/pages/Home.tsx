import { useState } from "react";
import { useMediaRecorder } from "@/hooks/use-media-recorder";
import { useUploadRecording } from "@/hooks/use-recordings";
import { useToast } from "@/hooks/use-toast";
import { Timer } from "@/components/Timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Mic, Monitor, StopCircle, RefreshCw, Save, X, LayoutTemplate } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";

export default function Home() {
  const {
    status,
    startRecording,
    stopRecording,
    resetRecording,
    mediaBlobUrl,
    mediaBlob,
    previewStream,
    error,
    duration,
  } = useMediaRecorder();

  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const uploadMutation = useUploadRecording();
  
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Live preview effect
  const handlePreviewRef = (video: HTMLVideoElement | null) => {
    if (video && previewStream) {
      video.srcObject = previewStream;
    }
  };

  const handleSave = async () => {
    if (!mediaBlob) return;
    
    setIsUploading(true);
    const finalTitle = title.trim() || `Recording ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;

    try {
      await uploadMutation.mutateAsync({
        file: mediaBlob,
        title: finalTitle,
        duration: duration,
      });
      
      toast({
        title: "Success!",
        description: "Your recording has been saved to the gallery.",
      });
      setLocation("/gallery");
    } catch (err: any) {
      toast({
        title: "Upload failed",
        description: err.message,
        variant: "destructive",
      });
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen" />
      </div>

      <AnimatePresence mode="wait">
        {/* IDLE STATE */}
        {status === "idle" && (
          <motion.div 
            key="idle"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center z-10 max-w-lg w-full"
          >
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
              <div className="relative bg-card/50 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl">
                <Monitor className="size-16 text-primary mb-2 mx-auto" strokeWidth={1.5} />
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
              Start Recording
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Capture your screen, window, or specific tab in high quality. <br/>
              No watermarks, no time limits.
            </p>

            <button
              onClick={startRecording}
              className="btn-primary text-lg px-8 py-4 rounded-2xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-white/20 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <div className="flex items-center gap-3">
                <div className="size-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                Start Recording
              </div>
            </button>
            
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
              >
                {error}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* RECORDING STATE */}
        {status === "recording" && (
          <motion.div
            key="recording"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 w-full max-w-4xl flex flex-col items-center"
          >
            <div className="w-full aspect-video bg-black/80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden relative group">
              <video 
                ref={handlePreviewRef} 
                autoPlay 
                muted 
                playsInline
                className="w-full h-full object-contain"
              />
              
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-3 py-1.5 rounded-full bg-red-500/90 backdrop-blur text-white text-sm font-medium flex items-center gap-2 shadow-lg animate-pulse">
                  <div className="size-2 bg-white rounded-full" />
                  REC
                </div>
                <div className="px-3 py-1.5 rounded-full bg-black/50 backdrop-blur border border-white/10 text-white text-sm font-mono">
                  <Timer seconds={duration} />
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={stopRecording}
                className="btn-danger text-lg px-8 min-w-[200px]"
              >
                <StopCircle className="mr-2 size-5" />
                Stop Recording
              </button>
            </div>
            
            <p className="mt-4 text-muted-foreground text-sm">
              Click stop or use the browser controls to finish.
            </p>
          </motion.div>
        )}

        {/* PREVIEW/REVIEW STATE */}
        {status === "preview" && mediaBlobUrl && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="z-10 w-full max-w-4xl"
          >
            <div className="bg-card/50 backdrop-blur-md border border-white/10 rounded-3xl p-1 shadow-2xl overflow-hidden">
              <div className="bg-black rounded-2xl overflow-hidden aspect-video border border-white/5 relative">
                <video 
                  src={mediaBlobUrl} 
                  controls 
                  className="w-full h-full" 
                />
              </div>

              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start">
                <div className="flex-1 w-full space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground ml-1 mb-2 block">
                      Recording Title
                    </label>
                    <Input 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={`Recording - ${new Date().toLocaleDateString()}`}
                      className="bg-black/20 border-white/10 h-12 text-lg focus:border-primary/50 transition-colors"
                    />
                  </div>
                  
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                      Duration: <span className="text-white font-mono ml-1"><Timer seconds={duration} /></span>
                    </div>
                    {mediaBlob && (
                      <div className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/5">
                        Size: <span className="text-white ml-1">{(mediaBlob.size / (1024 * 1024)).toFixed(2)} MB</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto min-w-[180px]">
                  <button
                    onClick={handleSave}
                    disabled={isUploading}
                    className="btn-primary w-full"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 size-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 size-5" />
                        Save to Gallery
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={resetRecording}
                    disabled={isUploading}
                    className="btn-secondary w-full bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white"
                  >
                    <RefreshCw className="mr-2 size-4" />
                    Discard & New
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
