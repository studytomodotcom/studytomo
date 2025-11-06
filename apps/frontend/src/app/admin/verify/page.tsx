"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

interface CurriculumTopic {
  id: string;
  country: string;
  education_level: string;
  subject: string;
  topic: string;
  subtopic: string | null;
}

interface Flashcard {
  question: string;
  answer: string;
}

export default function VerifyDeckPage() {
  const user = useUser();
  const router = useRouter();

  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [topicId, setTopicId] = useState("");
  const [deckTitle, setDeckTitle] = useState("");
  const [flashcards, setFlashcards] = useState<Flashcard[]>([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🧩 Load all curriculum topics
  useEffect(() => {
    const fetchTopics = async () => {
      const { data, error } = await supabase
        .from("curriculum_topics")
        .select("id, country, education_level, subject, topic, subtopic")
        .order("country", { ascending: true });
      if (error) console.error(error);
      else setTopics(data || []);
    };
    fetchTopics();
  }, []);

  // 🧩 Submit deck
  const handleSubmit = async () => {
    if (!user) {
      alert("You must be logged in as admin.");
      return;
    }
    if (!topicId || !deckTitle.trim()) {
      alert("Please select a topic and enter a title.");
      return;
    }
    setLoading(true);
    setMessage("");

    try {
      // 1️⃣ Create deck
      const { data: deck, error: deckError } = await supabase
        .from("flashcard_sets")
        .insert({
          user_id: user.id,
          topic_id: topicId,
          topic: deckTitle.trim(),
          verified: true,
          source: "verified",
        })
        .select()
        .single();

      if (deckError) throw deckError;
      const deckId = deck.id;

      // 2️⃣ Insert flashcards
      const validCards = flashcards.filter((f) => f.question.trim() && f.answer.trim());

      if (validCards.length > 0) {
        const rows = validCards.map((f) => ({
          set_id: deckId,
          question: f.question,
          answer: f.answer,
        }));

        const { error: cardsError } = await supabase.from("flashcards").insert(rows);

        if (cardsError) throw cardsError;
      }

      setMessage("✅ Verified deck created successfully!");
      setFlashcards([{ question: "", answer: "" }]);
      setDeckTitle("");
      setTopicId("");
    } catch (err) {
      console.error(err);
      setMessage("❌ Failed to create deck. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const addFlashcard = () => {
    setFlashcards([...flashcards, { question: "", answer: "" }]);
  };

  const updateFlashcard = (index: number, key: "question" | "answer", value: string) => {
    const updated = [...flashcards];
    updated[index][key] = value;
    setFlashcards(updated);
  };

  const removeFlashcard = (index: number) => {
    setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  if (!user)
    return (
      <div className="p-6 text-center">
        <p>You must be logged in as admin to access this page.</p>
      </div>
    );

  // 🛑 Access control — only allow studytomodotcom@gmail.com
  if (user.email !== "studytomodotcom@gmail.com")
    return (
      <div className="p-6 text-center text-red-600">
        <p>Access denied. Admin only.</p>
      </div>
    );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Create Verified Deck</h1>
      <p className="text-gray-600">
        Logged in as <span className="font-medium">{user.email}</span>
      </p>

      {/* Topic Selector */}
      <div>
        <label className="block mb-2 font-medium">Curriculum Topic</label>
        <select
          className="w-full border p-2 rounded"
          value={topicId}
          onChange={(e) => setTopicId(e.target.value)}
        >
          <option value="">Select topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {t.country} / {t.education_level} / {t.subject} / {t.topic}
              {t.subtopic ? ` / ${t.subtopic}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Deck Title */}
      <div>
        <label className="block mb-2 font-medium">Deck Title</label>
        <input
          className="w-full border p-2 rounded"
          placeholder="e.g. Atomic Structure – Core Concepts"
          value={deckTitle}
          onChange={(e) => setDeckTitle(e.target.value)}
        />
      </div>

      {/* Flashcards */}
      <div className="space-y-4">
        <label className="block mb-2 font-medium">Flashcards</label>
        {flashcards.map((f, i) => (
          <div key={i} className="border p-3 rounded space-y-2">
            <input
              className="w-full border p-2 rounded"
              placeholder="Question"
              value={f.question}
              onChange={(e) => updateFlashcard(i, "question", e.target.value)}
            />
            <textarea
              className="w-full border p-2 rounded"
              placeholder="Answer"
              value={f.answer}
              onChange={(e) => updateFlashcard(i, "answer", e.target.value)}
            />
            {flashcards.length > 1 && (
              <button onClick={() => removeFlashcard(i)} className="text-red-500 text-sm">
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addFlashcard}
          className="text-blue-600 text-sm font-medium hover:underline"
        >
          + Add Another Card
        </button>
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className={`w-full py-3 text-white font-semibold rounded ${
          loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
        }`}
      >
        {loading ? "Saving..." : "Create Verified Deck"}
      </button>

      {message && (
        <p
          className={`text-center font-medium ${
            message.startsWith("✅") ? "text-green-600" : "text-red-600"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
