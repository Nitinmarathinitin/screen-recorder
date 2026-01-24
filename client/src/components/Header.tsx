import { Link, useLocation } from "wouter";
import { Video, Film, Radio } from "lucide-react";
import { clsx } from "clsx";

export function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/25">
            <Radio className="text-white size-5" />
          </div>
          <span className="text-xl font-bold font-display bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            ScreenCast
          </span>
        </div>

        <nav className="flex items-center gap-6">
          <Link href="/" className={clsx("nav-link flex items-center gap-2", location === "/" && "active")}>
            <Video className="size-4" />
            <span className="hidden sm:inline">Record</span>
          </Link>
          <Link href="/gallery" className={clsx("nav-link flex items-center gap-2", location === "/gallery" && "active")}>
            <Film className="size-4" />
            <span className="hidden sm:inline">Gallery</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
