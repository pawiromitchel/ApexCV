import { NextRequest, NextResponse } from "next/server";
import { getOwnedResume, upsertResume, deleteResume } from "@/lib/db";
import { ResumeData } from "@/lib/types";
import { getOrCreateDeviceId, attachDeviceIdCookie } from "@/lib/deviceAuth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { deviceId } = getOrCreateDeviceId(request);
    const resume = getOwnedResume(params.id, deviceId);
    if (!resume) {
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, resume });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch resume" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const body = await request.json();
    const resumeData: ResumeData = {
      ...body,
      id: params.id,
      userId: deviceId,
      updatedAt: new Date().toISOString(),
    };

    const saved = upsertResume(resumeData, deviceId);
    if (!saved) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: This CV is owned by another private device workspace." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({ success: true, resume: resumeData });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update resume" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { deviceId } = getOrCreateDeviceId(request);
    const deleted = deleteResume(params.id, deviceId);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Unauthorized or CV not found." },
        { status: 403 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}
