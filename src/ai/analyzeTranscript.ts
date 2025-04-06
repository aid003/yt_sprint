import { ai } from "./geminiClient";
import { prompts } from "./prompts";
import "dotenv/config";

const model = process.env.GEMINI_MODEL!;
if (!model) throw new Error("GEMINI_MODEL не задан в .env");

export const analyzeTranscript = async (videoUrl: string): Promise<string> => {
  const result = await ai.models.generateContent({
    model,
    contents: [
      {
        role: "user",
        parts: [
          { text: prompts.transcript },
          { fileData: { fileUri: videoUrl } },
        ],
      },
    ],
  });

  if (!result.text) throw new Error("Пустой ответ от Gemini");
  return result.text;
};
