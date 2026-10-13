import { NextRequest, NextResponse } from "next/server";
import { uploadBlobToAzure, AZURE_CONFIG } from "@/lib/azure";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file was uploaded." },
        { status: 400 }
      );
    }

    // Sanitize filename: remove special characters, preserve extension
    const originalName = file.name || "video.mp4";
    const extension = originalName.includes(".")
      ? originalName.split(".").pop()
      : "mp4";
    const cleanBaseName = originalName
      .replace(/\.[^/.]+$/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const uniqueFileName = `${Date.now()}_${cleanBaseName}.${extension}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await uploadBlobToAzure(
      uniqueFileName,
      buffer,
      file.type || "video/mp4"
    );

    return NextResponse.json({
      success: true,
      url: result.url,
      filename: uniqueFileName,
      originalName,
      size: file.size,
      container: AZURE_CONFIG.containerName,
      account: AZURE_CONFIG.accountName,
    });
  } catch (error: any) {
    console.error("[API Upload Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to process upload.",
      },
      { status: 500 }
    );
  }
}

