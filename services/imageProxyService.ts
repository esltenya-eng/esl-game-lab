/**
 * Image Proxy Service - Frontend Client
 * Calls backend API for secure image generation
 */

interface GenerateImageRequest {
  prompt: string;
  gameId: string;
  season?: string;
}

// Get API URL from environment or default to relative path
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const generateSecureImage = async (params: GenerateImageRequest): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/image-proxy/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        prompt: `8-bit retro game style illustration of ${params.prompt}, classroom setting, educational, kid-friendly, vibrant colors, pixel art, no text, ${params.season || ''}`,
        gameId: params.gameId
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try later.");
      }
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to generate image via proxy.");
    }

    const data = await response.json();
    return data.imageUrl || data.imageBase64;
  } catch (error) {
    console.error("Image Proxy Error:", error);
    throw error;
  }
};
