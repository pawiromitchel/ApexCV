import { NextRequest, NextResponse } from "next/server";
import { getResumeById, upsertResume, deleteResume } from "@/lib/db";
import { ResumeData } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const resume = getResumeById(params.id);
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
    const body = await request.json();
    const resumeData: ResumeData = {
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };

    upsertResume(resumeData);

    return NextResponse.json({ success: true, resume: resumeData });
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
    deleteResume(params.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to delete resume" },
      { status: 500 }
    );
  }
}
