import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0–100
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full h-3 bg-gray-200 rounded-full overflow-hidden", className)}>
      <div
        className="h-full bg-linear-to-r from-primary to-secondary rounded-full transition-all"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}
