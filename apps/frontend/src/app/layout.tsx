"use client";

import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/lib/supabaseClient";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionContextProvider supabaseClient={supabase}>{children}</SessionContextProvider>
      </body>
    </html>
  );
}
