"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function ResetPasswordPage() {
  const supabase = createClientComponentClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [validSession, setValidSession] = useState(false);

  // ✅ Step 1: When the user opens from email, Supabase provides a temporary session
  useEffect(() => {
    const verifySession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        setValidSession(true);
      } else {
        setValidSession(false);
        setMessage("❌ Invalid or expired reset link. Please request a new one.");
      }
    };
    verifySession();
  }, [supabase]);

  // ✅ Step 2: Handle password change
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!password || !confirm) {
      setMessage("Please fill in both password fields.");
      return;
    }
    if (password !== confirm) {
      setMessage("❌ Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setMessage("✅ Password updated successfully!");
      setTimeout(() => router.push("/auth/login"), 1500);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Step 3: UI
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-center">Reset Password</h1>

        {!validSession ? (
          <p className="text-center text-red-600 text-sm">
            {message || "❌ Invalid or expired reset link. Please request a new one."}
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 rounded-md text-white font-medium transition ${
                loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}

        {message && (
          <p className="text-sm text-center mt-4 text-gray-600 whitespace-pre-line">{message}</p>
        )}

        <p className="text-sm text-center mt-6 text-gray-500">
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Back to Login
          </a>
        </p>
      </div>
    </div>
  );
}
