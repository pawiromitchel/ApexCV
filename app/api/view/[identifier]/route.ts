import { NextRequest, NextResponse } from "next/server";
import { getPublicResume } from "@/lib/db";

// Public, read-only endpoint used by shared /view pages to poll for updates.
export async function GET(
  _request: NextRequest,
  { params }: { params: { identifier: string } }
) {
  try {
    const resume = getPublicResume(params.identifier);
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
