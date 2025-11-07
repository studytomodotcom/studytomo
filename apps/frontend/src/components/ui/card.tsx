import { cn } from "@/lib/utils";
import { HTMLAttributes } from "react";

export function Card({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
