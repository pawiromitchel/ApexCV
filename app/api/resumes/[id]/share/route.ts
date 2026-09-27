import { NextRequest, NextResponse } from "next/server";
import { updateResumeShareSettings, getResumeShareSettings } from "@/lib/db";
import { getDeviceIdFromRequest } from "@/lib/deviceAuth";

const ALLOWED_EXPIRY_DAYS = [3, 7, 30];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = getDeviceIdFromRequest(request);
    const settings = deviceId ? getResumeShareSettings(params.id, deviceId) : null;
    if (!settings) {
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch share settings" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deviceId = getDeviceIdFromRequest(request);
    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: "Resume not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { enabled, customUrl, expiresInDays, keepExpiry } = body;

    let expiresAt: string | null = null;
    if (keepExpiry === true) {
      expiresAt = getResumeShareSettings(params.id, deviceId)?.urlExpiresAt ?? null;
    } else if (expiresInDays != null) {
      if (!ALLOWED_EXPIRY_DAYS.includes(expiresInDays)) {
        return NextResponse.json(
          { success: false, error: "Invalid expiry" },
          { status: 400 }
        );
      }
      const date = new Date();
      date.setDate(date.getDate() + expiresInDays);
      expiresAt = date.toISOString();
    }

    const result = updateResumeShareSettings(params.id, deviceId, {
      enabled: enabled === true,
      customUrl: typeof customUrl === "string" ? customUrl : null,
      expiresAt,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.status ?? 400 }
      );
    }

    return NextResponse.json({ success: true, settings: result.settings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update share settings" },
      { status: 500 }
    );
  }
}
