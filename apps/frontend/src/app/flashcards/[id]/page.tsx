"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import confetti from "canvas-confetti";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

export default function FlashcardViewer() {
  const { id } = useParams();
  const user = useUser();

  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [completed, setCompleted] = useState(false);

  // 🧠 Load flashcards
  useEffect(() => {
    const loadCards = async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, question, answer")
        .eq("set_id", id)
        .order("created_at", { ascending: true });

      if (error) console.error("❌ Error loading cards:", error);
      else setFlashcards(data || []);
    };

    loadCards();
  }, [id]);

  // 🎊 Trigger confetti when completed
  useEffect(() => {
    if (completed) {
      const duration = 2 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 25, spread: 360, ticks: 60, zIndex: 1000 };

      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
        });
      }, 200);
    }
  }, [completed]);

  // ✅ Handle answer
  const handleAnswer = (correct: boolean) => {
    if (correct) setCorrectCount((c) => c + 1);
    else setIncorrectCount((c) => c + 1);

    if (currentIndex + 1 < flashcards.length) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
    } else {
      setCompleted(true);
      updateProgress();
      updateStreak();
    }
  };

  // ✅ Update user progress
  const updateProgress = async () => {
    if (!user) return;

    const total = correctCount + incorrectCount || 1;
    const mastery = Math.round((correctCount / total) * 100);

    await supabase
      .from("user_progress")
      .upsert({
        user_id: user.id,
        deck_id: id,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        mastery_level: mastery,
        last_reviewed: new Date().toISOString(),
      })
      .eq("user_id", user.id)
      .eq("deck_id", id);

    console.log("📊 Progress updated:", mastery);
  };

  // ✅ Update daily streak
  const updateStreak = async () => {
    if (!user) return;
    try {
      const res = await fetch("/api/streak/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: user.id }),
      });
      const json = await res.json();
      console.log("🔥 Streak updated:", json);
    } catch (err) {
      console.error("❌ Streak update failed:", err);
    }
  };

  if (flashcards.length === 0) return <p className="p-6">Loading flashcards...</p>;

  // 🎉 Study Complete Modal
  if (completed) {
    const accuracy = correctCount / flashcards.length;
    const tomoMood = accuracy >= 0.8 ? "/mascot/tomo-happy.png" : "/mascot/tomo-sleepy.png";

    return (
      <div className="p-6 text-center min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-green-50">
        {/* 🐱 Tomo the Cat */}
        <div className="relative mb-6">
          <img
            src={tomoMood}
            alt="Tomo the Cat"
            className="w-36 h-36 mx-auto animate-bounce-slow"
          />
        </div>

        {/* 🎊 Confetti Canvas */}
        <canvas
          id="confettiCanvas"
          className="fixed top-0 left-0 w-full h-full pointer-events-none"
        ></canvas>

        {/* 📊 Stats Summary */}
        <div className="bg-white shadow-md rounded-2xl p-6 max-w-md mx-auto border border-gray-100">
          <h2 className="text-2xl font-bold mb-2 text-blue-700">🎉 Study Complete!</h2>
          <p className="text-gray-600 mb-3">
            You reviewed <strong>{flashcards.length}</strong> cards.
          </p>

          <p className="text-lg font-semibold text-green-600 mb-2">
            ✅ Correct: {correctCount} | ❌ Incorrect: {incorrectCount}
          </p>

          <p className="text-sm text-gray-500 mb-4">Your progress and streak have been updated.</p>

          <button
            onClick={() => (window.location.href = "/progress")}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            View My Progress
          </button>
        </div>
      </div>
    );
  }

  const current = flashcards[currentIndex];

  return (
    <div className="p-6 flex flex-col items-center justify-center space-y-6">
      <h1 className="text-xl font-bold text-gray-900">
        Card {currentIndex + 1} / {flashcards.length}
      </h1>

      <div
        onClick={() => setShowAnswer((s) => !s)}
        className="bg-white rounded-xl shadow-md p-10 w-full max-w-md cursor-pointer text-center border border-gray-100 hover:shadow-lg transition"
      >
        <p className="text-lg text-gray-900">{showAnswer ? current.answer : current.question}</p>
      </div>

      {showAnswer && (
        <div className="flex space-x-4">
          <button
            onClick={() => handleAnswer(true)}
            className="px-4 py-2 rounded bg-green-500 text-white hover:bg-green-600"
          >
            I Knew This
          </button>
          <button
            onClick={() => handleAnswer(false)}
            className="px-4 py-2 rounded bg-gray-400 text-white hover:bg-gray-500"
          >
            Didn't Know
          </button>
        </div>
      )}

      {!showAnswer && (
        <button
          onClick={() => setShowAnswer(true)}
          className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
        >
          Show Answer
        </button>
      )}
    </div>
  );
}
