import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicResume } from "@/lib/db";
import { PublicViewClient } from "@/components/preview/PublicViewClient";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: PageProps): Metadata {
  const resume = getPublicResume(params.id);
  if (!resume) return { title: "CV not available · ApexCV", robots: { index: false } };
  const { fullName, jobTitle } = resume.personalInfo;
  const title = [fullName || resume.title, jobTitle].filter(Boolean).join(" · ");
  const description = resume.summary?.slice(0, 180) || `${fullName || "This"}’s CV, shared with ApexCV.`;
  return {
    title: `${title} · CV`,
    description,
    // Shared CVs are for the people they're sent to, not search engines
    robots: { index: false, follow: false },
    openGraph: { title, description, type: "profile" },
    twitter: { card: "summary", title, description },
  };
}

export default function PublicViewPage({ params }: PageProps) {
  const resume = getPublicResume(params.id);
  if (!resume) notFound();
  return <PublicViewClient initialData={resume} identifier={params.id} />;
}
