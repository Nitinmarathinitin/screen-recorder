import { useState, useRef, useCallback, useEffect } from "react";

export type RecorderStatus = "idle" | "recording" | "paused" | "preview";

interface UseMediaRecorderReturn {
  status: RecorderStatus;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;
  mediaBlob: Blob | null;
  mediaBlobUrl: string | null;
  previewStream: MediaStream | null;
  error: string | null;
  duration: number;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup URLs on unmount
      if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [mediaBlobUrl]);

  const startTimer = () => {
    setDuration(0);
    timerRef.current = window.setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor",
          frameRate: { ideal: 30 }
        },
        audio: true, // System audio if user selects "share audio"
      });

      setPreviewStream(stream);

      // Handle user clicking "Stop Sharing" in browser UI
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        setMediaBlob(blob);
        setMediaBlobUrl(url);
        setStatus("preview");
        stopTimer();
        
        // Stop all tracks to release camera/screen
        stream.getTracks().forEach((track) => track.stop());
        setPreviewStream(null);
      };

      recorder.start(1000); // Collect chunks every second
      setStatus("recording");
      startTimer();
    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(err.message || "Failed to start recording");
      setStatus("idle");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      // Status update happens in onstop handler
    }
  }, []);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.pause();
      setStatus("paused");
      stopTimer();
    }
  }, []);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "paused") {
      mediaRecorderRef.current.resume();
      setStatus("recording");
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    }
  }, []);

  const resetRecording = useCallback(() => {
    setStatus("idle");
    setMediaBlob(null);
    if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
    setMediaBlobUrl(null);
    setError(null);
    setDuration(0);
    setPreviewStream(null);
  }, [mediaBlobUrl]);

  return {
    status,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,
    mediaBlob,
    mediaBlobUrl,
    previewStream,
    error,
    duration,
  };
}
