import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import {
  ALLOWED_GEMINI_MODELS,
  type GeminiModelId,
} from "./summarizeController.js";

const ATS_SYSTEM_PROMPT =
  "You are an expert ATS (Applicant Tracking System) resume analyst. " +
  "Evaluate how well a CV matches a job description considering keyword alignment, skills, experience relevance, " +
  "clarity, structure, and whether the visual color palette is professional and appropriate for the role. " +
  "Return ONLY valid JSON with no markdown fences or extra text.";

const DEFAULT_GEMINI_MODEL =
  (process.env.GOOGLE_GEMINI_MODEL?.trim() as GeminiModelId | undefined) || "gemini-2.5-flash";

function resolveModel(requested?: unknown): GeminiModelId {
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

function formatGoogleError(error: unknown, modelId: string): { status: number; message: string; code?: string } {
  const raw = error instanceof Error ? error.message : String(error);

  if (raw.includes("429") || raw.toLowerCase().includes("quota")) {
    return {
      status: 429,
      code: "QUOTA_EXCEEDED",
      message: `Rate limit reached for "${modelId}". Wait about a minute or try a different model.`,
    };
  }

  if (raw.includes("404") && raw.toLowerCase().includes("model")) {
    return {
      status: 400,
      code: "MODEL_UNAVAILABLE",
      message: `Model "${modelId}" is not available for your API key.`,
    };
  }

  if (raw.toLowerCase().includes("api key") || raw.includes("403")) {
    return {
      status: 403,
      code: "API_KEY_INVALID",
      message: "Google AI API key is invalid or lacks permission.",
    };
  }

  return { status: 500, code: "GOOGLE_AI_ERROR", message: raw || "Failed to communicate with Google AI" };
}

function sendGoogleError(res: Response, error: unknown, modelId: string) {
  const { status, message, code } = formatGoogleError(error, modelId);
  console.error("Google AI ATS error:", message);
  res.status(status).json({ message, code, model: modelId });
}

export type AtsAnalysisResult = {
  score: number;
  ranking: string;
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendations: string[];
};

function parseJsonResponse(raw: string): AtsAnalysisResult {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const jsonText = fenced ? fenced[1].trim() : trimmed;

  const parsed = JSON.parse(jsonText) as Partial<AtsAnalysisResult>;

  const score = typeof parsed.score === "number" ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 0;

  return {
    score,
    ranking: typeof parsed.ranking === "string" ? parsed.ranking : "Unknown",
    summary: typeof parsed.summary === "string" ? parsed.summary : "",
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths.filter((item) => typeof item === "string") : [],
    gaps: Array.isArray(parsed.gaps) ? parsed.gaps.filter((item) => typeof item === "string") : [],
    recommendations: Array.isArray(parsed.recommendations)
      ? parsed.recommendations.filter((item) => typeof item === "string")
      : [],
  };
}

async function analyzeAtsMatch(
  cvText: string,
  jobDescription: string,
  colors: string[],
  pageProperties: Record<string, unknown>,
  modelId: GeminiModelId,
): Promise<AtsAnalysisResult> {
  const trimmedCv = cvText.trim();
  const trimmedJob = jobDescription.trim();

  if (!trimmedCv) {
    throw new Error("CV content is empty");
  }

  if (!trimmedJob) {
    throw new Error("Job description is required");
  }

  if (trimmedCv.length > 80_000 || trimmedJob.length > 50_000) {
    throw new Error("CV or job description is too large to analyze");
  }

  const genAI = new GoogleGenerativeAI(getApiKey());
  const model = genAI.getGenerativeModel({
    model: modelId,
    systemInstruction: ATS_SYSTEM_PROMPT,
  });

  const prompt = `Analyze this CV against the job description.

Return ONLY valid JSON with this exact shape:
{
  "score": <integer 0-100>,
  "ranking": "<Excellent|Good|Fair|Needs Improvement|Poor>",
  "summary": "<2-3 sentence overview of ATS fit>",
  "strengths": ["<strength>", "..."],
  "gaps": ["<gap>", "..."],
  "recommendations": ["<actionable tip>", "..."]
}

Scoring guide:
- 90-100: Excellent ATS match
- 75-89: Good match with minor gaps
- 60-74: Fair match, notable missing keywords or experience
- 40-59: Needs improvement
- 0-39: Poor match

Consider keyword overlap, skills, experience, education, achievements, formatting clarity, and whether the color palette suits a professional CV for this role.

--- CV TEXT ---
${trimmedCv}

--- CV COLOR PALETTE ---
${colors.length ? colors.join(", ") : "No explicit colors detected"}

--- PAGE STYLING ---
${JSON.stringify(pageProperties, null, 2)}

--- JOB DESCRIPTION ---
${trimmedJob}`;

  const result = await model.generateContent(prompt);
  const text = result.response.text();

  if (!text?.trim()) {
    throw new Error("No ATS analysis could be generated");
  }

  try {
    return parseJsonResponse(text);
  } catch {
    throw new Error("Failed to parse ATS analysis from AI response");
  }
}

export const checkAtsScore = async (req: Request, res: Response) => {
  const modelId = resolveModel(req.body?.model);

  try {
    const { cvText, jobDescription, colors, pageProperties } = req.body ?? {};

    if (!cvText || typeof cvText !== "string" || !cvText.trim()) {
      return res.status(400).json({ message: "CV text content is required", code: "MISSING_CV_TEXT" });
    }

    if (!jobDescription || typeof jobDescription !== "string" || !jobDescription.trim()) {
      return res.status(400).json({ message: "Job description is required", code: "MISSING_JOB_DESCRIPTION" });
    }

    const colorList = Array.isArray(colors) ? colors.filter((c) => typeof c === "string") : [];
    const pageProps =
      pageProperties && typeof pageProperties === "object" && !Array.isArray(pageProperties)
        ? (pageProperties as Record<string, unknown>)
        : {};

    const analysis = await analyzeAtsMatch(cvText, jobDescription, colorList, pageProps, modelId);

    res.json({
      ...analysis,
      model: modelId,
    });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message.startsWith("GOOGLE_GENERATIVE_AI_API_KEY")) {
        res.status(500).json({ message: error.message, code: "API_KEY_MISSING" });
        return;
      }

      if (
        error.message === "CV content is empty" ||
        error.message === "Job description is required" ||
        error.message === "CV or job description is too large to analyze"
      ) {
        res.status(400).json({ message: error.message, code: "INVALID_INPUT" });
        return;
      }

      if (error.message === "Failed to parse ATS analysis from AI response") {
        res.status(502).json({ message: error.message, code: "PARSE_ERROR" });
        return;
      }
    }

    sendGoogleError(res, error, modelId);
  }
};
