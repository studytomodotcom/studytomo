"use client";

import { useEffect, useState } from "react";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

interface ProgressEntry {
  deck_id: string;
  topic: string;
  correct_count: number;
  incorrect_count: number;
  mastery_level: number;
  last_reviewed: string | null;
}

export default function ProgressPage() {
  const user = useUser();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // 🧠 Fetch user progress
  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("user_progress")
        .select(
          `
          deck_id,
          mastery_level,
          correct_count,
          incorrect_count,
          last_reviewed,
          flashcard_sets (
            topic
          )
        `
        )
        .eq("user_id", user.id);

      if (error) {
        console.error("Error fetching progress:", error);
      } else if (data) {
        const mapped = data.map((item: any) => ({
          deck_id: item.deck_id,
          topic: item.flashcard_sets?.topic || "Untitled Deck",
          mastery_level: item.mastery_level || 0,
          correct_count: item.correct_count || 0,
          incorrect_count: item.incorrect_count || 0,
          last_reviewed: item.last_reviewed,
        }));
        setProgress(mapped);
      }

      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  // 🔥 Fetch streak
  useEffect(() => {
    if (!user) return;

    const fetchStreak = async () => {
      const { data, error } = await supabase
        .from("user_streaks")
        .select("current_streak")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching streak:", error);
      } else {
        setStreak(data?.current_streak || 0);
      }
    };

    fetchStreak();
  }, [user]);

  if (loading) return <p className="p-6">Loading progress...</p>;
  if (!user) return <p className="p-6">Please log in to view your progress.</p>;

  const overall =
    progress.length > 0
      ? Math.round(progress.reduce((sum, p) => sum + p.mastery_level, 0) / progress.length)
      : 0;

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* 🌟 Header / Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-gray-900">Your Learning Progress</h1>
          <p className="text-gray-600">Average mastery across {progress.length} decks</p>
        </div>
        <div className="text-center">
          <div className="relative w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
            <span className="text-3xl font-bold text-blue-600">{overall}%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Overall mastery</p>
        </div>
      </div>

      {/* 🔥 Daily Streak Widget */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 flex justify-between items-center border border-blue-100 shadow-sm">
        <div>
          <h2 className="font-semibold text-blue-700 text-lg">
            {streak > 0 ? `🔥 ${streak}-day streak!` : "Start your streak today!"}
          </h2>
          <p className="text-sm text-gray-600">Study daily to keep Tomo happy 🐱</p>
        </div>
        <div className="text-3xl">{streak > 0 ? "🔥" : "🌱"}</div>
      </div>

      {/* 📘 Per Deck Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {progress.map((deck) => (
          <div
            key={deck.deck_id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col space-y-2 hover:shadow-md transition-shadow"
          >
            <h3 className="font-semibold text-lg text-gray-900">{deck.topic}</h3>

            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-2 bg-green-500 rounded-full transition-all"
                style={{ width: `${deck.mastery_level}%` }}
              ></div>
            </div>

            <div className="text-sm text-gray-600 flex justify-between">
              <span>{deck.mastery_level.toFixed(0)}% mastered</span>
              <span>{deck.correct_count + deck.incorrect_count} cards reviewed</span>
            </div>

            {deck.last_reviewed && (
              <p className="text-xs text-gray-400">
                Last reviewed: {new Date(deck.last_reviewed).toLocaleDateString()}
              </p>
            )}

            <button
              className="mt-2 py-1.5 px-3 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 self-start"
              onClick={() => (window.location.href = `/flashcards/${deck.deck_id}`)}
            >
              Continue Deck
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
