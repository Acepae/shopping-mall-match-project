
const GEMINI_API_KEY = process.env.NANOBANANA_API_KEY;

// List of models to try in order of preference
// [CRITICAL] Prioritizing Banana Pro for High-Quality results as requested by CEO.
const MODELS_TO_TRY = [
    "gemini-3-pro-image-preview",   // High Quality (Primary - Nano Banana Pro)
    "nano-banana-pro-preview",      // Pro Alias
    "gemini-2.5-flash-image"        // High Speed Fallback
];

/**
 * Calls the Gemini API to perform virtual try-on.
 * Iterates through available models to find the one supported by the API key.
 */
export async function processNanoBananaTryOn(
    userImageBase64: string,
    productImageBase64: string,
    productInfo: string,
    logCallback?: (msg: string) => void
): Promise<string> {
    if (!GEMINI_API_KEY) {
        throw new Error("NANOBANANA_API_KEY is not configured.");
    }

    const userImgData = userImageBase64.replace(/^data:image\/\w+;base64,/, "");
    const productImgData = productImageBase64.replace(/^data:image\/\w+;base64,/, "");

    // [CRITICAL] Use the official NanoBanana VTO instructions for deepest integration
    const prompt = `[NANO-BANANA VTO MODE]
    You are an expert virtual try-on engine. 
    TASK: Synthesize the PERSON from the first image wearing the CLOTHING from the second image.
    INSTRUCTIONS:
    1. SEAMLESS REPLACEMENT: Remove the person's current upper-body clothing and replace it with the product from the second image.
    2. ARCHITECTURE PRESERVATION: Preserve the person's face, hair, body shape, limbs, and background perfectly.
    3. REALISTIC BLENDING: Match the shadows, lighting, and camera angle of the first image. The clothes must follow the body contours and wrinkles naturally.
    4. PRODUCT DETAILS: ${productInfo}.
    5. OUTPUT: Return only the final synthesized photorealistic image in PNG format. No text explanation.`;

    let lastError = "";

    for (const modelName of MODELS_TO_TRY) {
        try {
            const isPro = modelName.includes("pro");
            const modelTimeout = isPro ? 60000 : 30000; // Increased to 60s for Pro quality

            const msg = `📡 [NanoBanana] Attempting with model: ${modelName} (Safe Timeout: ${modelTimeout / 1000}s)`;
            console.log(msg);
            if (logCallback) logCallback(msg);
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;

            const payload = {
                contents: [{
                    parts: [
                        { text: prompt },
                        { inline_data: { mime_type: "image/png", data: userImgData } },
                        { inline_data: { mime_type: "image/png", data: productImgData } }
                    ]
                }],
                generationConfig: {
                    temperature: 0.1, // Lower temperature for more stable synthesis
                    topP: 0.95,
                    maxOutputTokens: 8192, // Increased for image data
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
                ]
            };

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), modelTimeout);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorText = await response.text();
                const warnMsg = `⚠️ [NanoBanana] Model ${modelName} failed: ${response.status} - ${errorText}`;
                console.warn(warnMsg);
                if (logCallback) logCallback(warnMsg);

                if (response.status === 403 && errorText.includes("leaked")) {
                    throw new Error("🚨 [보안 경보] API 키가 유출된 것으로 보고되었습니다! .env 파일에서 NANOBANANA_API_KEY를 즉시 새 키로 교체해 주세요.");
                }

                lastError = `Model ${modelName}: ${response.status}`;
                continue; // Try next model
            }

            const result = await response.json();

            // [CRITICAL] Support both inline_data (standard) and inlineData (returned by some preview nodes)
            const parts = result.candidates?.[0]?.content?.parts || [];
            const imagePart = parts.find((p: any) => p.inline_data || p.inlineData || p.file_data);

            if (imagePart) {
                const base64Data = imagePart.inline_data?.data || imagePart.inlineData?.data;
                if (base64Data) {
                    const successMsg = `✅ [NanoBanana] Model ${modelName} SUCCESS - Returned ${base64Data.length} bytes`;
                    console.log(successMsg);
                    if (logCallback) logCallback(successMsg);
                    return `data:image/png;base64,${base64Data}`;
                }
            }

            const noDataMsg = `⚠️ [NanoBanana] Model ${modelName} returned NO image data. Response: ${JSON.stringify(result).substring(0, 500)}`;
            console.warn(noDataMsg);
            if (logCallback) logCallback(noDataMsg);

            const textPart = result.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text;
            lastError = textPart ? `AI 거부: ${textPart}` : `Model ${modelName} returned no image data.`;

        } catch (err: any) {
            const errMsg = `❌ [NanoBanana] Error with ${modelName}: ${err.message}`;
            console.error(errMsg);
            if (logCallback) logCallback(errMsg);
            lastError = err.message;
            // Continue to next model on timeout or other fetch errors
        }
    }

    throw new Error(`모든 AI 모델 호출에 실패했습니다 (최후 에러: ${lastError}). API 키 권한이나 할당량을 확인해 주세요.`);
}
