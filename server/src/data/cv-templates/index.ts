import academicResearcherTemplate from "./academic-researcher.js";
import devopsEngineerTemplate from "./devops-engineer.js";
import graphicDesignerTemplate from "./graphic-designer.js";
import projectManagerTemplate from "./project-manager.js";
import salesMarketingTemplate from "./sales-marketing.js";
import softwareDeveloperTemplate from "./software-developer.js";
import type { CVTemplateRecord } from "./types.js";

export const CV_TEMPLATES: CVTemplateRecord[] = [
  softwareDeveloperTemplate,
  devopsEngineerTemplate,
  graphicDesignerTemplate,
  academicResearcherTemplate,
  salesMarketingTemplate,
  projectManagerTemplate,
];

export function getTemplateById(templateId: string): CVTemplateRecord | undefined {
  return CV_TEMPLATES.find((template) => template.id === templateId);
}

export type { CVTemplateRecord, CVTemplateElement, CVTemplatePageProperties } from "./types.js";
