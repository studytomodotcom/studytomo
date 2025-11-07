"use client";

import { motion, AnimatePresence } from "framer-motion";

interface TomoSayProps {
  message: string;
  mood?: "happy" | "idle" | "sleepy" | "thinking";
  visible?: boolean;
}

/**
 * 🐱 TomoSay
 * Animated speech bubble for Tomo the mascot.
 * Can be paired with <TomoMascot /> or used standalone.
 */
export function TomoSay({ message, visible = true }: TomoSayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          className="relative bg-white border border-gray-200 shadow-sm rounded-2xl px-4 py-3 max-w-xs text-sm text-gray-700"
        >
          {message}
          <div className="absolute -bottom-2 left-6 w-3 h-3 bg-white border-l border-b border-gray-200 rotate-45"></div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
