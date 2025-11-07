import { Flame } from "lucide-react";
import { Card } from "./card";

interface StreakCardProps {
  days: number;
  message: string;
}

export function StreakCard({ days, message }: StreakCardProps) {
  return (
    <Card className="flex items-center gap-3">
      <Flame className="text-orange-500" size={28} />
      <div>
        <p className="text-lg font-semibold text-gray-800">{days}-day streak 🔥</p>
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </Card>
  );
}
