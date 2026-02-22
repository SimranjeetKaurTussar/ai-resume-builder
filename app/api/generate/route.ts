import OpenAI from "openai";

export const runtime = "nodejs";

const useFakeAI = process.env.USE_FAKE_AI === "true";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "missing",
});

type ResumeInput = {
  fullName: string;
  headline: string;
  education: string;
  skills: string;
  experience: string;
  projects: string;
};

function makeFakeResult(input: ResumeInput) {
  const role = input.headline?.trim() || "Student / Fresher";
  const skillsClean = (input.skills || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 8);

  return {
    summary: `Motivated ${role} with a strong foundation in ${skillsClean.slice(0, 3).join(", ") || "core skills"}. Looking for opportunities to contribute to real projects and grow fast in a team environment.`,
    experienceBullets: [
      "Built responsive UI screens and reusable components with clean, readable code.",
      "Improved user experience by fixing UI bugs and polishing layouts for mobile and desktop.",
      "Worked on small-to-medium features end-to-end: UI, basic API integration, and testing.",
    ],
    projectBullets: [
      "Created a resume builder app with form-based inputs, save/load functionality, and template preview.",
      "Built modern landing pages with strong UI hierarchy and performance-friendly components.",
      "Implemented authentication and secure data storage using Supabase policies (RLS).",
    ],
    skillsClean: skillsClean.length
      ? skillsClean
      : ["React", "Next.js", "Tailwind", "Supabase", "Git"],
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const input: ResumeInput = body?.input;

    if (!input?.fullName) {
      return Response.json({ error: "fullName is required" }, { status: 400 });
    }

    // ✅ Fake AI mode
    if (useFakeAI) {
      return Response.json({ ok: true, result: makeFakeResult(input) });
    }

    // ✅ Real AI mode (later when billing is active)
    if (!process.env.OPENAI_API_KEY) {
      return Response.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 },
      );
    }

    const prompt = `
You are an expert resume writer for students and early-career creators.
Write ATS-friendly content.
Return ONLY valid JSON with the exact keys:

{
  "summary": "string (2-3 lines)",
  "experienceBullets": ["string", "string", "string"],
  "projectBullets": ["string", "string", "string"],
  "skillsClean": ["string", "string", "string", "string", "string"]
}

Guidelines:
- Use strong action verbs.
- No emojis.
- Keep bullets realistic and not exaggerated.
- If experience is empty or fresher, create bullets based on projects/education.
- Use the user data below.

USER DATA:
Full Name: ${input.fullName}
Headline: ${input.headline}
Education: ${input.education}
Skills: ${input.skills}
Experience: ${input.experience}
Projects: ${input.projects}
`;

    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.4,
    });

    const text = res.choices?.[0]?.message?.content ?? "";

    let json: any = null;
    try {
      json = JSON.parse(text);
    } catch {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start !== -1 && end !== -1) {
        json = JSON.parse(text.slice(start, end + 1));
      }
    }

    if (!json?.summary) {
      return Response.json(
        { error: "AI response invalid", raw: text },
        { status: 500 },
      );
    }

    return Response.json({ ok: true, result: json });
  } catch (e: any) {
    return Response.json(
      { error: e?.message ?? "Unknown error" },
      { status: 500 },
    );
  }
}
