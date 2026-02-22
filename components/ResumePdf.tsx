import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";

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

export function ResumePdf({
  title,
  data,
}: {
  title: string;
  data: ResumeData;
}) {
  const skills = data.aiSkillsClean?.length
    ? data.aiSkillsClean
    : data.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

  const expBullets = data.aiExperienceBullets?.length
    ? data.aiExperienceBullets
    : data.experience
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

  const projBullets = data.aiProjectBullets?.length
    ? data.aiProjectBullets
    : data.projects
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);

  return (
    <Document title={title}>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{data.fullName || "Your Name"}</Text>
          <Text style={styles.sub}>{data.headline || "Headline"}</Text>
          <Text style={styles.contact}>
            {[data.email, data.phone].filter(Boolean).join(" | ")}
          </Text>
          <View style={styles.linksRow}>
            {data.linkedin ? (
              <Link src={data.linkedin} style={styles.link}>
                LinkedIn
              </Link>
            ) : null}
            {data.github ? (
              <Link src={data.github} style={styles.link}>
                GitHub
              </Link>
            ) : null}
            {data.portfolio ? (
              <Link src={data.portfolio} style={styles.link}>
                Portfolio
              </Link>
            ) : null}
          </View>
        </View>

        {/* Summary */}
        <Section title="Summary">
          <Text style={styles.bodyText}>
            {data.aiSummary || "Add your summary using AI generator."}
          </Text>
        </Section>

        {/* Skills */}
        <Section title="Skills">
          <Text style={styles.bodyText}>
            {skills.length ? skills.join(", ") : "Add skills"}
          </Text>
        </Section>

        {/* Experience */}
        <Section title="Experience">
          {expBullets.length ? (
            <BulletList items={expBullets} />
          ) : (
            <Text style={styles.bodyText}>
              Add experience or generate with AI.
            </Text>
          )}
        </Section>

        {/* Projects */}
        <Section title="Projects">
          {projBullets.length ? (
            <BulletList items={projBullets} />
          ) : (
            <Text style={styles.bodyText}>
              Add projects or generate with AI.
            </Text>
          )}
        </Section>

        {/* Education */}
        <Section title="Education">
          <Text style={styles.bodyText}>
            {(data.education || "")
              .split("\n")
              .map((l) => l.trim())
              .filter(Boolean)
              .slice(0, 6)
              .map((l, i) => (
                <View key={i} style={styles.bulletRow}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{l}</Text>
                </View>
              ))}

            {!data.education ? (
              <Text style={styles.bodyText}>Add education</Text>
            ) : null}
          </Text>
        </Section>
      </Page>
    </Document>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function BulletList({ items }: { items: string[] }) {
  const clean = items.filter(Boolean).slice(0, 8);
  return (
    <View style={{ gap: 4 }}>
      {clean.map((t, i) => (
        <View key={i} style={styles.bulletRow}>
          <Text style={styles.bulletDot}>•</Text>
          <Text style={styles.bulletText}>{t}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 32,
    fontSize: 11,
    fontFamily: "Helvetica",
    color: "#111",
  },
  header: {
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    marginBottom: 12,
  },
  linksRow: { flexDirection: "row", gap: 10, marginTop: 4, flexWrap: "wrap" },
  link: { fontSize: 9.5, color: "#111", textDecoration: "underline" },
  name: { fontSize: 18, fontWeight: 700 },
  sub: { fontSize: 11, marginTop: 4 },
  contact: { fontSize: 10, marginTop: 4, color: "#333" },

  section: { marginBottom: 10 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  sectionBody: { paddingLeft: 2 },
  bodyText: { fontSize: 11, lineHeight: 1.35 },

  bulletRow: { flexDirection: "row", gap: 6 },
  bulletDot: { width: 10 },
  bulletText: { flex: 1, lineHeight: 1.35 },
});
