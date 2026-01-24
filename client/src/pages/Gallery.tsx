import { useRecordings } from "@/hooks/use-recordings";
import { RecordingCard } from "@/components/RecordingCard";
import { Loader2, Film, Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Recording } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

export default function Gallery() {
  const { data: recordings, isLoading, error } = useRecordings();
  const [search, setSearch] = useState("");
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);

  const filteredRecordings = recordings?.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-muted-foreground">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p>Loading your library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-destructive">
        <p>Failed to load recordings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">My Gallery</h1>
          <p className="text-muted-foreground">Manage and review your captured clips.</p>
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search recordings..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-card/50 border-white/10 focus:border-primary/50 transition-all rounded-xl"
          />
        </div>
      </div>

      {filteredRecordings && filteredRecordings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((recording) => (
            <RecordingCard 
              key={recording.id} 
              recording={recording} 
              onPlay={setSelectedRecording}
            />
          ))}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-white/5 rounded-3xl bg-white/5"
        >
          <div className="size-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
            <Film className="size-10 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">No recordings found</h3>
          <p className="text-muted-foreground max-w-sm mx-auto">
            {search ? "Try adjusting your search terms." : "Start recording your screen to build your personal library."}
          </p>
        </motion.div>
      )}

      <Dialog open={!!selectedRecording} onOpenChange={(open) => !open && setSelectedRecording(null)}>
        <DialogContent className="max-w-4xl bg-card border-white/10 p-0 overflow-hidden gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>{selectedRecording?.title}</DialogTitle>
          </DialogHeader>
          <div className="aspect-video bg-black w-full relative">
            {selectedRecording && (
              <video 
                src={selectedRecording.filePath} // Assuming this path is valid for now, usually needs a static serve prefix
                controls
                autoPlay
                className="w-full h-full"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
