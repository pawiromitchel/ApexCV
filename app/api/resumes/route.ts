import { NextRequest, NextResponse } from "next/server";
import { listResumes, upsertResume } from "@/lib/db";
import { ResumeData } from "@/lib/types";
import { emptyResumeData, initialResumeData } from "@/lib/sampleData";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || undefined;
    const resumes = listResumes(userId);
    return NextResponse.json({ success: true, resumes });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, templateId, userId, useSample } = body;

    const newId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const baseData = useSample ? JSON.parse(JSON.stringify(initialResumeData)) : JSON.parse(JSON.stringify(emptyResumeData));

    const resume: ResumeData = {
      ...baseData,
      id: newId,
      userId: userId || undefined,
      title: title || (useSample ? "Alex Rivera - Resume" : "Untitled Resume"),
      themeConfig: {
        ...baseData.themeConfig,
        templateId: templateId || baseData.themeConfig.templateId,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertResume(resume);

    return NextResponse.json({ success: true, resume }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create resume" },
      { status: 500 }
    );
  }
}
