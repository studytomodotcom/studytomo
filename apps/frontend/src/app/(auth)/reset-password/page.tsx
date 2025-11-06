"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });
    if (error) setError(error.message);
    else {
      setMessage("Password updated successfully. You can now log in.");
      setTimeout(() => router.push("/login"), 2000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <h1 className="text-xl font-bold text-center">Reset Password</h1>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Confirm New Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="border p-2 rounded"
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {message && <p className="text-green-600 text-sm">{message}</p>}
        <button type="submit" className="bg-green-600 text-white p-2 rounded">
          Update Password
        </button>
      </form>
    </div>
  );
}
