import { useMemo } from "react";

interface TimerProps {
  seconds: number;
  className?: string;
}

export function Timer({ seconds, className }: TimerProps) {
  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  return (
    <div className={`font-mono tabular-nums tracking-widest ${className}`}>
      {formattedTime}
    </div>
  );
}
