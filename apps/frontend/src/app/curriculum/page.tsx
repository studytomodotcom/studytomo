"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

interface CurriculumTopic {
  id: string;
  country: string;
  education_level: string;
  subject: string;
  topic: string;
  subtopic: string | null;
}

export default function CurriculumPage() {
  const router = useRouter();
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");

  // 1️⃣ Load all curriculum topics
  useEffect(() => {
    const loadTopics = async () => {
      const { data, error } = await supabase
        .from("curriculum_topics")
        .select("id, country, education_level, subject, topic, subtopic")
        .order("country", { ascending: true })
        .order("education_level", { ascending: true })
        .order("subject", { ascending: true })
        .order("topic", { ascending: true });

      if (error) console.error(error);
      else setTopics(data || []);
      setLoading(false);
    };
    loadTopics();
  }, []);

  if (loading) return <p className="p-6">Loading curriculum topics...</p>;

  // 2️⃣ Extract unique values for filters
  const countries = [...new Set(topics.map((t) => t.country))];
  const levels = [
    ...new Set(
      topics
        .filter((t) => (selectedCountry ? t.country === selectedCountry : true))
        .map((t) => t.education_level)
    ),
  ];
  const subjects = [
    ...new Set(
      topics
        .filter(
          (t) =>
            (!selectedCountry || t.country === selectedCountry) &&
            (!selectedLevel || t.education_level === selectedLevel)
        )
        .map((t) => t.subject)
    ),
  ];

  // 3️⃣ Filter topics based on selection
  const filteredTopics = topics.filter(
    (t) =>
      (!selectedCountry || t.country === selectedCountry) &&
      (!selectedLevel || t.education_level === selectedLevel) &&
      (!selectedSubject || t.subject === selectedSubject)
  );

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">Curriculum Explorer</h1>
      <p className="text-gray-600">
        Browse by country, level, and subject to find verified flashcard decks.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <select
          className="border p-2 rounded"
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedLevel("");
            setSelectedSubject("");
          }}
        >
          <option value="">All Countries</option>
          {countries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedLevel}
          onChange={(e) => {
            setSelectedLevel(e.target.value);
            setSelectedSubject("");
          }}
          disabled={!selectedCountry}
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>

        <select
          className="border p-2 rounded"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          disabled={!selectedLevel}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {filteredTopics.length === 0 ? (
          <p className="text-gray-500">No topics found for this selection.</p>
        ) : (
          filteredTopics.map((topic) => (
            <div
              key={topic.id}
              onClick={() => router.push(`/curriculum/${topic.id}`)}
              className="border p-4 rounded hover:bg-gray-50 cursor-pointer transition"
            >
              <h2 className="font-semibold">
                {topic.topic}
                {topic.subtopic ? ` – ${topic.subtopic}` : ""}
              </h2>
              <p className="text-sm text-gray-500">
                {topic.country} • {topic.education_level} • {topic.subject}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
