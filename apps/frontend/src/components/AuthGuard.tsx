"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useUserSession } from "@/lib/hooks/useUserSession";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user } = useUserSession();
  const router = useRouter();

  useEffect(() => {
    if (user === null) {
      router.replace("/auth/login");
    }
  }, [user, router]);

  // Wait until Supabase initializes
  if (user === undefined) return null;

  return <>{children}</>;
}
