"use client";

import { motion } from "framer-motion";

interface TomoMascotProps {
  mood?: "happy" | "idle" | "sleepy" | "thinking";
  size?: number;
}

/**
 * 🐱 Tomo Mascot
 * Friendly StudyTomo cat avatar — animated with Framer Motion.
 * The mood prop controls Tomo's expression and motion behavior.
 */
export function TomoMascot({ mood = "idle", size = 100 }: TomoMascotProps) {
  const moodText = {
    happy: "😸",
    idle: "🐱",
    sleepy: "😴",
    thinking: "🤔",
  }[mood];

  const animation = {
    happy: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2 } },
    idle: { scale: [1, 1.02, 1], transition: { repeat: Infinity, duration: 3 } },
    sleepy: { opacity: [1, 0.7, 1], transition: { repeat: Infinity, duration: 4 } },
    thinking: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 2.5 } },
  }[mood];

  return (
    <div className="flex flex-col items-center justify-center text-center">
      <motion.div animate={animation} className="select-none" style={{ fontSize: size }}>
        {moodText}
      </motion.div>
      <p className="text-sm text-gray-500 mt-2">Tomo {mood}</p>
    </div>
  );
}
