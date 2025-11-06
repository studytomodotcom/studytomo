import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    if (!user_id) return NextResponse.json({ error: "Missing user_id" }, { status: 400 });

    const today = new Date().toISOString().slice(0, 10);

    const { data: streak } = await supabase
      .from("user_streaks")
      .select("*")
      .eq("user_id", user_id)
      .maybeSingle();

    if (!streak) {
      await supabase.from("user_streaks").insert({
        user_id,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: today,
      });
      return NextResponse.json({ current_streak: 1, longest_streak: 1 });
    }

    const lastDate = streak.last_activity_date;
    const diffDays =
      (new Date(today).getTime() - new Date(lastDate).getTime()) / (1000 * 60 * 60 * 24);

    let current = streak.current_streak;
    let longest = streak.longest_streak;

    if (diffDays === 1) {
      current += 1;
      longest = Math.max(longest, current);
    } else if (diffDays > 1) {
      current = 1; // reset streak if missed
    }

    await supabase
      .from("user_streaks")
      .update({
        current_streak: current,
        longest_streak: longest,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user_id);

    return NextResponse.json({
      current_streak: current,
      longest_streak: longest,
    });
  } catch (err) {
    console.error("❌ Streak update error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
