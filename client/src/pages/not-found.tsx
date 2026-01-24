import { Link } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="flex justify-center">
          <div className="size-24 rounded-full bg-white/5 flex items-center justify-center">
            <AlertCircle className="size-12 text-destructive" />
          </div>
        </div>
        
        <h1 className="text-4xl font-display font-bold text-white">404 Page Not Found</h1>
        <p className="text-muted-foreground text-lg">
          The page you are looking for does not exist or has been moved.
        </p>

        <Link href="/">
          <button className="btn-primary w-full mt-4">
            Return Home
          </button>
        </Link>
      </div>
    </div>
  );
}
