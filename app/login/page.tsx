"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [msg, setMsg] = useState<string>("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (!email || !password) {
      setMsg("Please enter email and password.");
      return;
    }

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMsg(error.message);
      else setMsg("Signup successful. Check email if confirmation is enabled.");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setMsg(error.message);
    else window.location.href = "/app";
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 border rounded-lg p-6">
        <h1 className="text-2xl font-semibold">
          {mode === "login" ? "Login" : "Create account"}
        </h1>

        <div className="space-y-2">
          <label className="text-sm">Email</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="you@email.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Password</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="********"
          />
        </div>

        {msg ? <p className="text-sm">{msg}</p> : null}

        <button className="w-full rounded-md bg-black text-white py-2">
          {mode === "login" ? "Login" : "Sign up"}
        </button>

        <button
          type="button"
          className="w-full rounded-md border py-2"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Login"}
        </button>
      </form>
    </main>
  );
}
