import { NextRequest, NextResponse } from "next/server";
import { claimResumesForUser } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { userId, userName, resumeIds } = await request.json();
    if (!userId || !userName) {
      return NextResponse.json(
        { success: false, error: "userId and userName are required" },
        { status: 400 }
      );
    }

    claimResumesForUser(userId, userName, Array.isArray(resumeIds) ? resumeIds : []);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to claim resumes" },
      { status: 500 }
    );
  }
}
