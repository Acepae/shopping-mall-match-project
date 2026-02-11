import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get("file") as unknown as File;
        const filename = data.get("filename") as string;

        if (!file || !filename) {
            return NextResponse.json({ success: false, message: "Missing file or filename" }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Save to public folder
        const path = join(process.cwd(), "public", filename);
        await writeFile(path, buffer);
        console.log(`Saved file to ${path}`);

        return NextResponse.json({ success: true, path: `/${filename}` });
    } catch (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ success: false, message: "Upload failed" }, { status: 500 });
    }
}
