"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

export default function GeneratePage() {
  const user = useUser();
  const router = useRouter();

  const [input, setInput] = useState("");
  const [topics, setTopics] = useState<any[]>([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [debug, setDebug] = useState<any>(null);

  useEffect(() => {
    const loadTopics = async () => {
      const { data, error } = await supabase
        .from("curriculum_topics")
        .select("id, country, education_level, subject, topic, subtopic")
        .order("country", { ascending: true });
      if (!error && data) setTopics(data);
    };
    loadTopics();
  }, []);

  const handleGenerate = async () => {
    if (!input.trim()) return alert("Please enter some text.");
    if (!user) return alert("You must be logged in.");

    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input,
          userId: user.id,
          topicId: selectedTopic || null,
        }),
      });
      const result = await res.json();
      setDebug(result);

      if (res.ok) {
        alert("✅ Flashcards generated!");
        router.push(`/flashcards/${result.setId}`);
      } else {
        alert(`❌ ${result.error || "Failed to generate"}`);
      }
    } catch (e) {
      console.error(e);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">AI Flashcard Generator</h1>
      <textarea
        className="w-full border p-3 rounded min-h-[150px]"
        placeholder="Paste your notes, textbook section, or content here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <div>
        <label className="block mb-1 font-medium text-gray-700">
          Link to Curriculum Topic (optional)
        </label>
        <select
          className="w-full border p-2 rounded"
          value={selectedTopic}
          onChange={(e) => setSelectedTopic(e.target.value)}
        >
          <option value="">— None —</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>
              {`${t.country} / ${t.education_level} / ${t.subject} / ${t.topic}${
                t.subtopic ? ` / ${t.subtopic}` : ""
              }`}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading}
        className={`w-full py-3 rounded text-white font-semibold ${
          loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {loading ? "Generating..." : "Generate Flashcards"}
      </button>

      {debug && (
        <pre className="bg-gray-100 text-xs p-3 rounded overflow-x-auto">
          {JSON.stringify(debug, null, 2)}
        </pre>
      )}
    </div>
  );
}
