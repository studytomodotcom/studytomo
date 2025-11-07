interface ProgressBarProps {
  value: number;
}

export function ProgressBar({ value }: ProgressBarProps) {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}
