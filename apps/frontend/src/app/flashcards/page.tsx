"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function FlashcardsPage() {
  const [input, setInput] = useState("");
  const [flashcards, setFlashcards] = useState<{ question: string; answer: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) setUserId(data.user.id);
      else router.push("/login");
    });
  }, [router]);

  const handleGenerate = async () => {
    if (!input.trim()) return alert("Please enter text or a YouTube link.");
    if (!userId) return alert("User not logged in.");

    setLoading(true);
    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, userId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate flashcards");
      setFlashcards(data.flashcards || []);
    } catch (err) {
      console.error(err);
      alert("Error generating flashcards");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-4">Generate Flashcards</h1>

      <div className="flex gap-2 mb-6 w-full max-w-md">
        <input
          type="text"
          placeholder="Paste YouTube link or text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border rounded px-3 py-2"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>

      {flashcards.length > 0 && (
        <div className="w-full max-w-3xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          {flashcards.map((card, i) => (
            <div
              key={i}
              className="p-4 border rounded shadow-sm bg-white hover:shadow-md transition"
            >
              <p className="font-semibold text-gray-800 mb-2">Q: {card.question}</p>
              <p className="text-gray-600">A: {card.answer}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && flashcards.length === 0 && (
        <p className="text-gray-500 mt-6">Enter a YouTube link or text to generate flashcards.</p>
      )}
    </div>
  );
}
