import { NextRequest, NextResponse } from "next/server";
import { listResumes, upsertResume } from "@/lib/db";
import { ResumeData } from "@/lib/types";
import { emptyResumeData, initialResumeData } from "@/lib/sampleData";
import { getOrCreateDeviceId, attachDeviceIdCookie } from "@/lib/deviceAuth";

export async function GET(request: NextRequest) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const resumes = listResumes(deviceId);
    const response = NextResponse.json({ success: true, resumes, deviceId });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list resumes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const body = await request.json();
    const { title, templateId, useSample } = body;

    const newId = `cv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const baseData = useSample ? JSON.parse(JSON.stringify(initialResumeData)) : JSON.parse(JSON.stringify(emptyResumeData));

    const resume: ResumeData = {
      ...baseData,
      id: newId,
      userId: deviceId,
      title: title || (useSample ? "Alex Rivera - Resume" : "Untitled Resume"),
      themeConfig: {
        ...baseData.themeConfig,
        templateId: templateId || baseData.themeConfig.templateId,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    upsertResume(resume, deviceId);

    const response = NextResponse.json({ success: true, resume }, { status: 201 });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create resume" },
      { status: 500 }
    );
  }
}
