import { NextRequest, NextResponse } from "next/server";
import { duplicateResume } from "@/lib/db";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json().catch(() => ({}));
    const newResume = duplicateResume(params.id, body.title);
    if (!newResume) {
      return NextResponse.json(
        { success: false, error: "Original resume not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, resume: newResume }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to duplicate resume" },
      { status: 500 }
    );
  }
}
