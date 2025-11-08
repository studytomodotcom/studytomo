import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import OpenAI from "openai"; // if you use GPT for flashcards

// Optional: Initialize your OpenAI client once per route
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient(); // ✅ secure SSR instance
    const body = await req.json();
    const { input, user_id } = body;

    if (!input) {
      return NextResponse.json({ error: "Missing input" }, { status: 400 });
    }

    // ✅ Get current session to verify user identity
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 🧠 (Optional) Generate flashcards via GPT / AI
    // Example: simple GPT prompt for demonstration
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Generate concise flashcards from study text.",
        },
        {
          role: "user",
          content: `Create 5 Q&A flashcards based on this input: ${input}`,
        },
      ],
    });

    const aiOutput = completion.choices[0].message?.content ?? "";
    const flashcards = JSON.parse(aiOutput || "[]");

    // 🗃️ Save generated set into your Supabase DB
    const { data: insertedSet, error: insertError } = await supabase
      .from("flashcards")
      .insert({
        user_id: user_id || user.id,
        title: input.slice(0, 60),
        cards: flashcards,
      })
      .select("id")
      .single();

    if (insertError) throw insertError;

    // ✅ Return the created set ID to the client
    return NextResponse.json({ set_id: insertedSet.id });
  } catch (err: any) {
    console.error("[API /generate] error:", err.message);
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 });
  }
}
