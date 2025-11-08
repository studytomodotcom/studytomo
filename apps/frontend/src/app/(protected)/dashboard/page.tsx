"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseBrowserClient";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    })();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Dashboard</h1>
      {user ? <p>Welcome, {user.email}</p> : <p>Loading user…</p>}
    </div>
  );
}
