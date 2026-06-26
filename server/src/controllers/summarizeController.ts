import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import { extractTextFromFile, isSupportedFile } from "../utils/fileExtractor.js";

const SUMMARY_SYSTEM_PROMPT =
  "You are a helpful assistant that creates clear, structured summaries of job descriptions and documents. " +
  "Format your response in markdown with these rules:\n" +
  "- Use ## headings for sections (e.g. Role Overview, Key Requirements, Required Skills, Responsibilities, Highlights)\n" +
  "- Use - bullet points under each section for individual items\n" +
  "- Wrap important keywords, skills, technologies, and qualifications in **double asterisks** for emphasis\n" +
  "- Keep summaries focused, scannable, and readable\n" +
  "- Do not use code blocks or tables";

const CHAT_SYSTEM_PROMPT =
  "You are a helpful assistant answering questions about documents and text the user has shared. " +
  "Base your answers on the conversation context. If the context is insufficient, say so clearly.";

type ChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export const ALLOWED_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-2.5-pro",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
] as const;

export type GeminiModelId = (typeof ALLOWED_GEMINI_MODELS)[number];

const DEFAULT_GEMINI_MODEL =
  (process.env.GOOGLE_GEMINI_MODEL?.trim() as GeminiModelId | undefined) || "gemini-2.5-flash";

export function resolveModel(requested?: unknown): GeminiModelId {
  if (typeof requested === "string" && ALLOWED_GEMINI_MODELS.includes(requested as GeminiModelId)) {
    return requested as GeminiModelId;
  }
  return DEFAULT_GEMINI_MODEL;
}

function getApiKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }
  return apiKey;
}

function createModel(systemInstruction: string, modelId: GeminiModelId) {
  const genAI = new GoogleGenerativeAI(getApiKey());
  return genAI.getGenerativeModel({ model: modelId, systemInstruction });
}

function formatGoogleError(error: unknown, modelId: string): { status: number; message: string; code?: string } {
  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes("429") || raw.toLowerCase().includes("quota")) {
    return {
      status: 429,
      code: "QUOTA_EXCEEDED",
      message: `Rate limit reached for "${modelId}". Wait about a minute, try a different model, or check your Google AI quota.`,
    };
  }

  if (raw.includes("404") && raw.toLowerCase().includes("model")) {
    return {
      status: 400,
      code: "MODEL_UNAVAILABLE",
      message: `Model "${modelId}" is not available for your API key. Choose another model from the list.`,
    };
  }

  if (raw.toLowerCase().includes("api key") || raw.includes("403")) {
    return {
      status: 403,
      code: "API_KEY_INVALID",
      message: "Google AI API key is invalid or lacks permission. Check GOOGLE_GENERATIVE_AI_API_KEY on the server.",
    };
  }

  return { status: 500, code: "GOOGLE_AI_ERROR", message: raw || "Failed to communicate with Google AI" };
}

export function sendGoogleError(res: Response, error: unknown, modelId: string) {
  const { status, message, code } = formatGoogleError(error, modelId);
  console.error("Google AI error:", message);
  res.status(status).json({ message, code, model: modelId });
}

async function generateSummary(content: string, modelId: GeminiModelId): Promise<string> {
  const trimmed = content.trim();
  if (!trimmed) {
    throw new Error("No content to summarize");
  }

  if (trimmed.length > 100_000) {
    throw new Error("Content is too large to summarize (max 100,000 characters)");
  }

  const model = createModel(SUMMARY_SYSTEM_PROMPT, modelId);
  const result = await model.generateContent(`Summarize the following content:\n\n${trimmed}`);
  const text = result.response.text();

  return text || "No summary could be generated.";
}

export const listModels = (_req: Request, res: Response) => {
  res.json({
    defaultModel: DEFAULT_GEMINI_MODEL,
    models: ALLOWED_GEMINI_MODELS.map((id) => ({
      id,
      label: id.replace("gemini-", "Gemini ").replace(/-/g, " "),
      tier: id.includes("pro") ? "pro" : "flash",
    })),
  });
};

export const summarizeText = async (req: Request, res: Response) => {
  const modelId = resolveModel(req.body?.model);

  try {
    const { data } = req.body;

    if (!data || typeof data !== "string" || !data.trim()) {
      return res.status(400).json({ message: "Field 'data' with text content is required", code: "MISSING_DATA" });
    }

    const summary = await generateSummary(data, modelId);

    res.json({
      summary,
      sourceType: "text",
      characterCount: data.trim().length,
      model: modelId,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("GOOGLE_GENERATIVE_AI_API_KEY")) {
      res.status(500).json({ message: error.message, code: "API_KEY_MISSING" });
      return;
    }
    sendGoogleError(res, error, modelId);
  }
};

export const summarizeFile = async (req: Request, res: Response) => {
  const modelId = resolveModel(req.body?.model);

  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "A file is required (PDF, DOC, DOCX, XLS, XLSX, CSV, or TXT)" });
    }

    if (!isSupportedFile(file.originalname, file.mimetype)) {
      return res.status(400).json({
        message: "Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT",
      });
    }

    const extractedText = await extractTextFromFile(file.buffer, file.mimetype, file.originalname);

    if (!extractedText) {
      return res.status(400).json({ message: "Could not extract readable text from the uploaded file" });
    }

    const additionalData = typeof req.body?.data === "string" ? req.body.data.trim() : "";
    const contentToSummarize =
      additionalData ? `${extractedText}\n\n--- Additional notes ---\n${additionalData}` : extractedText;

    const summary = await generateSummary(contentToSummarize, modelId);

    res.json({
      summary,
      sourceType: "file",
      fileName: file.originalname,
      characterCount: contentToSummarize.length,
      model: modelId,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("GOOGLE_GENERATIVE_AI_API_KEY")) {
      res.status(500).json({ message: error.message, code: "API_KEY_MISSING" });
      return;
    }
    sendGoogleError(res, error, modelId);
  }
};

export const summarizeChat = async (req: Request, res: Response) => {
  const modelId = resolveModel(req.body?.model);

  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const normalizedMessages = (messages as ChatMessage[])
      .filter((msg) => (msg.role === "user" || msg.role === "assistant") && msg.content?.trim())
      .map((msg) => ({
        role: msg.role,
        content: msg.content.trim(),
      }));

    if (normalizedMessages.length === 0) {
      return res.status(400).json({ message: "At least one message with content is required" });
    }

    const history = normalizedMessages.slice(0, -1).map((msg) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    const lastMessage = normalizedMessages[normalizedMessages.length - 1];
    const model = createModel(CHAT_SYSTEM_PROMPT, modelId);
    const chat = model.startChat({ history });

    const result = await chat.sendMessage(lastMessage.content);
    const text = result.response.text();

    res.json({
      response: text || "No response generated.",
      model: modelId,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("GOOGLE_GENERATIVE_AI_API_KEY")) {
      res.status(500).json({ message: error.message, code: "API_KEY_MISSING" });
      return;
    }
    sendGoogleError(res, error, modelId);
  }
};
