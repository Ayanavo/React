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

const graphicDesignerTemplate: CVTemplateRecord = {
  id: "graphic-designer",
  name: "Graphic Designer",
  description: "Creative profile with contact split layout and single-block portfolio and experience sections.",
  category: "Creative",
  pageProperties: {
    backgroundColor: "#fafafa",
    color: "#18181b",
    dividerColor: "#d4d4d8",
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
          text("tpl-name", "Jordan Lee", { fontSize: 28, fontWeight: "bold", color: "#18181b" }),
          text("tpl-title", "Senior Brand & Visual Designer", {
            fontSize: 14,
            fontWeight: "medium",
            color: "#a855f7",
          }),
        ],
        "tpl-contact-right",
        [
          text("tpl-contact", "jordan.lee@email.com  |  +1 (555) 987-6543", { fontSize: 12, color: "#71717a" }),
          text("tpl-portfolio-link", "behance.net/jordanlee", { fontSize: 12, color: "#71717a" }),
          locationField("tpl-location", "Brooklyn, NY"),
        ],
        55,
        45,
      ),
    },
    {
      id: "tpl-section-summary",
      headerTitle: "Creative Summary",
      headerColor: "#7c3aed",
      weight: 1,
      blocks: singleBlock("tpl-summary-block", [
        text(
          "tpl-summary",
          "Concept-to-launch designer with 7+ years translating strategy into distinctive brand systems, high-performing campaign visuals, and polished digital experiences. Known for balancing visual originality with conversion-focused execution.",
          { fontSize: 13, color: "#3f3f46" },
        ),
        list("tpl-highlights", [
          "15+ brand campaigns art-directed",
          "28% faster production turnaround",
          "22% foot-traffic uplift on campaign",
          "3.4M launch impressions in month one",
        ]),
      ]),
    },
    {
      id: "tpl-section-tools",
      headerTitle: "Tools & Skills",
      headerColor: "#7c3aed",
      weight: 1.2,
      blocks: singleBlock("tpl-tools-block", [
        tokens("tpl-tools", ["Figma", "Adobe CC", "Illustrator", "Photoshop", "InDesign", "After Effects", "Webflow"], {
          chipColor: "#f3e8ff",
          textColor: "#6b21a8",
          borderColor: "#d8b4fe",
        }),
        list("tpl-tools-list", [
          "Brand identity systems: logo suites, typography scales, and usage guidelines",
          "Digital design: responsive landing pages, social kits, and lifecycle campaign assets",
          "Packaging and print: dielines, prepress coordination, and retail-ready collateral",
          "Collaboration: art direction, critique leadership, and handoff-ready component specs",
        ]),
      ]),
    },
    {
      id: "tpl-section-portfolio",
      headerTitle: "Portfolio Highlights",
      headerColor: "#7c3aed",
      weight: 1.7,
      blocks: singleBlock("tpl-port-block", [
        text("tpl-port-1", "Nova Brand Refresh — End-to-end rebrand for fintech startup", {
          fontSize: 14,
          fontWeight: "semi-bold",
        }),
        text("tpl-port-1-desc", "Created identity architecture, UI visual language, sales deck system, and launch campaign assets used across 5 markets", {
          fontSize: 12,
          color: "#71717a",
        }),
        text("tpl-port-2", "Urban Eats Campaign — Multi-channel ad series", { fontSize: 14, fontWeight: "semi-bold" }),
        text("tpl-port-2-desc", "Designed OOH, paid social, and in-store creative suite that contributed to a 22% uplift in foot traffic and 16% higher repeat visits", {
          fontSize: 12,
          color: "#71717a",
        }),
        text("tpl-port-3", "Pulse Product Launch — Lifestyle campaign toolkit", { fontSize: 14, fontWeight: "semi-bold" }),
        text("tpl-port-3-desc", "Produced launch visuals, influencer templates, and animated assets that generated 3.4M impressions in the first month", {
          fontSize: 12,
          color: "#71717a",
        }),
      ]),
    },
    {
      id: "tpl-section-experience",
      headerTitle: "Experience",
      headerColor: "#7c3aed",
      weight: 1.2,
      blocks: singleBlock("tpl-exp-block", [
        text("tpl-exp-title", "Senior Graphic Designer — Studio Collective", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-date", "2020-01-01"),
        list("tpl-exp-list", [
          "Art-directed integrated campaigns for 15+ consumer and lifestyle brands across web, retail, and print",
          "Built repeatable Figma component libraries that cut production turnaround time by 28%",
          "Partnered with copywriters, strategists, and developers to ship conversion-focused landing pages and email journeys",
          "Guided two junior designers through critique sessions and presentation coaching",
        ]),
      ]),
    },
  ]),
};

export default graphicDesignerTemplate;
