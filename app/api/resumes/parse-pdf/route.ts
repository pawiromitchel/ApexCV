import { NextRequest, NextResponse } from "next/server";
import { parsePdfResume } from "@/lib/pdfParser";
import { upsertResume } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const saveToDb = formData.get("save") !== "false";

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No PDF file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const parsedResume = await parsePdfResume(buffer);

    // If fileName was provided, set fallback title
    if (file.name && (!parsedResume.personalInfo.fullName || parsedResume.personalInfo.fullName === "Unnamed")) {
      parsedResume.title = file.name.replace(/\.[^/.]+$/, "");
    }

    if (saveToDb) {
      upsertResume(parsedResume);
    }

    return NextResponse.json({
      success: true,
      resume: parsedResume,
      message: "PDF parsed successfully",
    });
  } catch (error: any) {
    console.error("PDF Parsing Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to parse PDF resume",
      },
      { status: 500 }
    );
  }
}
