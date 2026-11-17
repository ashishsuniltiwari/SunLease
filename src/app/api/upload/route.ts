import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

// 25MB Max file size
const MAX_FILE_SIZE = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // Accept file, certificate, or document form field
    const file = (formData.get("file") ||
      formData.get("certificate") ||
      formData.get("document")) as File | null;

    if (!file || typeof file === "string" || file.size === 0) {
      return NextResponse.json(
        { error: "No valid file uploaded in form-data payload" },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "File size exceeds the 25MB limit" },
        { status: 400 }
      );
    }

    // Target upload folder in public directory
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadDir, { recursive: true });

    // Sanitize filename and create unique timestamped name
    const sanitizedOriginal = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    const savedFilename = `mnre_${uniqueSuffix}_${sanitizedOriginal}`;
    const destinationPath = path.join(uploadDir, savedFilename);

    // Write file to disk
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await fs.writeFile(destinationPath, buffer);

    const publicUrl = `/uploads/${savedFilename}`;

    return NextResponse.json(
      {
        success: true,
        message: "MNRE certificate uploaded successfully",
        filename: savedFilename,
        originalName: file.name,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        url: publicUrl,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file. Internal server error." },
      { status: 500 }
    );
  }
}
