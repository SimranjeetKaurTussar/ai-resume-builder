"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AppPage() {
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) window.location.href = "/login";
      else setEmail(data.user.email ?? null);
      setLoading(false);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <button className="rounded-md border px-3 py-2" onClick={logout}>
          Logout
        </button>
      </div>
      <p className="text-muted-foreground">Logged in as: {email}</p>
      <p className="text-muted-foreground">Next: resume form + AI generation.</p>
    </main>
  );
}
