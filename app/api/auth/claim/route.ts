import { NextRequest, NextResponse } from "next/server";
import { setDeviceDisplayName } from "@/lib/db";
import { getOrCreateDeviceId, attachDeviceIdCookie } from "@/lib/deviceAuth";

// Sets a display name for the caller's device workspace. Ownership never changes here.
export async function POST(request: NextRequest) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const { userName } = await request.json();
    const name = typeof userName === "string" ? userName.trim().slice(0, 100) : "";
    if (!name) {
      return NextResponse.json(
        { success: false, error: "userName is required" },
        { status: 400 }
      );
    }

    setDeviceDisplayName(deviceId, name);
    const response = NextResponse.json({ success: true });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save profile" },
      { status: 500 }
    );
  }
}
