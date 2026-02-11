import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import * as syncFs from "fs";
import path from "path";

// Force dynamic to prevent caching issues
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        let filename = formData.get("filename") as string;

        console.log(`[Delete API] Request for: ${filename}`);

        if (!filename) {
            return NextResponse.json({ error: "Filename required" }, { status: 400 });
        }

        // Sanitize filename (remove leading slashes for path.join)
        filename = filename.replace(/^[\/\\]/, "");

        const publicDir = path.resolve(process.cwd(), "public");
        const filePath = path.resolve(publicDir, filename);

        console.log(`[Delete API] Target path: ${filePath}`);

        // Robust security check ensuring file is inside public directory
        const relativePath = path.relative(publicDir, filePath);
        const isSafe = !relativePath.startsWith('..') && !path.isAbsolute(relativePath);

        if (!isSafe) {
            console.error(`[Delete API] Security violation. Public: ${publicDir}, Target: ${filePath}`);
            return NextResponse.json({ error: "Invalid file path (Security Violation)" }, { status: 403 });
        }

        if (syncFs.existsSync(filePath)) {
            try {
                // Use async unlink
                await fs.unlink(filePath);
                console.log(`[Delete API] Deleted: ${filePath}`);
                return NextResponse.json({ success: true });
            } catch (unlinkError: any) {
                console.error(`[Delete API] Unlink failed:`, unlinkError);
                return NextResponse.json({
                    error: `Delete failed: ${unlinkError.message}. Code: ${unlinkError.code}`
                }, { status: 500 });
            }
        } else {
            console.log(`[Delete API] File not found (already deleted)`);
            return NextResponse.json({ success: true, message: "File already deleted" });
        }

    } catch (error: any) {
        console.error("[Delete API] Server error:", error);
        return NextResponse.json({ error: `Server error: ${error.message}` }, { status: 500 });
    }
}
