import React from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicResume } from "@/lib/db";
import { PublicViewClient } from "@/components/preview/PublicViewClient";
import { OG_IMAGE } from "@/lib/site";

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
    // Page-level openGraph replaces the root one entirely, so repeat the image
    openGraph: { title, description, type: "profile", siteName: "ApexCV", images: [OG_IMAGE] },
    twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
  };
}

export default function PublicViewPage({ params }: PageProps) {
  const resume = getPublicResume(params.id);
  if (!resume) notFound();
  return <PublicViewClient initialData={resume} identifier={params.id} />;
}
