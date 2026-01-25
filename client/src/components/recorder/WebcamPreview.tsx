import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

interface WebcamPreviewProps {
  stream: MediaStream | null;
}

export function WebcamPreview({ stream }: WebcamPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) return null;

  return (
    <motion.div
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      className="absolute bottom-4 right-4 w-48 aspect-video bg-black rounded-xl border-2 border-primary overflow-hidden shadow-2xl cursor-move z-50"
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      />
    </motion.div>
  );
}
