"use client";

import { useSession, useUser } from "@supabase/auth-helpers-react";

/**
 * Simple unified hook to access the Supabase session and user.
 */
export function useUserSession() {
  const session = useSession();
  const user = useUser();

  return { session, user, userId: user?.id ?? null };
}
