
import { NextResponse } from 'next/server';
import { TryOnPayload } from '@/lib/try-on-service';

// Check for API URL securely
const COMFY_UI_API_URL = process.env.COMFY_UI_API_URL || "http://127.0.0.1:8188/prompt"; // Default to local ComfyUI

export async function POST(request: Request) {
    try {
        const body: TryOnPayload = await request.json();

        // 1. Validation
        if (!body.prompt || !body.controlnet_args) {
            return NextResponse.json(
                { error: "Invalid payload: Missing prompt or ControlNet arguments" },
                { status: 400 }
            );
        }

        console.log("🚀 Proxying VTO Request to AI Engine:", COMFY_UI_API_URL);
        console.log("📦 Payload Keys:", Object.keys(body));

        // 2. Forward to ComfyUI / Antigravity Engine
        // Note: ComfyUI typically expects a specific format {"prompt": ...} which matches our payload structure
        // or a workflow ID. Adjust based on specific backend API docs.
        const response = await fetch(COMFY_UI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add Authorization if needed: 'Authorization': `Bearer ${process.env.COMFY_API_KEY}`
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("❌ AI Engine Error:", response.status, errorText);
            throw new Error(`AI Engine failed: ${response.status} ${errorText}`);
        }

        // 3. Handle Response
        // ComfyUI usually returns a prompt_id. We might need to poll for the result.
        // For this example, we'll assume a synchronous response or return the ID.
        const result = await response.json();

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("❌ VTO Proxy Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
