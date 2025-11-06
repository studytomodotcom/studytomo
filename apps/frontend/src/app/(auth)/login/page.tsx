"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useUserSession } from "@/lib/hooks/useUserSession";

export default function LoginPage() {
  const router = useRouter();
  const { user } = useUserSession();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // If already logged in, redirect immediately
  if (user) {
    router.replace("/dashboard");
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) setMessage(error.message);
    else setMessage("Check your email for the login link!");
    setLoading(false);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 border border-gray-200">
        <h1 className="text-2xl font-bold mb-2 text-center">Sign In</h1>
        <p className="text-gray-500 text-center mb-6">
          Enter your email to get a magic login link.
        </p>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? "Sending link..." : "Send Magic Link"}
          </button>
        </form>

        {message && <p className="text-sm text-center text-gray-600 mt-4">{message}</p>}
      </div>
    </main>
  );
}
