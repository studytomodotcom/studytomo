"use client";

import { useState, useEffect } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button, Card, ProgressBar, StreakCard, EmptyState } from "@/components/ui";
import { TomoMascot, TomoSay } from "@/components/tomo";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface DeckProgress {
  id: string;
  title: string;
  progress: number;
}

export default function ProgressPage() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [decks, setDecks] = useState<DeckProgress[]>([]);
  const [streak, setStreak] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from("flashcards")
        .select("id, title, progress")
        .eq("user_id", user.id);

      if (error) console.error(error);
      else setDecks(data as DeckProgress[]);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("streak")
        .eq("id", user.id)
        .single();

      setStreak(profileData?.streak || 0);
      setLoading(false);
    };

    fetchProgress();
  }, [user, supabase]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
        <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mb-3" />
        Loading your progress...
      </div>
    );
  }

  if (!decks.length) {
    return (
      <EmptyState
        title="No progress yet"
        description="You haven’t studied any decks yet. Start a deck to begin tracking your learning journey!"
        actionLabel="Go to Dashboard"
        onAction={() => (window.location.href = "/dashboard")}
      />
    );
  }

  const totalProgress = decks.reduce((acc, d) => acc + (d.progress || 0), 0) / decks.length;

  // 🐱 Dynamic Tomo reactions based on streak
  const mood = streak > 5 ? "happy" : streak > 0 ? "thinking" : "sleepy";
  const message =
    streak > 5
      ? "You’re on fire! Tomo is cheering for you! 🔥"
      : streak > 0
        ? `Nice ${streak}-day streak! Keep it going!`
        : "Let’s start your first streak today!";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
      <h1 className="text-2xl font-semibold text-gray-800">Your Progress</h1>

      {/* 🐱 Tomo section */}
      <motion.div
        className="flex flex-col items-center gap-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <TomoMascot mood={mood as any} size={90} />
        <TomoSay message={message} />
      </motion.div>

      {/* 🏆 Overall Mastery */}
      <Card className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Trophy className="text-yellow-500" size={22} />
          <h2 className="font-semibold text-gray-800">Overall Mastery</h2>
        </div>
        <ProgressBar value={Math.round(totalProgress)} />
        <p className="text-sm text-gray-600">
          {Math.round(totalProgress)}% mastered across {decks.length} decks
        </p>
      </Card>

      {/* 📚 Deck-by-deck mastery */}
      <motion.div
        className="grid sm:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.08 } },
        }}
      >
        {decks.map((deck, i) => (
          <motion.div
            key={deck.id}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
            transition={{ delay: i * 0.05 }}
          >
            <Card>
              <h3 className="font-semibold text-gray-800">{deck.title}</h3>
              <div className="mt-3">
                <ProgressBar value={deck.progress || 0} />
                <p className="text-xs text-gray-500 mt-1">{deck.progress ?? 0}% mastered</p>
              </div>
              <Button
                variant="secondary"
                className="mt-4 w-full"
                onClick={() => (window.location.href = `/flashcards/${deck.id}`)}
              >
                Continue Deck
              </Button>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
