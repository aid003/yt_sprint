import { generateContentWithParts } from "./geminiClient";
import { prompts } from "./prompts";

export const analyzeTranscript = async (videoUrl: string): Promise<string> => {
  return await generateContentWithParts([
    { text: prompts.transcript },
    { fileData: { fileUri: videoUrl } },
  ]);
};
