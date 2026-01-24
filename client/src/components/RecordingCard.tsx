import { Recording } from "@shared/schema";
import { format } from "date-fns";
import { Play, Download, Trash2, HardDrive } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useDeleteRecording } from "@/hooks/use-recordings";
import { useToast } from "@/hooks/use-toast";

interface RecordingCardProps {
  recording: Recording;
  onPlay: (recording: Recording) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export function RecordingCard({ recording, onPlay }: RecordingCardProps) {
  const deleteMutation = useDeleteRecording();
  const { toast } = useToast();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this recording?")) {
      setIsDeleting(true);
      try {
        await deleteMutation.mutateAsync(recording.id);
        toast({ title: "Deleted", description: "Recording has been removed." });
      } catch (error) {
        toast({ title: "Error", description: "Failed to delete recording.", variant: "destructive" });
        setIsDeleting(false);
      }
    }
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Assuming file_path is relative or served properly by backend static serve
    // For demo purposes, we create a link. 
    // In a real app, this should probably point to a download endpoint.
    // Here we'll just try to open it.
    // NOTE: The shared schema doesn't have a specific download URL, but we can assume /api/recordings/:id/download or similar, 
    // OR just use the filePath if it's publicly accessible. 
    // Let's assume the backend serves uploads at /uploads or similar. 
    // Actually, let's just trigger a navigation or window.open for now.
    window.open(recording.filePath, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      className="group relative overflow-hidden rounded-2xl bg-card border border-white/5 hover:border-white/10 transition-all hover:shadow-2xl hover:shadow-black/50"
    >
      {/* Thumbnail / Preview Area */}
      <div className="aspect-video bg-black/50 relative overflow-hidden flex items-center justify-center group-hover:bg-black/40 transition-colors cursor-pointer" onClick={() => onPlay(recording)}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
        
        {/* Play Button Overlay */}
        <div className="size-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20 transform scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100 transition-all duration-300 shadow-xl">
          <Play className="fill-white text-white size-6 ml-1" />
        </div>

        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/60 backdrop-blur text-xs font-mono font-medium text-white/90 border border-white/10">
          {recording.duration ? formatDuration(recording.duration) : "--:--"}
        </div>
      </div>

      {/* Info Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-lg font-medium text-white line-clamp-1 group-hover:text-primary transition-colors">
            {recording.title}
          </h3>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={handleDownload}
              className="p-2 rounded-lg hover:bg-white/10 text-muted-foreground hover:text-white transition-colors"
              title="Download"
            >
              <Download className="size-4" />
            </button>
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="p-2 rounded-lg hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
              title="Delete"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
            {recording.createdAt && format(new Date(recording.createdAt), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-1.5">
            <HardDrive className="size-3" />
            {formatBytes(recording.size)}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
