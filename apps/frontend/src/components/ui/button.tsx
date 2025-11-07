"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline";
  loading?: boolean;
}

export function Button({
  children,
  className,
  variant = "primary",
  loading,
  ...props
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 font-medium transition-all focus:outline-none";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-green-600 text-white hover:bg-green-700",
    outline: "border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-gray-900",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={cn(base, variants[variant], loading && "opacity-60 cursor-not-allowed", className)}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}
