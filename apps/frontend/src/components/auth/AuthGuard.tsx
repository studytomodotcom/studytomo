"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { TomoMascot } from "@/components/tomo/TomoMascot";

/**
 * Protects routes by redirecting unauthenticated users to /auth/login
 * Adds a friendly loading screen while verifying session
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [checking, setChecking] = useState(true);
  const [sessionExists, setSessionExists] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/auth/login");
      } else {
        setSessionExists(true);
      }
      setChecking(false);
    };

    checkSession();
  }, [supabase, router]);

  if (checking) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-gray-600">
        <TomoMascot size={80} mood="thinking" />
        <p className="mt-3 text-sm">Checking your session...</p>
      </div>
    );
  }

  if (!sessionExists) return null;

  return <>{children}</>;
}
