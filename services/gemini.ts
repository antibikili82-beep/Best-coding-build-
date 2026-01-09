
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { ProjectFile } from "../types";

// Initialize AI with the environment-provided API key
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Generates a full production-ready application structure.
 * Optimized for performance: asks for lightweight patterns and efficient asset loading.
 */
export const generateAppCode = async (prompt: string): Promise<{ files: ProjectFile[], description: string }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Task: Architect a high-performance, production-ready web application.
    User Request: ${prompt}
    
    Performance Requirements:
    1. Use lightweight functional patterns and avoid heavy external dependencies.
    2. Implement efficient Tailwind CSS structures to keep the generated bundle small.
    3. Ensure component modularity for optimal tree-shaking.
    4. index.tsx must be the entry point.
    5. Code should favor native browser APIs where possible for speed.
    
    Architecture: Modern UI with deep dark mode (slate-950).
    
    The output MUST be a valid JSON object matching the schema.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          files: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                path: { type: Type.STRING },
                content: { type: Type.STRING },
              },
              required: ["name", "path", "content"]
            }
          }
        },
        required: ["description", "files"]
      },
      thinkingConfig: { thinkingBudget: 32768 }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    console.error("AI Output parsing error:", e, response.text);
    throw new Error("Architecture generation failed. Please refine your prompt.");
  }
};

/**
 * Search Grounding for architectural research using Gemini 3 Flash.
 */
export const searchGroundingRequest = async (query: string): Promise<{ text: string, sources: any[] }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: query,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
  return {
    text: response.text || "No response generated.",
    sources
  };
};

/**
 * Chatbot implementation for platform users using Gemini 3 Pro.
 */
export const chatWithGemini = async (message: string, history: { role: 'user' | 'model', parts: { text: string }[] }[]) => {
  const chat = ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: "You are the NexusAI Support Bot. Help users with coding, architectural decisions, and platform usage. Be concise and professional.",
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: message,
    config: { thinkingConfig: { thinkingBudget: 2000 } }
  });

  return response.text;
};

/**
 * Analyze images for UI/UX patterns or documentation using Gemini 3 Pro.
 */
export const analyzeImage = async (base64Data: string, prompt: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Data.split(',')[1] || base64Data
        }
      },
      { text: prompt || "Analyze this image for UI/UX patterns and architectural inspiration." }
    ],
    config: { thinkingConfig: { thinkingBudget: 4000 } }
  });

  return response.text || "No analysis provided.";
};

export const runAutoQA = async (files: ProjectFile[]): Promise<string> => {
  const codeContext = files.map(f => `File: ${f.path}\nContent:\n${f.content}`).join('\n\n---\n\n');
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze for bugs/security:\n\n${codeContext}`,
    config: {
      systemInstruction: "QA Engine: Be precise."
    }
  });
  return response.text;
};

export const explainCodeFast = async (fileName: string, content: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-lite-latest',
    contents: `Explain ${fileName}:\n\n${content}`,
  });
  return response.text;
};

export const refactorCode = async (fileName: string, content: string, instruction: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refactor ${fileName} for: ${instruction}. Raw code only.\n\n${content}`,
  });
  return response.text.replace(/^```[a-z]*\n/i, '').replace(/\n```$/i, '').trim();
};
