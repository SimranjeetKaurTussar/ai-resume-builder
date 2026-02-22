"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { ResumePdf } from "@/components/ResumePdf";

type ResumeRow = {
  id: string;
  title: string;
  data: any;
};

export default function PreviewPage() {
  const [loading, setLoading] = useState(true);
  const [resume, setResume] = useState<ResumeRow | null>(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        window.location.href = "/login";
        return;
      }

      const { data, error } = await supabase
        .from("resumes")
        .select("id,title,data")
        .eq("user_id", auth.user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      if (error) {
        setStatus(error.message);
        setLoading(false);
        return;
      }

      setResume((data?.[0] as any) ?? null);
      setLoading(false);
    })();
  }, []);

  if (loading) return <main className="p-6">Loading...</main>;
  if (!resume)
    return (
      <main className="p-6">No resume found. Go back and create one.</main>
    );

  const fileName = `${(resume.title || "resume").replaceAll(" ", "_")}.pdf`;

  return (
    <main className="p-6 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Preview & Download</h1>
          <p className="text-sm text-muted-foreground">
            This downloads a clean ATS-friendly PDF.
          </p>
        </div>

        <div className="flex gap-3">
          <a className="rounded-md border px-4 py-2" href="/app">
            Back
          </a>

          <PDFDownloadLink
            document={<ResumePdf title={resume.title} data={resume.data} />}
            fileName={fileName}
            className="rounded-md bg-black text-white px-4 py-2"
          >
            {({ loading }) => (loading ? "Preparing PDF..." : "Download PDF")}
          </PDFDownloadLink>
        </div>
      </div>

      {status ? <p className="text-sm">{status}</p> : null}

      <div className="border rounded-lg p-4 space-y-4">
        <p className="text-sm font-medium">Quick preview (text)</p>

        <div className="space-y-1 text-sm">
          <div className="font-semibold text-lg">{resume.data.fullName}</div>
          <div className="text-muted-foreground">{resume.data.headline}</div>
          <div className="text-muted-foreground">
            {resume.data.email}{" "}
            {resume.data.phone ? `| ${resume.data.phone}` : ""}
          </div>
          <div className="text-muted-foreground flex flex-wrap gap-x-2 gap-y-1">
            {resume.data.linkedin ? (
              <a
                className="underline"
                href={resume.data.linkedin}
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            ) : null}
            {resume.data.github ? (
              <a
                className="underline"
                href={resume.data.github}
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            ) : null}
            {resume.data.portfolio ? (
              <a
                className="underline"
                href={resume.data.portfolio}
                target="_blank"
                rel="noreferrer"
              >
                Portfolio
              </a>
            ) : null}
          </div>
        </div>

        <hr />

        {/* Summary */}
        <div className="space-y-1">
          <div className="font-semibold">Summary</div>
          <div className="text-muted-foreground whitespace-pre-wrap">
            {resume.data.aiSummary || "Generate AI summary from /app first."}
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-1">
          <div className="font-semibold">Skills</div>
          <div className="text-muted-foreground whitespace-pre-wrap">
            {(resume.data.aiSkillsClean?.length
              ? resume.data.aiSkillsClean.join(", ")
              : resume.data.skills) || "Add skills"}
          </div>
        </div>

        {/* Experience */}
        <div className="space-y-1">
          <div className="font-semibold">Experience</div>
          {resume.data.aiExperienceBullets?.length ? (
            <ul className="list-disc pl-5 text-muted-foreground">
              {resume.data.aiExperienceBullets.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          ) : (
            <div className="text-muted-foreground whitespace-pre-wrap">
              {resume.data.experience || "Add experience or generate with AI."}
            </div>
          )}
        </div>

        {/* Projects */}
        <div className="space-y-1">
          <div className="font-semibold">Projects</div>

          <div className="text-muted-foreground space-y-3">
            {(resume.data.projects || "")
              .split("\n\n")
              .map((block: string) => block.trim())
              .filter(Boolean)
              .map((block: string, idx: number) => {
                const lines = block
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean);
                const heading = lines[0];
                const bullets = lines
                  .slice(1)
                  .map((b) => b.replace(/^-+\s?/, "").trim())
                  .filter(Boolean);

                return (
                  <div key={idx}>
                    <div className="font-medium text-black">{heading}</div>
                    {bullets.length ? (
                      <ul className="list-disc pl-5">
                        {bullets.map((b, i) => (
                          <li key={i}>{b}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Education */}
        <div className="space-y-1">
          <div className="font-semibold">Education</div>
          <ul className="list-disc pl-5 text-muted-foreground">
            {(resume.data.education || "")
              .split("\n")
              .map((l: string) => l.trim())
              .filter(Boolean)
              .map((l: string, i: number) => (
                <li key={i}>{l}</li>
              ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
