// apps/frontend/src/app/(protected)/layout.tsx
import React from "react";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";
import { redirect } from "next/navigation";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  return <>{children}</>;
}
