import { GoogleGenAI, Modality } from "@google/genai";
import { audioService } from "./audioService.ts";

// Always use const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function getAudioBuffer(text: string): Promise<AudioBuffer | null> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
      const data = audioService.decode(base64Audio);
      return await audioService.decodeAudioData(data);
    }
  } catch (error) {
    console.error("Gemini TTS Buffer Error:", error);
  }
  return null;
}

export async function speak(text: string) {
  try {
    const buffer = await getAudioBuffer(text);
    if (buffer) {
      await audioService.playBuffer(buffer, true);
    }
  } catch (error) {
    console.error("Gemini TTS Error:", error);
  }
}