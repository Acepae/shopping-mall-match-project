export interface ControlNetArgs {
    input_image: string; // Base64 or URL
    module: string;
    model: string;
    weight?: number;
}

export interface IPAdapterArgs {
    input_image: string; // Base64 or URL
    module: string;
    model: string;
    weight?: number;
}

export interface TryOnPayload {
    prompt: string;
    negative_prompt: string;
    steps: number;
    cfg_scale: number;
    width: number;
    height: number;
    sampler_name: string;
    controlnet_args?: ControlNetArgs[]; // Generic structure covering user's "controlnet_args"
    controlnet_units?: ControlNetArgs[]; // Specific user structure variant 2
    ip_adapter_units?: IPAdapterArgs[];  // Specific user structure variant 2
}

/**
 * Generates the specific JSON payload required for the Antigravity / ComfyUI Virtual Try-On.
 * 
 *
 * @param userImage Base64 string or URL of the user's photo
 * @param productImage Base64 string or URL of the product image
 * @returns The constructed JSON payload ready for API submission
 */
console.log("Loaded try-on-service.ts v3 - DYNAMIC PROMPTS ACTIVE");

export async function generateTryOnPayload(
    userImage: string,
    productImage: string,
    productName: string = "clothing item",
    productCategory: string = "Tops",
    productDescription: string = ""
): Promise<any> { // Any because we're returning the API response now, not just the payload
    // 1. Construct the Payload (Internal Helper Logic)
    // ... (Payload construction logic remains the same) ...
    const positivePrompt =
        "(Masterpiece, Best Quality, Photorealistic:1.3), " +
        "A photorealistic photo of a beautiful Korean woman in her 20s with long black wavy hair, smiling brightly, " +
        `wearing a ${productName} (${productCategory}) ${productDescription}, ` +
        "arms crossed, standing in front of a clean white background, " +
        "Soft studio lighting, sharp focus, detailed fabric texture, 8k resolution, white background";

    const negativePrompt =
        "nsfw, low quality, bad anatomy, worst quality, distorted face, ugly, wrong proportions, text, watermark, bad hands, extra fingers, messy background, dark shadows, deformed";

    const payload: TryOnPayload = {
        prompt: positivePrompt,
        negative_prompt: negativePrompt,
        steps: 30,
        cfg_scale: 7.0,
        width: 1024,
        height: 1280,
        sampler_name: "dpmpp_2m_karras",
        controlnet_args: [
            {
                input_image: userImage,
                module: "openpose",
                model: "control_v11p_sd15_openpose",
                weight: 1.0
            },
            {
                input_image: userImage,
                module: "faceid_plusv2",
                model: "ip-adapter-faceid-plusv2_sd15",
                weight: 0.9
            },
            {
                input_image: productImage,
                module: "ip-adapter",
                model: "ip-adapter_sd15",
                weight: 0.8
            }
        ]
    };

    console.log("🔥 GENERATED PAYLOAD:", payload);

    // 2. Call the Backend API (Proxy)
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

        const response = await fetch('/api/try-on', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            throw new Error(`API Request Failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("✅ API RESPONSE:", result);
        return result;

    } catch (error) {
        console.error("❌ API Call Failed:", error); // This is caught in TryOnModal.tsx
        throw error;
    }
}
