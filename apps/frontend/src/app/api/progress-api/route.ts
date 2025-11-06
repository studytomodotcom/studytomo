import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

/**
 * Updates user progress for a specific deck.
 * Called each time a flashcard is marked correct/incorrect.
 *
 * Request JSON:
 * {
 *   userId: string,
 *   deckId: string,
 *   correct: boolean
 * }
 */
export async function POST(req: Request) {
  try {
    const { userId, deckId, correct } = await req.json();

    if (!userId || !deckId || typeof correct !== "boolean") {
      return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 });
    }

    // 1️⃣  Get existing record
    const { data: existing, error: fetchError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .eq("deck_id", deckId)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") {
      // not a "no rows" error
      console.error("❌ Error fetching progress:", fetchError);
    }

    // 2️⃣  Compute new values
    const prevCorrect = existing?.correct_count ?? 0;
    const prevIncorrect = existing?.incorrect_count ?? 0;

    const correct_count = correct ? prevCorrect + 1 : prevCorrect;
    const incorrect_count = !correct ? prevIncorrect + 1 : prevIncorrect;

    const total = correct_count + incorrect_count;
    const mastery_level = total > 0 ? (correct_count / total) * 100 : 0;

    // 3️⃣  Upsert progress
    const { error: upsertError } = await supabase.from("user_progress").upsert({
      user_id: userId,
      deck_id: deckId,
      correct_count,
      incorrect_count,
      average_score: mastery_level,
      mastery_level,
      last_reviewed: new Date().toISOString(),
      next_review_at: null, // placeholder — future adaptive scheduling
    });

    if (upsertError) {
      console.error("❌ Error updating progress:", upsertError);
      return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
    }

    // 4️⃣  Return updated mastery level
    return NextResponse.json({ mastery_level }, { status: 200 });
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    return NextResponse.json({ error: "Server error", details: `${err}` }, { status: 500 });
  }
}
