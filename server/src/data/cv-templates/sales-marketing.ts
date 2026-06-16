import {
  buildBalancedPage,
  dateField,
  list,
  locationField,
  singleBlock,
  text,
  tokens,
  twoColumns,
} from "./builder.js";
import type { CVTemplateRecord } from "./types.js";

const salesMarketingTemplate: CVTemplateRecord = {
  id: "sales-marketing",
  name: "Sales & Marketing",
  description: "Commercial profile with contact split layout and single-block achievements and experience.",
  category: "Business",
  pageProperties: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    dividerColor: "#e2e8f0",
    dividerStyle: "solid",
  },
  elements: buildBalancedPage([
    {
      id: "tpl-section-contact",
      headerTitle: null,
      weight: 0.9,
      blocks: twoColumns(
        "tpl-contact-left",
        [
          text("tpl-name", "Maria Santos", { fontSize: 26, fontWeight: "bold", color: "#0f172a" }),
          text("tpl-title", "Growth Marketing & Sales Leader", { fontSize: 14, fontWeight: "medium", color: "#ea580c" }),
        ],
        "tpl-contact-right",
        [
          text("tpl-contact", "maria.santos@email.com  |  +1 (555) 456-7890", { fontSize: 12, color: "#64748b" }),
          text("tpl-linkedin", "linkedin.com/in/mariasantos", { fontSize: 12, color: "#64748b" }),
          locationField("tpl-location", "Chicago, IL"),
        ],
        55,
        45,
      ),
    },
    {
      id: "tpl-section-summary",
      headerTitle: "Professional Summary",
      headerColor: "#ea580c",
      weight: 1,
      blocks: singleBlock("tpl-summary-block", [
        text(
          "tpl-summary",
          "Commercial leader with 9+ years scaling B2B revenue engines through integrated marketing, consultative selling, and lifecycle optimization. Builds predictable pipeline systems while improving CAC efficiency and win rates across new and expansion segments.",
          { fontSize: 13, color: "#334155" },
        ),
        list("tpl-highlights", [
          "128% of annual sales target ($2.4M ARR)",
          "35% increase in qualified leads",
          "180% social engagement growth",
          "22% CAC reduction",
        ]),
      ]),
    },
    {
      id: "tpl-section-achievements",
      headerTitle: "Key Achievements",
      headerColor: "#ea580c",
      weight: 1.1,
      blocks: singleBlock("tpl-achievements-block", [
        list("tpl-achievements", [
          "Exceeded annual sales target by 128% ($2.4M ARR)",
          "Launched integrated campaign generating 35% increase in qualified leads",
          "Grew social engagement by 180% and reduced CAC by 22%",
          "Built partner co-marketing channel responsible for 18% of quarterly sourced pipeline",
        ]),
      ]),
    },
    {
      id: "tpl-section-experience",
      headerTitle: "Experience",
      headerColor: "#ea580c",
      weight: 1.9,
      blocks: singleBlock("tpl-exp-block", [
        text("tpl-exp-1", "Marketing Manager — GrowthBrand Co.", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-1-date", "2020-04-01"),
        list("tpl-exp-1-list", [
          "Owned $500K annual budget across paid, lifecycle, webinar, and field programs with transparent ROI dashboards",
          "Implemented HubSpot and Salesforce automation sequences that improved lead-nurture conversion by 30%",
          "Introduced account-based campaign pods for enterprise targets, increasing SQL-to-opportunity conversion by 21%",
        ]),
        text("tpl-exp-2", "Account Executive — SalesPro Solutions", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-2-date", "2016-08-01"),
        list("tpl-exp-2-list", [
          "Closed $1.2M in new business across mid-market accounts",
          "Top performer 3 consecutive years (President's Club)",
          "Redesigned discovery-to-proposal process and lifted close rates from 24% to 33%",
        ]),
      ]),
    },
    {
      id: "tpl-section-skills",
      headerTitle: "Skills",
      headerColor: "#ea580c",
      weight: 0.8,
      blocks: singleBlock("tpl-skills-block", [
        tokens("tpl-skills", ["CRM", "SEO/SEM", "HubSpot", "Salesforce", "GA4", "ABM", "Negotiation", "Lifecycle Marketing"], {
          chipColor: "#ffedd5",
          textColor: "#9a3412",
          borderColor: "#fdba74",
        }),
      ]),
    },
  ]),
};

export default salesMarketingTemplate;
