"use client";
import { motion } from "framer-motion";

interface TomoMascotProps {
  size?: number;
  mood?: "happy" | "thinking" | "sleepy";
}

export function TomoMascot({ size = 80, mood = "happy" }: TomoMascotProps) {
  const emoji = mood === "happy" ? "🐱" : mood === "thinking" ? "😺" : "😴";

  return (
    <motion.div
      style={{ fontSize: size, lineHeight: 1 }}
      animate={{ y: [0, -4, 0], rotate: [0, 2, -2, 0] }}
      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
    >
      {emoji}
    </motion.div>
  );
}
