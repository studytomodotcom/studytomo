"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Redirects authenticated users away from public auth pages.
 * Example: used in /auth/login or /auth/signup.
 */
export function useRedirectIfAuthenticated(redirectTo = "/dashboard") {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        router.replace(redirectTo);
      }
    };

    checkUser();

    // Optional: listen for auth state change
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace(redirectTo);
    });

    return () => subscription.unsubscribe();
  }, [router, supabase, redirectTo]);
}
