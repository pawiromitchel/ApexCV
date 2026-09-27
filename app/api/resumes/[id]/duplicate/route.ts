import { NextRequest, NextResponse } from "next/server";
import { duplicateResume } from "@/lib/db";
import { getOrCreateDeviceId, attachDeviceIdCookie } from "@/lib/deviceAuth";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const body = await request.json().catch(() => ({}));
    const newResume = duplicateResume(params.id, deviceId, body.title);
    if (!newResume) {
      return NextResponse.json(
        { success: false, error: "Original resume not found" },
        { status: 404 }
      );
    }
    const response = NextResponse.json({ success: true, resume: newResume }, { status: 201 });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to duplicate resume" },
      { status: 500 }
    );
  }
}
