import React from "react";
import { notFound } from "next/navigation";
import { getResumeById } from "@/lib/db";
import { CvEditor } from "@/components/editor/CvEditor";
import { initialResumeData } from "@/lib/sampleData";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";

export default function CvEditorPage({ params }: PageProps) {
  let resume = getResumeById(params.id);

  if (!resume) {
    if (params.id === "sample-tech-lead") {
      resume = initialResumeData;
    } else {
      notFound();
    }
  }

  return <CvEditor initialData={resume} />;
}
