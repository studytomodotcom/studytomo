"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useUser } from "@supabase/auth-helpers-react";
import Link from "next/link";
import { Card, Button, ProgressBar, EmptyState } from "@/components/ui";
import { TomoMascot, TomoSay } from "@/components/tomo";
import { CheckCircle, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Deck {
  id: string;
  title: string;
  subject: string;
  country: string;
  level: string;
  verified: boolean;
  progress: number;
}

export default function DashboardPage() {
  const supabase = createClientComponentClient();
  const user = useUser();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string>("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      const { data: flashcards } = await supabase
        .from("flashcards")
        .select("*")
        .eq("user_id", user.id);

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, streak")
        .eq("id", user.id)
        .single();

      setDecks(flashcards || []);
      if (profile?.full_name) {
        setFirstName(profile.full_name.split(" ")[0]);
      }
      setLoading(false);
    };

    fetchData();
  }, [supabase, user]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-gray-500">
        <div className="animate-spin h-6 w-6 border-2 border-gray-400 border-t-transparent rounded-full mb-3" />
        Loading your dashboard...
      </div>
    );
  }

  if (!decks.length) {
    return (
      <EmptyState
        title="No decks yet"
        description="You haven’t created any flashcard decks yet. Let’s get started!"
        actionLabel="Generate Deck"
        onAction={() => (window.location.href = "/generate")}
      />
    );
  }

  const totalProgress = decks.reduce((acc, d) => acc + (d.progress || 0), 0) / decks.length;

  // 🐱 Tomo’s dynamic greeting logic
  const mood = totalProgress > 70 ? "happy" : totalProgress > 30 ? "thinking" : "idle";

  const greeting = (() => {
    if (!firstName) return "Welcome back!";
    if (totalProgress > 70) return `Proud of you, ${firstName}! Keep it up!`;
    if (totalProgress > 30) return `Good work, ${firstName}. Let’s keep studying!`;
    return `Hi ${firstName}! Let’s begin your next study session.`;
  })();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* 🐱 Tomo Greeting */}
      <motion.div
        className="flex flex-col items-center gap-3 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <TomoMascot mood={mood as any} size={100} />
        <TomoSay message={greeting} />
      </motion.div>

      {/* Deck header */}
      <div className="flex items-center justify-between mt-10">
        <h1 className="text-2xl font-semibold text-gray-800">Your Flashcard Decks</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => (window.location.href = "/generate")}>
            <PlusCircle className="mr-2 h-4 w-4" /> Generate Deck
          </Button>
          <Button onClick={() => (window.location.href = "/new")}>
            <PlusCircle className="mr-2 h-4 w-4" /> New Deck
          </Button>
        </div>
      </div>

      {/* Deck List */}
      <motion.div
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.07 } },
        }}
      >
        {decks.map((deck, i) => (
          <motion.div
            key={deck.id}
            variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0 } }}
          >
            <Link href={`/flashcards/${deck.id}`}>
              <Card className="group cursor-pointer h-full flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="font-semibold text-gray-800 group-hover:text-primary transition-colors">
                      {deck.title}
                    </h2>
                    {deck.verified && <CheckCircle className="text-green-500" size={18} />}
                  </div>
                  <p className="text-sm text-gray-500">
                    {deck.country} • {deck.level} • {deck.subject}
                  </p>
                </div>

                <div className="mt-4">
                  <ProgressBar value={deck.progress || 0} />
                  <p className="text-xs text-gray-500 mt-1">{deck.progress ?? 0}% mastered</p>
                </div>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
