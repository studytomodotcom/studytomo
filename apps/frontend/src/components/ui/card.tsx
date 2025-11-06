"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  className?: string;
  children?: ReactNode; // ✅ optional for TS inference
  delay?: number;
}

export function Card({ className, children, delay = 0 }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn(
        "rounded-2xl bg-white p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
