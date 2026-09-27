import { NextRequest, NextResponse } from "next/server";
import { checkCustomUrlAvailable } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const url = searchParams.get("url");
    const resumeId = searchParams.get("resumeId") || undefined;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Missing url parameter" },
        { status: 400 }
      );
    }

    const available = checkCustomUrlAvailable(url, resumeId);
    return NextResponse.json({ success: true, available });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check url" },
      { status: 500 }
    );
  }
}
