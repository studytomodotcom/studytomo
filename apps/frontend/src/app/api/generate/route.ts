import { NextResponse } from "next/server";
import OpenAI from "openai";
import { supabase } from "@/lib/supabaseClient";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { input, userId, topicId } = body;

    if (!input || !userId) {
      return NextResponse.json({ error: "Missing input or userId" }, { status: 400 });
    }

    // 1️⃣  Prompt the AI to generate flashcards from text
    const systemPrompt = `
You are a flashcard generator.
Given academic notes or explanations, create clear Q&A flashcards in JSON format:

[
  { "question": "...", "answer": "..." },
  ...
]

Keep answers concise but accurate.
Return only valid JSON — no markdown, code fences, or commentary.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: input },
      ],
      temperature: 0.4,
    });

    const rawText = completion.choices?.[0]?.message?.content?.trim() || "[]";

    // 2️⃣  Safely parse JSON
    let flashcards: { question: string; answer: string }[] = [];
    try {
      flashcards = JSON.parse(rawText);
      if (!Array.isArray(flashcards)) flashcards = [];
    } catch {
      flashcards = [];
    }

    // 3️⃣  Create flashcard set
    const { data: setData, error: setError } = await supabase
      .from("flashcard_sets")
      .insert({
        user_id: userId,
        topic_id: topicId ?? null,
        topic: topicId ? null : "Untitled Set",
        raw_text: input,
        verified: false,
        source: "user",
      })
      .select()
      .single();

    if (setError) {
      console.error("❌ Error creating flashcard set:", setError);
      return NextResponse.json({ error: "Failed to create flashcard set" }, { status: 500 });
    }

    const setId = setData.id as string;

    // 4️⃣  Insert generated flashcards
    if (flashcards.length > 0) {
      const rows = flashcards.map((f) => ({
        set_id: setId,
        question: f.question ?? "",
        answer: f.answer ?? "",
      }));

      const { error: cardsError } = await supabase.from("flashcards").insert(rows);

      if (cardsError) {
        console.error("❌ Error inserting flashcards:", cardsError);
      }
    }

    // 5️⃣  Return response
    return NextResponse.json({ setId, flashcards, topicId }, { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: "Server error", details: `${err}` }, { status: 500 });
  }
}
