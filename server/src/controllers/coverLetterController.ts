import { GoogleGenerativeAI } from "@google/generative-ai";
import { Request, Response } from "express";
import CoverLetter from "../models/coverLetterModel.js";
import {
  ALLOWED_GEMINI_MODELS,
  type GeminiModelId,
  resolveModel,
  sendGoogleError,
} from "./summarizeController.js";

const COVER_LETTER_DRAFT_PROMPT =
  "You are a professional cover letter writer. Given a job summary, write a tailored cover letter draft. " +
  "Respond ONLY with valid JSON (no markdown fences) in this exact shape:\n" +
  '{"salutation":"Dear Hiring Manager,","body":["paragraph 1","paragraph 2"],"closing":"Sincerely,"}\n' +
  "Rules: body must contain only the main letter paragraphs. Do not repeat the salutation or any sign-off in body. " +
  "closing must be only the sign-off line such as Sincerely, without the applicant name.";

function getApiKey() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    throw new Error("GOOGLE_GENERATIVE_AI_API_KEY is not configured");
  }
  return apiKey;
}

function parseDraftResponse(text: string) {
  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  const jsonText = jsonMatch ? jsonMatch[0] : trimmed;

  try {
    const parsed = JSON.parse(jsonText) as {
      salutation?: string;
      body?: string[];
      closing?: string;
    };

    const salutation = typeof parsed.salutation === "string" ? parsed.salutation.trim() : "Dear Hiring Manager,";
    const body = Array.isArray(parsed.body)
      ? parsed.body
          .filter((item) => typeof item === "string" && item.trim())
          .map((item) => item.trim())
          .filter((item) => !/^(sincerely|best regards|kind regards|regards)[,.!\s]*$/i.test(item))
          .filter((item) => !/^sincerely,/i.test(item))
      : [];
    const closing = typeof parsed.closing === "string" ? parsed.closing.trim() : "Sincerely,";

    const draft = [salutation, ...body, closing].filter(Boolean).join("\n\n");

    return { draft, sections: { salutation, body, closing } };
  } catch {
    return {
      draft: trimmed,
      sections: {
        salutation: "Dear Hiring Manager,",
        body: trimmed.split("\n\n").filter(Boolean),
        closing: "Sincerely,",
      },
    };
  }
}

export const generateCoverLetterDraft = async (req: Request, res: Response) => {
  const modelId = resolveModel(req.body?.model);

  try {
    const jobSummary = typeof req.body?.jobSummary === "string" ? req.body.jobSummary.trim() : "";
    const sourceText = typeof req.body?.sourceText === "string" ? req.body.sourceText.trim() : "";

    if (!jobSummary && !sourceText) {
      return res.status(400).json({ message: "jobSummary or sourceText is required", code: "MISSING_DATA" });
    }

    const content = [jobSummary && `Job summary:\n${jobSummary}`, sourceText && `Original posting:\n${sourceText}`]
      .filter(Boolean)
      .join("\n\n");

    const genAI = new GoogleGenerativeAI(getApiKey());
    const model = genAI.getGenerativeModel({ model: modelId, systemInstruction: COVER_LETTER_DRAFT_PROMPT });
    const result = await model.generateContent(content);
    const text = result.response.text();
    const parsed = parseDraftResponse(text || "");

    res.json({ ...parsed, model: modelId });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.startsWith("GOOGLE_GENERATIVE_AI_API_KEY")) {
      res.status(500).json({ message: error.message, code: "API_KEY_MISSING" });
      return;
    }
    sendGoogleError(res, error, modelId);
  }
};

export const saveCoverLetter = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { name, job, tag, elements, pageProperties } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ message: "Cover letter elements are required" });
    }

    const coverLetter = await CoverLetter.create({
      name,
      job,
      tag,
      elements,
      pageProperties,
      createdBy: userId,
      modifiedBy: userId,
    });

    res.status(201).json({ message: "Cover letter saved successfully", coverLetter });
  } catch (error) {
    res.status(500).json({ message: "Error saving cover letter", error });
  }
};

export const getCoverLetterList = async (req: Request, res: Response) => {
  try {
    const query = req.user?.id ? { createdBy: req.user.id } : {};
    const coverLetterList = await CoverLetter.find(query).sort({ updatedAt: -1 });

    res.status(200).json({ coverLetterList });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cover letter list", error });
  }
};

export const getCoverLetterById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = req.user?.id ? { _id: id, createdBy: req.user.id } : { _id: id };
    const coverLetter = await CoverLetter.findOne(query);

    if (!coverLetter) {
      return res.status(404).json({ message: "Cover letter not found" });
    }

    res.status(200).json({ coverLetter });
  } catch (error) {
    res.status(500).json({ message: "Error fetching cover letter", error });
  }
};

export const updateCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { name, job, tag, elements, pageProperties } = req.body;

    if (!Array.isArray(elements)) {
      return res.status(400).json({ message: "Cover letter elements are required" });
    }

    const query = userId ? { _id: id, createdBy: userId } : { _id: id };
    const coverLetter = await CoverLetter.findOneAndUpdate(
      query,
      { name, job, tag, elements, pageProperties, modifiedBy: userId },
      { new: true }
    );

    if (!coverLetter) {
      return res.status(404).json({ message: "Cover letter not found" });
    }

    res.status(200).json({ message: "Cover letter updated successfully", coverLetter });
  } catch (error) {
    res.status(500).json({ message: "Error updating cover letter", error });
  }
};

export const deleteCoverLetter = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const query = userId ? { _id: id, createdBy: userId } : { _id: id };
    const deleted = await CoverLetter.findOneAndDelete(query);

    if (!deleted) {
      return res.status(404).json({ message: "Cover letter not found" });
    }

    res.status(200).json({ message: "Cover letter deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting cover letter", error });
  }
};

export { ALLOWED_GEMINI_MODELS, type GeminiModelId };
