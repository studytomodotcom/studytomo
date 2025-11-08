"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TomoMascot, TomoSay } from "@/components/tomo";
import { motion } from "framer-motion";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function FlashcardStudyPage() {
  const supabase = createClientComponentClient();
  const params = useParams();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDeck = async () => {
      const { data, error } = await supabase
        .from("flashcard_items")
        .select("id, question, answer")
        .eq("deck_id", params.id);
      if (!error && data) setCards(data);
      setLoading(false);
    };
    loadDeck();
  }, [params.id, supabase]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[70vh] text-gray-500">
        Loading deck...
      </div>
    );

  if (!cards.length)
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <TomoMascot mood="sleepy" size={90} />
        <TomoSay message="No flashcards found for this deck." />
      </div>
    );

  const current = cards[index];
  const progress = ((index + 1) / cards.length) * 100;
  const finished = index >= cards.length - 1 && flipped;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6 space-y-6">
      {!finished ? (
        <>
          <motion.div
            key={current.id}
            onClick={() => setFlipped(!flipped)}
            className="w-full max-w-md h-64 cursor-pointer relative"
            animate={{ rotateY: flipped ? 180 : 0 }}
            transition={{ duration: 0.4 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="absolute inset-0 bg-white border rounded-2xl shadow flex items-center justify-center text-lg font-medium text-gray-800 backface-hidden">
              {current.question}
            </div>
            <div className="absolute inset-0 bg-blue-50 border rounded-2xl shadow flex items-center justify-center text-lg font-medium text-gray-700 rotate-y-180 backface-hidden">
              {current.answer}
            </div>
          </motion.div>

          <div className="w-full max-w-md flex justify-between items-center">
            <button
              onClick={() => {
                setFlipped(false);
                if (index > 0) setIndex(index - 1);
              }}
              className="text-blue-600 font-medium disabled:text-gray-400"
              disabled={index === 0}
            >
              ← Back
            </button>

            <p className="text-sm text-gray-600">
              Card {index + 1} of {cards.length}
            </p>

            <button
              onClick={() => {
                setFlipped(false);
                if (index < cards.length - 1) setIndex(index + 1);
              }}
              className="text-blue-600 font-medium disabled:text-gray-400"
              disabled={index >= cards.length - 1}
            >
              Next →
            </button>
          </div>

          <div className="w-full max-w-md h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="flex flex-col items-center gap-3 mt-4">
            <TomoMascot mood={flipped ? "happy" : "thinking"} size={80} />
            <TomoSay
              message={flipped ? "Nice! You got it right?" : "Tap the card to reveal the answer!"}
            />
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <TomoMascot mood="happy" size={100} />
          <TomoSay message="All done! Great work 🎉" />
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            onClick={() => (window.location.href = "/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      )}
    </div>
  );
}
