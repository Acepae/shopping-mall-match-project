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
    productDescription: string = "",
    userImageFilename: string = "",
    productImageFilename: string = "" // NEW: Filename of uploaded product image
): Promise<any> {

    // IF no filename is provided, fall back to basic mode (shouldn't happen with new API)
    if (!userImageFilename) {
        console.warn("⚠️ No userImageFilename provided, falling back to basic text-to-image.");
    }

    console.log(`🔥 Generating Advanced Payload (ControlNet + IPAdapter) for User: ${userImageFilename}, Product: ${productImageFilename}`);

    // 1. Prompts
    const positivePrompt =
        "(Masterpiece, Best Quality, Photorealistic:1.3), " +
        "A photorealistic photo of a beautiful Korean woman in her 20s with long black wavy hair, smiling brightly, " +
        `wearing a ${productName} (${productCategory}) ${productDescription}, ` +
        "standing naturally in front of a clean white background, " +
        "Soft studio lighting, sharp focus, detailed fabric texture, 8k resolution, white background";

    const negativePrompt =
        "nsfw, low quality, bad anatomy, worst quality, distorted face, ugly, wrong proportions, text, watermark, bad hands, extra fingers, messy background, dark shadows, deformed";

    // 2. ComfyUI Workflow Construction
    const payload = {
        "prompt": {
            // Node 3: KSampler (The Core)
            "3": {
                "inputs": {
                    "seed": Math.floor(Math.random() * 1000000000000000),
                    "steps": 30, // Increased steps for better quality with IP-Adapter
                    "cfg": 7,
                    "sampler_name": "dpmpp_2m",
                    "scheduler": "karras",
                    "denoise": 1,
                    "model": ["4", 0], // DIRECT CONNECT: Checkpoint Loader (Node 4) -> KSampler (Bypass IPAdapter)
                    "positive": ["10", 0], // Input: Conditioning from ControlNet (Node 10)
                    "negative": ["7", 0],
                    "latent_image": ["5", 0]
                },
                "class_type": "KSampler"
            },
            // Node 4: Checkpoint Loader
            "4": {
                "inputs": {
                    "ckpt_name": "v1-5-pruned-emaonly.ckpt"
                },
                "class_type": "CheckpointLoaderSimple"
            },
            // Node 5: Empty Latent Image
            "5": {
                "inputs": {
                    "width": 512,
                    "height": 768,
                    "batch_size": 1
                },
                "class_type": "EmptyLatentImage"
            },
            // Node 6: Positive Prompt
            "6": {
                "inputs": {
                    "text": positivePrompt,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode"
            },
            // Node 7: Negative Prompt
            "7": {
                "inputs": {
                    "text": negativePrompt,
                    "clip": ["4", 1]
                },
                "class_type": "CLIPTextEncode"
            },
            // Node 8: VAE Decode
            "8": {
                "inputs": {
                    "samples": ["3", 0],
                    "vae": ["4", 2]
                },
                "class_type": "VAEDecode"
            },
            // Node 9: Save Image
            "9": {
                "inputs": {
                    "filename_prefix": "ComfyUI_TryOn",
                    "images": ["8", 0]
                },
                "class_type": "SaveImage"
            },
            // --- CONTROLNET SECTION (Pose) ---
            "10": {
                "inputs": {
                    "strength": 0.8,
                    "conditioning": ["6", 0],
                    "control_net": ["11", 0],
                    "image": ["13", 0]  // Connect directly to LoadImage (Node 13), bypassing Preprocessor
                },
                "class_type": "ControlNetApply"
            },
            "11": {
                "inputs": {
                    "control_net_name": "control_v11p_sd15_openpose.pth"
                },
                "class_type": "ControlNetLoader"
            },
            // Node 12 (Preprocessor) Removed due to "missing_node_type" error
            "13": {
                "inputs": {
                    "image": userImageFilename || "example.png",
                    "upload": "image"
                },
                "class_type": "LoadImage"
            }
            // --- IP-ADAPTER SECTION REMOVED (Nodes 20-23) ---
        }
    };

    console.log("🔥 GENERATED PAYLOAD (ControlNet + IP-Adapter):", JSON.stringify(payload, null, 2));

    // 2. Call the Backend API (Proxy) logic remains handled by route.ts, 
    // we just return payload here if called internally, OR if this function is used to fetch directly (legacy).
    // In our new architecture, this function just returns the JSON object.
    return payload; // Return the payload directly
}


