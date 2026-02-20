
const GEMINI_API_KEY = process.env.NANOBANANA_API_KEY;

// List of models to try in order of preference
// [CRITICAL] Prioritizing Banana Pro for High-Quality results as requested by CEO.
// List of models to try in order of preference
// [COST-OPTIMIZATION] Using Flash as Primary for 90% cost reduction, Pro as Fallback for quality.
const MODELS_TO_TRY = [
    "gemini-2.5-flash-image",       // High Speed & Ultra Low Cost (Primary)
    "gemini-3-pro-image-preview",   // High Quality (Secondary - Expensive)
    "nano-banana-pro-preview"       // Pro Alias
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

    const isBagOrAccessory = productInfo.toLowerCase().includes('가방') ||
        productInfo.toLowerCase().includes('bag') ||
        productInfo.toLowerCase().includes('tote') ||
        productInfo.toLowerCase().includes('백');

    let prompt = "";

    if (isBagOrAccessory) {
        prompt = `[NANO-BANANA VTO COMMAND: ACCESSORY INTEGRATION]
    OBJECTIVE: Add the bag/accessory from Image 2 to the person in Image 1 naturally.
    
    SOURCE DATA:
    - Accessory Image: Image 2 (Extract the product and remove its white background)
    - Target Person: Image 1
    
    EXECUTION PROTOCOL:
    1. PRESERVE THE PERSON (CRITICAL): Do NOT erase or change the person's face, body, or original clothing. Their shirt, pants, and body shape must remain exactly 100% identical to Image 1.
    2. BAG PLACEMENT: Place the accessory hanging from ONE shoulder, OR held in ONE hand at their SIDE. 
    3. ARM/HAND ADJUSTMENT: You may redraw ONE arm or hand to naturally hold the bag or support the strap. 
    4. NO FLOATING, NO CENTER HOLDING: The bag must NOT float. Do NOT place the bag in the middle of their chest or stomach. Do NOT have them holding it with both hands.
    5. PRODUCT FIDELITY: Keep the exact color, shape, and design details of the accessory from Image 2.`;
    } else {
        prompt = `[NANO-BANANA VTO COMMAND: ABSOLUTE CLONING]
    OBJECTIVE: CLONE THE PRODUCT from Image 2 onto the person in Image 1 with 100% fidelity.
    
    SOURCE DATA:
    - Product Image: Image 2 (Primary source for color, texture, and details)
    - Target Person: Image 1
    
    EXECUTION PROTOCOL (ZERO DEVIATION):
    1. PIXEL-PERFECT COLOR: You MUST extract the exact hex/color profile from Image 2. DO NOT adjust saturation or brightness. The product on the person MUST match the color of Image 2 exactly, regardless of the text description or lighting environment.
    2. TEXTURE & DETAIL CLONING: Transfer every zipper, strap, and fabric texture exactly. ZERO additions.
    3. REMOVE & REPLACE: Completely remove existing upper-body clothing from the person before applying the clone.
    4. ANATOMICAL INTEGRITY: Preserve the person (head, face, hair, hands) exactly as they are. Do not crop.`;
    }

    prompt += `
    
    [STRICT] If the product is "${productInfo}", DO NOT use a generic version of this item. Use ONLY the visual evidence from Image 2.
    
    OUTPUT: RETURN ONLY THE IMAGE DATA. NO STYLIZATION.`;

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
                    temperature: 0.0,
                    topP: 0.1, // Near-zero randomness for maximum accuracy
                    maxOutputTokens: 8192,
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
