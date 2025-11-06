"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import { Button, Card, ProgressBar, StreakCard, EmptyState } from "@/components/ui";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";
import AuthGuard from "@/components/auth/AuthGuard";
import { LogoutButton } from "@/components/auth/LogoutButton";

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
      <AuthGuard>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
          <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mb-3" />
          Loading your progress...
        </div>
      </AuthGuard>
    );
  }

  if (!decks.length) {
    return (
      <AuthGuard>
        <div className="max-w-4xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">Your Progress</h1>
            <LogoutButton />
          </div>
          <EmptyState
            title="No progress yet"
            description="You haven’t studied any decks yet. Start a deck to begin tracking your learning journey!"
            actionLabel="Go to Dashboard"
            onAction={() => (window.location.href = "/dashboard")}
          />
        </div>
      </AuthGuard>
    );
  }

  const totalProgress = decks.reduce((acc, d) => acc + (d.progress || 0), 0) / decks.length;

  return (
    <AuthGuard>
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-800">Your Progress</h1>
          <LogoutButton />
        </div>

        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <StreakCard
            days={streak}
            message={
              streak > 0
                ? "🔥 Keep your streak alive! Tomo is cheering you on!"
                : "Start studying today to begin your first streak!"
            }
          />
        </motion.div>

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
            <Card key={deck.id} delay={i * 0.08}>
              <h3 className="font-semibold text-gray-800">{deck.title}</h3>
              <div className="mt-3">
                <ProgressBar value={deck.progress || 0} />
                <p className="text-xs text-gray-500 mt-1">{deck.progress ?? 0}% mastered</p>
              </div>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => (window.location.href = `/flashcards/${deck.id}`)}
              >
                Continue Deck
              </Button>
            </Card>
          ))}
        </motion.div>
      </div>
    </AuthGuard>
  );
}
