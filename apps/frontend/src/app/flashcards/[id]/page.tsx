"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function FlashcardSetPage() {
  const { id } = useParams();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const loadFlashcards = async () => {
      if (!id) return;
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, question, answer")
        .eq("set_id", id);

      if (error) setError(error.message);
      else setFlashcards(data || []);
      setLoading(false);
    };

    loadFlashcards();
  }, [id]);

  if (loading) return <p className="p-6 text-gray-500">Loading flashcards...</p>;

  if (error) return <p className="p-6 text-red-500">Error loading flashcards: {error}</p>;

  if (flashcards.length === 0) return <p className="p-6">No flashcards found in this set.</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Flashcards</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((card) => (
          <div
            key={card.id}
            onClick={() => setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))}
            className="relative border border-gray-300 rounded-lg p-6 shadow-sm cursor-pointer bg-white hover:shadow-md transition duration-200"
          >
            {!flipped[card.id] ? (
              <p className="font-semibold text-gray-800">{card.question}</p>
            ) : (
              <p className="text-green-700">{card.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
