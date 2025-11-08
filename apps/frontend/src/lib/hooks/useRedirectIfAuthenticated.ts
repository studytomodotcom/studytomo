"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Redirects authenticated users away from auth pages
 * (login, signup, etc.) once Supabase session is ready.
 */
export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace(redirectTo);
        return;
      }

      // Listen for login events too
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session) router.replace(redirectTo);
      });

      return () => subscription.unsubscribe();
    };

    checkSession();
  }, [router, supabase, redirectTo]);
}
