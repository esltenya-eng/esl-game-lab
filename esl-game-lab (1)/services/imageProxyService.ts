
/**
 * Image Proxy Service
 * 브라우저에서 직접 API Key를 사용하지 않고 Cloud Run/Functions 서버 프록시를 호출합니다.
 */

interface GenerateImageRequest {
  prompt: string;
  gameId: string;
  season?: string;
}

export const generateSecureImage = async (params: GenerateImageRequest): Promise<string> => {
  // 실제 운영 환경에서는 서버 엔드포인트를 호출합니다.
  // 예: const response = await fetch('https://api.esl-game-lab.com/image-proxy/generate', { ... })
  
  // 여기서는 프록시 패턴을 시뮬레이션합니다. 
  // 서버측에서는 gemini-2.5-flash-image 모델을 사용하여 이미지를 생성하고 Base64를 반환해야 합니다.
  
  try {
    const response = await fetch('/api/image-proxy/generate', {
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
        if (response.status === 429) throw new Error("Rate limit exceeded. Please try later.");
        throw new Error("Failed to generate image via proxy.");
    }

    const data = await response.json();
    return data.imageUrl || data.imageBase64; // data:image/png;base64,...
  } catch (error) {
    console.error("Image Proxy Error:", error);
    throw error;
  }
};
