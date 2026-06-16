import { Request, Response } from "express";
import { CV_TEMPLATES, getTemplateById } from "../data/cv-templates/index.js";

const setNoCacheHeaders = (res: Response) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
};

export const getCvTemplates = (_req: Request, res: Response) => {
  setNoCacheHeaders(res);
  res.status(200).json({ templates: CV_TEMPLATES });
};

export const getCvTemplateById = (req: Request, res: Response) => {
  const templateId = typeof req.params.templateId === "string" ? req.params.templateId : "";
  const template = getTemplateById(templateId);

  if (!template) {
    return res.status(404).json({ message: "CV template not found" });
  }

  setNoCacheHeaders(res);
  res.status(200).json({ template });
};
