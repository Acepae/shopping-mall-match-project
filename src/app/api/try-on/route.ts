
import { NextResponse } from 'next/server';
import { processNanoBananaTryOn } from '@/lib/gemini-service';

const fs = require('fs');
const path = require('path');

function logtoFile(message: string) {
    const logPath = path.join(process.cwd(), 'debug.log');
    const timestamp = new Date().toISOString();
    try {
        fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
    } catch (e) {
        console.error("Failed to write to log file", e);
    }
}

export async function POST(request: Request) {
    logtoFile("🟢 [NanoBanana] POST request received at /api/try-on");
    try {
        const body = await request.json();
        const { userImage, product } = body;

        logtoFile(`🔍 Request Params: Product=${product?.name}, UserImageLength=${userImage?.length}`);

        if (!userImage) {
            logtoFile("❌ Missing user image");
            return NextResponse.json(
                { error: "Invalid payload: Missing user image" },
                { status: 400 }
            );
        }

        // 1. Prepare Product Info
        const productInfo = `${product?.name || "Clothing"} - ${product?.description || ""} (${product?.category || "Tops"})`;

        // 2. Handle Product Image (Convert local path to Base64 if needed)
        let productImageBase64 = product?.image || "";
        if (productImageBase64.startsWith('/')) {
            const publicPath = path.join(process.cwd(), 'public', productImageBase64);
            if (fs.existsSync(publicPath)) {
                const fileBuffer = fs.readFileSync(publicPath);
                productImageBase64 = `data:image/png;base64,${fileBuffer.toString('base64')}`;
                logtoFile("✅ Product image read from local public folder");
            }
        }

        logtoFile("🚀 Calling NanoBanana Cloud API...");

        // 3. Process with Gemini (NanoBanana)
        const generatedImageBase64 = await processNanoBananaTryOn(
            userImage,
            productImageBase64,
            productInfo,
            logtoFile
        );

        logtoFile("🎉 NanoBanana Response Success - Image Generated");

        return NextResponse.json({
            success: true,
            image: generatedImageBase64
        });

    } catch (error: any) {
        console.error("❌ NanoBanana Proxy Error:", error);
        logtoFile(`🚨 FINAL ERROR: ${error.message}\n${error.stack}`);

        // Map common Gemini errors to user-friendly messages
        let status = 500;
        let message = error.message || "AI 서버 통신 중 오류가 발생했습니다.";

        if (message.includes("408") || message.includes("Timeout")) {
            status = 408;
            message = "AI 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.";
        } else if (message.includes("유출")) {
            status = 403;
            message = "🚨 [개발부장 긴급 공지] API 키가 유출되었습니다! .env 파일을 확인해 주세요.";
        }

        return NextResponse.json(
            {
                success: false,
                error: message,
                details: error.toString()
            },
            { status }
        );
    }
}
