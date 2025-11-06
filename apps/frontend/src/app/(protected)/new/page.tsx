"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import AuthGuard from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";

export default function NewFlashcardPage() {
  const user = useUser();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!user) {
      alert("Please log in first.");
      router.push("/auth/login");
      return;
    }

    if (!input.trim()) {
      alert("Please paste a YouTube link or text.");
      return;
    }

    setLoading(true);
    setStatus("Starting flashcard generation...");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          input, // YouTube URL or text
        }),
      });

      if (!res.ok) throw new Error("Server error");
      const { set_id } = await res.json();

      setStatus("✅ Flashcards created successfully!");
      setTimeout(() => router.push(`/flashcards/${set_id}`), 1000);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Something went wrong. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Create New Flashcard Set</h1>
          <LogoutButton />
        </div>

        <p className="text-gray-600 mb-6">
          Paste a <strong>YouTube link</strong> or study <strong>text</strong> to generate
          flashcards automatically.
        </p>

        <textarea
          placeholder="Paste YouTube link or text here..."
          className="w-full h-40 p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          disabled={loading}
          className={`mt-4 w-full py-2 rounded-md text-white font-medium transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
          onClick={handleGenerate}
        >
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>

        {status && <p className="text-sm text-gray-600 mt-4 whitespace-pre-wrap">{status}</p>}
      </div>
    </AuthGuard>
  );
}
