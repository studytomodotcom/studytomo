import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-500 mb-4 max-w-sm">{description}</p>
      {actionLabel && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
