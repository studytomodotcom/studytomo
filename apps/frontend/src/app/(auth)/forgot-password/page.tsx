"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabaseClient";

export default function ForgotPasswordPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) setError(error.message);
    else setMessage("Check your email for the password reset link.");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleReset} className="flex flex-col gap-4 w-80">
        <h1 className="text-xl font-bold text-center">Forgot Password</h1>
        <input
          type="email"
          placeholder="Enter your account email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}
