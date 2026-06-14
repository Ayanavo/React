import axios from "axios";
import { apiUrl, axiosInstance } from "@/shared/interceptors/auth-interceptor";

export type GeminiModelId =
  | "gemini-2.5-flash"
  | "gemini-2.5-pro"
  | "gemini-2.0-flash"
  | "gemini-1.5-flash"
  | "gemini-1.5-pro";

export type GeminiModelOption = {
  id: GeminiModelId;
  label: string;
  tier: "flash" | "pro";
  description: string;
};

export const GEMINI_MODEL_OPTIONS: GeminiModelOption[] = [
  {
    id: "gemini-2.5-flash",
    label: "Gemini 2.5 Flash",
    tier: "flash",
    description: "Fast and efficient — best default for summaries",
  },
  {
    id: "gemini-2.5-pro",
    label: "Gemini 2.5 Pro",
    tier: "pro",
    description: "Higher quality for complex documents",
  },
  {
    id: "gemini-2.0-flash",
    label: "Gemini 2.0 Flash",
    tier: "flash",
    description: "Previous-gen flash model",
  },
  {
    id: "gemini-1.5-flash",
    label: "Gemini 1.5 Flash",
    tier: "flash",
    description: "Reliable fallback with generous free tier",
  },
  {
    id: "gemini-1.5-pro",
    label: "Gemini 1.5 Pro",
    tier: "pro",
    description: "Legacy pro model for detailed analysis",
  },
];

export const DEFAULT_GEMINI_MODEL: GeminiModelId = "gemini-2.5-flash";

export type SummarizeTextResponse = {
  summary: string;
  sourceType: "text";
  characterCount: number;
  model: GeminiModelId;
};

export type SummarizeFileResponse = {
  summary: string;
  sourceType: "file";
  fileName: string;
  characterCount: number;
  model: GeminiModelId;
};

export type SummarizeChatMessage = {
  role: "user" | "assistant" | "system";
  content: string;
};

export type SummarizeChatResponse = {
  response: string;
  model: GeminiModelId;
};

export type SummarizeModelsResponse = {
  defaultModel: GeminiModelId;
  models: Array<{ id: GeminiModelId; label: string; tier: string }>;
};

export type SummarizeErrorInfo = {
  title: string;
  message: string;
  hint?: string;
  status?: number;
  code?: string;
};

const summarizeURL = `${apiUrl}summarize`;

type SummarizeRequestOptions = {
  model: GeminiModelId;
};

export const getSummarizeModels = async (): Promise<SummarizeModelsResponse> => {
  const response = await axiosInstance.get<SummarizeModelsResponse>(`${summarizeURL}/models`);
  return response.data;
};

export const parseSummarizeError = (error: unknown, model?: GeminiModelId): SummarizeErrorInfo => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as { message?: string; code?: string; model?: string } | undefined;
    const message = data?.message || error.message || "Something went wrong";
    const code = data?.code;
    const activeModel = data?.model || model;

    if (status === 429 || code === "QUOTA_EXCEEDED") {
      return {
        title: "Rate limit reached",
        message,
        hint: activeModel
          ? `"${activeModel}" hit its quota. Try Gemini 1.5 Flash or wait about a minute before retrying.`
          : "Try Gemini 1.5 Flash or wait about a minute before retrying.",
        status,
        code,
      };
    }

    if (status === 400 || code === "MODEL_UNAVAILABLE") {
      return {
        title: "Model unavailable",
        message,
        hint: "Select a different model from the dropdown and try again.",
        status,
        code,
      };
    }

    if (status === 401) {
      return {
        title: "Session expired",
        message: "Your login session is no longer valid.",
        hint: "Please sign in again and retry.",
        status,
        code,
      };
    }

    if (status === 403 || code === "API_KEY_INVALID") {
      return {
        title: "API access denied",
        message,
        hint: "The server Google AI key may be invalid or missing permissions.",
        status,
        code,
      };
    }

    if (status === 503 || error.code === "ECONNABORTED") {
      return {
        title: "Request timed out",
        message: "The summary took too long to generate.",
        hint: "Try again with a shorter text or a faster model like Gemini 2.5 Flash.",
        status,
        code,
      };
    }

    if (code === "MISSING_DATA") {
      return {
        title: "Nothing to summarize",
        message,
        hint: "Paste some text or attach a supported file.",
        status,
        code,
      };
    }

    return {
      title: "Summarize failed",
      message,
      status,
      code,
    };
  }

  if (error instanceof Error) {
    return { title: "Summarize failed", message: error.message };
  }

  return { title: "Summarize failed", message: "Something went wrong" };
};

export const summarizeText = async (data: string, options: SummarizeRequestOptions): Promise<SummarizeTextResponse> => {
  const response = await axiosInstance.post<SummarizeTextResponse>(`${summarizeURL}/text`, {
    data,
    model: options.model,
  });
  return response.data;
};

export const summarizeFile = async (
  file: File,
  options: SummarizeRequestOptions,
  data?: string
): Promise<SummarizeFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("model", options.model);
  if (data?.trim()) formData.append("data", data.trim());

  const response = await axiosInstance.post<SummarizeFileResponse>(`${summarizeURL}/file`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 120_000,
  });

  return response.data;
};

export const summarizeChat = async (
  messages: SummarizeChatMessage[],
  options: SummarizeRequestOptions
): Promise<SummarizeChatResponse> => {
  const response = await axiosInstance.post<SummarizeChatResponse>(`${summarizeURL}/chat`, {
    messages,
    model: options.model,
  });
  return response.data;
};
