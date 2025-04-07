import { fetch, ProxyAgent } from "undici";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

const proxyUrl = process.env.HTTP_PROXY!;
const dispatcher = new ProxyAgent(proxyUrl);

const model = process.env.GEMINI_MODEL;
if (!model) throw new Error("GEMINI_MODEL is missing");

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

type GeminiPart = { text: string } | { fileData: { fileUri: string } };

type GeminiResponse = {
  candidates?: {
    content?: {
      parts?: {
        text?: string;
      }[];
    };
  }[];
};

export async function generateContentWithParts(
  parts: GeminiPart[]
): Promise<string> {
  const body = {
    contents: [
      {
        role: "user",
        parts,
      },
    ],
  };

  const res = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    dispatcher,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Gemini API error: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  const json = (await res.json()) as GeminiResponse;

  return (
    json.candidates?.[0]?.content?.parts?.[0]?.text ||
    "[No response from Gemini]"
  );
}
