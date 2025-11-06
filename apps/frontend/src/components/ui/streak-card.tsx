import { Card } from "./card";
import { Flame } from "lucide-react";
import { TomoMascot } from "../tomo/TomoMascot";

interface StreakCardProps {
  days: number;
  message?: string;
}

export function StreakCard({ days, message }: StreakCardProps) {
  return (
    <Card className="flex items-center gap-4 bg-linear-to-r from-blue-50 to-green-50">
      <TomoMascot size={64} />
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <Flame className="text-orange-500" size={20} />
          <span className="text-lg font-semibold text-gray-800">{days}-day streak!</span>
        </div>
        <p className="text-sm text-gray-600">{message ?? "Keep it up, Tomo’s proud of you!"}</p>
      </div>
    </Card>
  );
}
