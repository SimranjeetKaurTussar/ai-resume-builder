"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  headline: string;

  education: string; // keep simple for MVP (single textarea)
  skills: string; // comma separated
  experience: string; // textarea
  projects: string; // textarea
};

const emptyData: ResumeData = {
  fullName: "",
  email: "",
  phone: "",
  headline: "",
  education: "",
  skills: "",
  experience: "",
  projects: "",
};

export default function AppPage() {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const [title, setTitle] = useState("My Resume");
  const [data, setData] = useState<ResumeData>(emptyData);
  const [status, setStatus] = useState<string>("");
  const [resumeId, setResumeId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: authData }) => {
      const user = authData.user;
      if (!user) {
        window.location.href = "/login";
        return;
      }
      setUserId(user.id);

      // Load latest resume if exists, else create one
      const { data: existing, error } = await supabase
        .from("resumes")
        .select("id,title,data")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        setStatus(error.message);
        setLoading(false);
        return;
      }

      if (existing && existing.length > 0) {
        const r = existing[0] as any;
        setResumeId(r.id);
        setTitle(r.title ?? "My Resume");
        setData({ ...emptyData, ...(r.data ?? {}) });
      } else {
        const { data: created, error: createErr } = await supabase
          .from("resumes")
          .insert([{ user_id: user.id, title: "My Resume", data: emptyData }])
          .select("id")
          .single();

        if (createErr) setStatus(createErr.message);
        else setResumeId((created as any).id);
      }

      setLoading(false);
    });
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  function updateField<K extends keyof ResumeData>(key: K, value: ResumeData[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
  }

  async function saveResume() {
    setStatus("Saving...");
    if (!userId || !resumeId) {
      setStatus("Not ready yet. Please wait.");
      return;
    }

    const { error } = await supabase
      .from("resumes")
      .update({ title, data })
      .eq("id", resumeId)
      .eq("user_id", userId);

    if (error) setStatus(error.message);
    else setStatus("Saved ✅");
  }

  if (loading) return <main className="p-6">Loading...</main>;

  return (
    <main className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Resume Builder</h2>
          <p className="text-sm text-muted-foreground">
            Fill details → later we’ll generate AI bullets + PDF.
          </p>
        </div>
        <button className="rounded-md border px-3 py-2" onClick={logout}>
          Logout
        </button>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <div className="space-y-2">
          <label className="text-sm">Resume Title</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Data Analyst Resume"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm">Full Name</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              placeholder="Simranjeet Kaur"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Headline</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder="Fresher | UI/UX | Video Editor | etc."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Email</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="you@email.com"
              type="email"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Phone</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+91 XXXXX XXXXX"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Education (paste details)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-[90px]"
            value={data.education}
            onChange={(e) => updateField("education", e.target.value)}
            placeholder="BCA, XYZ College, 2023-2026, CGPA..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Skills (comma separated)</label>
          <input
            className="w-full border rounded-md px-3 py-2"
            value={data.skills}
            onChange={(e) => updateField("skills", e.target.value)}
            placeholder="React, Next.js, Figma, Canva, Excel"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Experience (if fresher, add internships / freelancing)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-[110px]"
            value={data.experience}
            onChange={(e) => updateField("experience", e.target.value)}
            placeholder="Internship at..., Freelance projects..., Achievements..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm">Projects (2–3 projects)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-[110px]"
            value={data.projects}
            onChange={(e) => updateField("projects", e.target.value)}
            placeholder="Project name + what you built + tech + result..."
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="rounded-md bg-black text-white px-4 py-2" onClick={saveResume}>
            Save
          </button>
          {status ? <p className="text-sm">{status}</p> : null}
        </div>
      </div>
    </main>
  );
}
