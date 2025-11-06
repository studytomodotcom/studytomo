"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/auth/login");
        return;
      }

      setUserId(user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar_url")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        console.error("Error loading profile:", error);
        setMessage("Error loading profile.");
      } else if (data) {
        setName(data.name || "");
        setAvatarUrl(data.avatar_url || "");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    setLoading(true);
    setMessage("");

    const { error } = await supabase.from("profiles").upsert({
      id: userId,
      name,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      setMessage("Failed to update profile.");
      console.error(error);
    } else {
      setMessage("Profile updated successfully!");
    }

    setLoading(false);
  };

  return (
    <AuthGuard>
      <main className="min-h-screen p-8 bg-gray-50">
        <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
          <h1 className="text-2xl font-bold mb-4">Your Profile</h1>

          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Display Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {avatarUrl && (
                <div className="flex justify-center">
                  <img
                    src={avatarUrl}
                    alt="Avatar Preview"
                    className="w-24 h-24 rounded-full border border-gray-200 object-cover"
                  />
                </div>
              )}

              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Profile"}
              </button>

              {message && <p className="text-sm text-center text-gray-600 mt-2">{message}</p>}
            </div>
          )}
        </div>
      </main>
    </AuthGuard>
  );
}
