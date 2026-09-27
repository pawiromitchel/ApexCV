import { NextRequest, NextResponse } from "next/server";
import { getOrCreateDeviceId, attachDeviceIdCookie, isValidDeviceId } from "@/lib/deviceAuth";
import { claimUnassignedResumes, transferDeviceResumes, listResumes } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const resumes = listResumes(deviceId);
    const response = NextResponse.json({
      success: true,
      deviceId,
      resumeCount: resumes.length,
    });
    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to get device info" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { deviceId, isNew } = getOrCreateDeviceId(request);
    const body = await request.json().catch(() => ({}));
    const { action, syncKey } = body;

    let response: NextResponse;

    if (action === "claim_unassigned") {
      // Hands every ownerless (pre-device-auth) resume to the caller. Only safe on a
      // single-user install, so it must be switched on explicitly.
      if (process.env.ALLOW_CLAIM_UNASSIGNED !== "true") {
        return NextResponse.json(
          { success: false, error: "Claiming unassigned resumes is disabled" },
          { status: 403 }
        );
      }
      const claimedCount = claimUnassignedResumes(deviceId);
      response = NextResponse.json({
        success: true,
        message: `Claimed ${claimedCount} unassigned resume(s) to this device.`,
        claimedCount,
        deviceId,
      });
    } else if (action === "link_device" && typeof syncKey === "string") {
      const cleanKey = syncKey.trim();
      if (!isValidDeviceId(cleanKey) || cleanKey === deviceId) {
        return NextResponse.json(
          { success: false, error: "Invalid sync key" },
          { status: 400 }
        );
      }
      const transferredCount = transferDeviceResumes(cleanKey, deviceId);
      response = NextResponse.json({
        success: true,
        message: `Successfully linked and imported ${transferredCount} resume(s) to this device.`,
        transferredCount,
        deviceId,
      });
    } else {
      response = NextResponse.json(
        { success: false, error: "Invalid action or missing parameters" },
        { status: 400 }
      );
    }

    if (isNew) {
      attachDeviceIdCookie(response, deviceId);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to process device sync" },
      { status: 500 }
    );
  }
}
