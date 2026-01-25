import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Camera, Monitor, Zap } from "lucide-react";

interface SettingsDialogProps {
  hasWebcam: boolean;
  setHasWebcam: (val: boolean) => void;
  quality: string;
  setQuality: (val: string) => void;
  fps: number;
  setFps: (val: number) => void;
}

export function SettingsDialog({
  hasWebcam,
  setHasWebcam,
  quality,
  setQuality,
  fps,
  setFps,
}: SettingsDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full bg-background/50 backdrop-blur border-white/10 hover:bg-white/10 transition-all shadow-xl"
          data-testid="button-settings-trigger"
        >
          <Settings className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card/95 backdrop-blur-xl border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="size-5 text-primary" />
            Recording Settings
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
            <div className="space-y-0.5">
              <Label htmlFor="webcam-mode" className="text-sm font-medium flex items-center gap-2">
                <Camera className="size-4 text-primary" /> Webcam Overlay
              </Label>
              <p className="text-xs text-muted-foreground">Show your face while recording</p>
            </div>
            <Switch
              id="webcam-mode"
              checked={hasWebcam}
              onCheckedChange={setHasWebcam}
              data-testid="switch-webcam"
            />
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Monitor className="size-3" /> Quality
              </Label>
              <Select value={quality} onValueChange={setQuality}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 h-11" data-testid="select-quality">
                  <SelectValue placeholder="Select Quality" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="720p">720p (HD)</SelectItem>
                  <SelectItem value="1080p">1080p (Full HD)</SelectItem>
                  <SelectItem value="4k">4K (Ultra HD)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Zap className="size-3" /> Frame Rate (FPS)
              </Label>
              <Select value={fps.toString()} onValueChange={(v) => setFps(parseInt(v))}>
                <SelectTrigger className="w-full bg-white/5 border-white/10 h-11" data-testid="select-fps">
                  <SelectValue placeholder="Select FPS" />
                </SelectTrigger>
                <SelectContent className="bg-card border-white/10">
                  <SelectItem value="24">24 FPS (Cinematic)</SelectItem>
                  <SelectItem value="30">30 FPS (Standard)</SelectItem>
                  <SelectItem value="60">60 FPS (High Smoothness)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
