import { TomoMascot } from "../tomo/TomoMascot";
import { Button } from "./button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center text-center p-10 text-gray-700">
      <TomoMascot size={120} mood="thinking" />
      <h2 className="mt-6 text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-gray-500 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <Button className="mt-4" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
