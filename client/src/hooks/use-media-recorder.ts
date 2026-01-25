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
  hasWebcam: boolean;
  setHasWebcam: (val: boolean) => void;
  webcamStream: MediaStream | null;
  quality: string;
  setQuality: (val: string) => void;
}

export function useMediaRecorder(): UseMediaRecorderReturn {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [hasWebcam, setHasWebcam] = useState(false);
  const [quality, setQuality] = useState("1080p");
  const [mediaBlob, setMediaBlob] = useState<Blob | null>(null);
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewStream, setPreviewStream] = useState<MediaStream | null>(null);
  const [webcamStream, setWebcamStream] = useState<MediaStream | null>(null);
  const [duration, setDuration] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup
      if (mediaBlobUrl) URL.revokeObjectURL(mediaBlobUrl);
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
    };
  }, [mediaBlobUrl, webcamStream]);

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
      
      const constraints: DisplayMediaStreamOptions = {
        video: { 
          displaySurface: "monitor", 
        },
        audio: true,
      };

      if (quality === "720p") {
        (constraints.video as any).width = { ideal: 1280 };
        (constraints.video as any).height = { ideal: 720 };
      } else if (quality === "4k") {
        (constraints.video as any).width = { ideal: 3840 };
        (constraints.video as any).height = { ideal: 2160 };
      } else {
        (constraints.video as any).width = { ideal: 1920 };
        (constraints.video as any).height = { ideal: 1080 };
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia(constraints);

      let finalStream = screenStream;

      if (hasWebcam) {
        try {
          const camStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          setWebcamStream(camStream);
        } catch (e) {
          console.error("Failed to get webcam:", e);
        }
      }

      setPreviewStream(screenStream);

      screenStream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };

      const recorder = new MediaRecorder(screenStream, { mimeType: "video/webm;codecs=vp8,opus" });
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
        
        screenStream.getTracks().forEach((track) => track.stop());
        if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
        setPreviewStream(null);
        setWebcamStream(null);
      };

      recorder.start(1000);
      setStatus("recording");
      startTimer();
    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(err.message || "Failed to start recording");
      setStatus("idle");
    }
  }, [hasWebcam]);

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
