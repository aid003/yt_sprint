import { generateContentWithParts } from "./geminiClient";
import { prompts } from "./prompts";

export const analyzeSummary = async (videoUrl: string): Promise<string> => {
  return await generateContentWithParts([
    { text: prompts.summary },
    { fileData: { fileUri: videoUrl } },
  ]);
};
