"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseBrowserClient";
import { TomoMascot, TomoSay } from "@/components/tomo";

export default function GeneratePage() {
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
    setStatus("🧠 Generating flashcards…");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id, input }),
      });

      if (!res.ok) throw new Error("Server error");
      const { set_id } = await res.json();

      setStatus("✅ Flashcards created successfully!");
      setTimeout(() => router.push(`/flashcards/${set_id}`), 1000);
    } catch (err: any) {
      console.error(err);
      setStatus("❌ Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <div className="max-w-lg w-full bg-white p-8 rounded-xl shadow space-y-6">
        <div className="flex flex-col items-center gap-3">
          <TomoMascot mood="thinking" size={90} />
          <TomoSay message="Paste a YouTube link or text, and I’ll make flashcards for you!" />
        </div>

        <textarea
          placeholder="Paste YouTube link or text here..."
          className="w-full h-40 p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-700"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        <button
          disabled={loading}
          onClick={handleGenerate}
          className={`w-full py-2 rounded-md text-white font-medium transition ${
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Generating..." : "Generate Flashcards"}
        </button>

        {status && (
          <p className="text-sm text-center mt-3 text-gray-600 whitespace-pre-wrap">{status}</p>
        )}
      </div>
    </div>
  );
}
