import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * ✅ Client-side Supabase instance
 * Use in "use client" components (hooks, pages, etc.)
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

/**
 * ✅ Server-side helper (for RSC or API routes)
 * Handles cookie read/write safely
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // 👈 add await here

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: any) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // ignore since set() isn't always supported in all contexts
        }
      },
      remove(name: string, options: any) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // ignore since remove() isn't always supported
        }
      },
    },
  });
}
