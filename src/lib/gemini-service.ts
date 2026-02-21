
const GEMINI_API_KEY = process.env.NANOBANANA_API_KEY;

// List of models to try in order of preference
// [CRITICAL] Prioritizing Banana Pro for High-Quality results as requested by CEO.
// List of models to try in order of preference
// [CRITICAL] Using Nano-Banana Pro (Gemini 3 Pro) as Primary for high-quality, complex prompt adherence (like exact hand postures).
const MODELS_TO_TRY = [
    "nano-banana-pro-preview",      // Pro Alias (Primary for complex VTO)
    "gemini-3-pro-image-preview",   // High Quality Fallback
    "gemini-2.5-flash-image"        // Fast/Low Cost Fallback
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

    const lowerInfo = productInfo.toLowerCase();

    const isShoes = lowerInfo.includes('신발') ||
        lowerInfo.includes('shoe') ||
        lowerInfo.includes('sneaker') ||
        lowerInfo.includes('운동화') ||
        /\bitem 9\b/.test(lowerInfo) || // Known sneaker item from mock data
        /\bitem 8\b/.test(lowerInfo) ||
        /\bitem 12\b/.test(lowerInfo); // Explicitly flag 12 as a shoe just in case

    const isBagOrAccessory = lowerInfo.includes('가방') ||
        lowerInfo.includes('bag') ||
        lowerInfo.includes('tote') ||
        lowerInfo.includes('백') ||
        lowerInfo.includes('accessories') ||
        // Only target specific known bag items to avoid false positives on shoes/clothes
        /\bitem 1\b/.test(lowerInfo) ||
        /\bitem 2\b/.test(lowerInfo);

    const isBackpack = lowerInfo.includes('백팩') ||
        lowerInfo.includes('backpack');

    let prompt = "";

    if (isBackpack) {
        prompt = `[NANO-BANANA VTO COMMAND: BACKPACK EDITORIAL POSE]
    OBJECTIVE: Redraw the person wearing the backpack from Image 2 in a professional fashion model pose exactly matching the reference.
    
    SOURCE DATA:
    - Accessory Image: Image 2 (Extract ONLY the physical backpack. ABSOLUTELY DO NOT copy any text, Korean characters, prices, numbers, or logos from the background of Image 2)
    - Target Person: Image 1 (Face and identity source)
    
    EXECUTION PROTOCOL (ABSOLUTE 3D PUPPETRY OVERRIDE):
    1. CAMERA & BODY STANCE (CRITICAL OVERRIDE): You MUST IGNORE the pose of the person in Image 1. The model MUST be drawn standing with her back mostly towards the camera, her body turned towards the RIGHT side of the frame. We must see her back and the backpack clearly.
    2. HEAD PLACEMENT (CRITICAL): Her HEAD MUST be turned back over her RIGHT shoulder to look directly at the camera with a natural smile. We must see the right side of her face.
    3. BACKPACK PLACEMENT (CRITICAL): The backpack MUST ONLY be worn properly on her back, with both shoulder straps over her shoulders. The backpack must NOT be held in front of her body. It must NOT be held by the top handle.
    4. ARM PLACEMENT (CRITICAL): Her RIGHT hand MUST be gently holding or resting on the right shoulder strap near her front shoulder/collarbone area. Her LEFT arm is mostly hidden or resting naturally.
    5. SEAMLESS BLEND: Ensure the backpack straps perfectly conform to her shoulders and back. It should look like a high-end e-commerce fashion photoshoot against a completely blank white background.
    6. PRESERVE IDENTITY: Keep her facial features and hair exactly like Image 1, but adapt her body perfectly into this exact posture.
    7. TEXT & ARTIFACT BAN (CRITICAL): You MUST completely ERACE and DESTROY any text, Korean characters, product names, or prices that might appear in Image 2. NO TEXT ALLOWED ANYWHERE.
    8. BAN LIST (CRITICAL): Do NOT face fully forward. Do NOT hold the backpack in front of the body. Do NOT hold the backpack by the top handle only. The backpack MUST be worn on the back. Do NOT hang the backpack on just one shoulder.`;
    } else if (isShoes) {
        prompt = `[NANO-BANANA VTO COMMAND: FOOTWEAR EDITORIAL CROUCHING POSE]
    OBJECTIVE: Redraw the person wearing the shoes from Image 2 in a dynamic crouching/squatting fashion pose exactly matching the reference.
    
    SOURCE DATA:
    - Shoes Image: Image 2 (Primary source for design, color, and texture)
    - Target Person: Image 1 (Face and identity source)
    
    EXECUTION PROTOCOL (ABSOLUTE 3D PUPPETRY OVERRIDE):
    1. CAMERA & BODY STANCE (CRITICAL OVERRIDE): You MUST IGNORE the standing pose of the person in Image 1. The model MUST be drawn in a ¾ profile crouching pose. Her entire body MUST be turned to face the RIGHT side of the frame. However, her HEAD MUST be turned to look FORWARD, directly at the camera with clear eye contact.
    2. LEG PLACEMENT (CRITICAL): Her RIGHT knee (the knee closer to the camera) MUST be bent upwards near her chest, pointing towards the right. Her LEFT knee (the knee further from the camera) MUST be bent lower towards the ground.
    3. ARM PLACEMENT (CRITICAL): Her RIGHT arm (closer to the camera) MUST be resting elegantly with the hand draped over her raised right knee. Her LEFT arm MUST rest naturally on her lower left leg/thigh.
    4. FOOTWEAR ENFORCEMENT: The shoes from Image 2 MUST be worn perfectly on BOTH feet, clearly visible at the bottom of the frame.
    5. PRESERVE IDENTITY: Keep the person's face, hair, and clothing style unchanged from Image 1, but adapt their body perfectly into this exact crouching posture, while ensuring eye contact with the camera.
    6. BAN LIST (CRITICAL): Do NOT draw the person standing up straight. Do NOT hold the shoes in hands. Do NOT look away from the camera. The shoes MUST ONLY be worn on the feet. DO NOT generate any text, prices, numbers, or watermarks.`;
    } else if (isBagOrAccessory) {
        prompt = `[NANO-BANANA VTO COMMAND: FASHION EDITORIAL ACCESSORY POSE]
    OBJECTIVE: Redraw the person holding the bag/accessory from Image 2 in a professional fashion model pose.
    
    SOURCE DATA:
    - Accessory Image: Image 2 (Extract ONLY the physical bag. ABSOLUTELY DO NOT copy any text, Korean characters, prices, numbers, or logos from the background of Image 2)
    - Target Person: Image 1 (Face and identity source)
    
    EXECUTION PROTOCOL (ABSOLUTE 3D PUPPETRY OVERRIDE):
    1. CAMERA & STANCE: The model's body MUST be standing sideways in a LEFT PROFILE pose. Her chest should be slightly open toward the camera. ONLY her RIGHT arm should be holding the bag. Turn her head so she looks at the camera.
    2. THE BAG CARRY: The arm holding the bag MUST hang straight down. The bag and the hand holding it MUST be positioned visibly in FRONT of her right thigh/hip. 
    3. SEAMLESS BLEND: Ensure the hand physically connects with the bag handle/straps. The bag MUST NOT float. It should look like a high-end e-commerce fashion photoshoot against a completely blank background.
    4. PRESERVE IDENTITY: Do not change her facial features, hair, or overall appearance from Image 1.
    5. BAN LIST (CRITICAL): Do NOT hold the bag behind her back. Do NOT look backward. Do NOT face right. Do NOT hang the bag straps over the forearm, wrist, or crook of the elbow. The arm MUST NOT be bent at the elbow. Do NOT have her hold the bag with two hands.
    6. TEXT & ARTIFACT BAN (CRITICAL OVERRIDE): You MUST completely ERACE and DESTROY any text, Korean characters, product names, prices (e.g., "17,880원"), or descriptions that might appear in Image 2. The final image MUST contain ONLY the person and the product. NO TEXT ALLOWED ANYWHERE.`;
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
