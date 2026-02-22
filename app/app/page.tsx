"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type ResumeData = {
  fullName: string;
  email: string;
  phone: string;
  headline: string;
  education: string;
  skills: string;
  experience: string;
  projects: string;
  linkedin: string;
  github: string;
  portfolio: string;

  aiSummary?: string;
  aiExperienceBullets?: string[];
  aiProjectBullets?: string[];
  aiSkillsClean?: string[];
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
  linkedin: "",
  github: "",
  portfolio: "",
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

  function updateField<K extends keyof ResumeData>(
    key: K,
    value: ResumeData[K],
  ) {
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
  async function generateAI() {
    setStatus("Generating with AI...");

    try {
      const resp = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          input: {
            fullName: data.fullName,
            headline: data.headline,
            education: data.education,
            skills: data.skills,
            experience: data.experience,
            projects: data.projects,
          },
        }),
      });

      const out = await resp.json();

      if (!resp.ok) {
        setStatus(out?.error || "AI failed");
        return;
      }

      const r = out.result;

      setData((prev) => ({
        ...prev,
        aiSummary: r.summary,
        aiExperienceBullets: r.experienceBullets,
        aiProjectBullets: r.projectBullets,
        aiSkillsClean: r.skillsClean,
      }));

      setStatus("AI generated ✅ Now click Save to store it.");
    } catch (e: any) {
      setStatus(e?.message || "Something went wrong");
    }
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
              placeholder="Your name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Headline</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.headline}
              onChange={(e) => updateField("headline", e.target.value)}
              placeholder={`Frontend Developer | Fresher
UI/UX Designer | Student
Video Editor | Creator`}
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
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm">LinkedIn</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.linkedin}
              onChange={(e) => updateField("linkedin", e.target.value)}
              placeholder="https://linkedin.com/in/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">GitHub</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.github}
              onChange={(e) => updateField("github", e.target.value)}
              placeholder="https://github.com/username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm">Portfolio</label>
            <input
              className="w-full border rounded-md px-3 py-2"
              value={data.portfolio}
              onChange={(e) => updateField("portfolio", e.target.value)}
              placeholder="https://yourwebsite.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm">Education (paste details)</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 min-h-[90px]"
            value={data.education}
            onChange={(e) => updateField("education", e.target.value)}
            placeholder={`Example:
B.Tech CSE — ABC College (2021–2025) | CGPA 8.2
12th — CBSE (2021) | 85%`}
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
          <label className="text-sm">
            Experience (if fresher, add internships / freelancing)
          </label>
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
            placeholder={`Example:
AI Resume Builder | Next.js, Supabase
- Built login + resume saving with RLS security
- Generated summary + bullets using AI
- Exported ATS-friendly PDF

Portfolio Website | React, Tailwind
- Designed responsive UI and improved Lighthouse score`}
          />
        </div>

        {data.aiSummary ? (
          <div className="border rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold">AI Output</h3>

            <div>
              <p className="text-sm font-medium">Summary</p>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {data.aiSummary}
              </p>
            </div>

            {data.aiExperienceBullets?.length ? (
              <div>
                <p className="text-sm font-medium">Experience Bullets</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {data.aiExperienceBullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.aiProjectBullets?.length ? (
              <div>
                <p className="text-sm font-medium">Project Bullets</p>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {data.aiProjectBullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {data.aiSkillsClean?.length ? (
              <div>
                <p className="text-sm font-medium">Clean Skills</p>
                <p className="text-sm text-muted-foreground">
                  {data.aiSkillsClean.join(", ")}
                </p>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="rounded-md bg-black text-white px-4 py-2"
            onClick={saveResume}
          >
            Save
          </button>

          <button className="rounded-md border px-4 py-2" onClick={generateAI}>
            Generate with AI
          </button>

          <a className="rounded-md border px-4 py-2" href="/app/preview">
            Preview / Download
          </a>

          {status ? <p className="text-sm">{status}</p> : null}
        </div>
      </div>
    </main>
  );
}
