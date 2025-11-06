"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";
import VerifiedBadge from "@/components/VerifiedBadge";

interface CurriculumInfo {
  country: string;
  education_level: string;
  subject: string;
  topic: string;
}

interface ProgressInfo {
  mastery_level: number;
}

interface FlashcardSet {
  id: string;
  topic_id: string | null;
  topic: string | null;
  created_at: string;
  verified: boolean;
  source: string;
  curriculum_info: CurriculumInfo[]; // Supabase returns arrays for joins
  progress: ProgressInfo[];
}

export default function DashboardPage() {
  const user = useUser();
  const router = useRouter();

  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) return; // waiting for auth
    if (!user) {
      router.push("/login");
      return;
    }

    const loadSets = async () => {
      const { data, error } = await supabase
        .from("flashcard_sets")
        .select(
          `
          id,
          topic_id,
          topic,
          created_at,
          verified,
          source,
          curriculum_info:curriculum_topics (
            country,
            education_level,
            subject,
            topic
          ),
          progress:user_progress (
            mastery_level
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Supabase error:", error);
      } else {
        setSets(data || []);
      }

      setLoading(false);
    };

    loadSets();
  }, [user]);

  if (loading) return <p className="p-6">Loading dashboard...</p>;
  if (!sets.length)
    return (
      <div className="p-6 text-center space-y-4">
        <h1 className="text-2xl font-bold">My Flashcard Sets</h1>
        <p>You haven’t created any decks yet.</p>
        <button
          onClick={() => router.push("/dashboard/generate")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + Generate Deck
        </button>
      </div>
    );

  // Group decks by curriculum info
  const grouped: Record<string, FlashcardSet[]> = {};
  for (const set of sets) {
    const info = set.curriculum_info?.[0]; // safe access
    const key = info ? `${info.country} – ${info.education_level} – ${info.subject}` : "User Decks";

    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(set);
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Flashcard Sets</h1>
        <button
          onClick={() => router.push("/dashboard/generate")}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          + New Deck
        </button>
      </div>

      {Object.entries(grouped).map(([group, decks]) => (
        <div key={group} className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-700">{group}</h2>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {decks.map((set) => {
              const info = set.curriculum_info?.[0];
              const prog = set.progress?.[0];
              return (
                <div
                  key={set.id}
                  onClick={() => router.push(`/flashcards/${set.id}`)}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {info ? info.topic : set.topic || "Untitled Deck"}
                    </h3>
                    {set.verified && <VerifiedBadge />}
                  </div>

                  <p className="text-xs text-gray-500">
                    {new Date(set.created_at).toLocaleDateString()}
                  </p>

                  {prog && (
                    <div className="w-full bg-gray-200 rounded mt-2 h-2">
                      <div
                        className="bg-green-500 h-2 rounded"
                        style={{
                          width: `${Math.min(prog.mastery_level || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
