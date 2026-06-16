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

const projectManagerTemplate: CVTemplateRecord = {
  id: "project-manager",
  name: "Project Manager",
  description: "Delivery profile with contact split layout and single-block project highlights.",
  category: "Management",
  pageProperties: {
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    dividerColor: "#cbd5e1",
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
          text("tpl-name", "David Chen", { fontSize: 26, fontWeight: "bold", color: "#0f172a" }),
          text("tpl-title", "Program & Project Delivery Lead, PMP", { fontSize: 14, fontWeight: "medium", color: "#0369a1" }),
        ],
        "tpl-contact-right",
        [
          text("tpl-contact", "david.chen@email.com  |  +1 (555) 321-9876", { fontSize: 12, color: "#64748b" }),
          locationField("tpl-location", "Austin, TX"),
        ],
        55,
        45,
      ),
    },
    {
      id: "tpl-section-summary",
      headerTitle: "Summary",
      headerColor: "#0369a1",
      weight: 1,
      blocks: singleBlock("tpl-summary-block", [
        text(
          "tpl-summary",
          "PMP-certified delivery leader with 11+ years directing enterprise IT, cloud, and operations programs across global teams. Blends governance discipline with agile execution to deliver multi-million-dollar initiatives on schedule while increasing adoption and business value realization.",
          { fontSize: 13, color: "#334155" },
        ),
        list("tpl-highlights", [
          "$4.2M ERP program delivered on time",
          "98% user adoption in phase 1",
          "200+ workloads migrated with zero downtime",
          "25% YoY operational cost reduction",
        ]),
      ]),
    },
    {
      id: "tpl-section-competencies",
      headerTitle: "Core Competencies",
      headerColor: "#0369a1",
      weight: 1.2,
      blocks: singleBlock("tpl-comp-block", [
        tokens("tpl-competencies", ["Agile/Scrum", "Risk Management", "Budgeting", "Stakeholder Mgmt", "PMO Governance", "Change Management"], {
          chipColor: "#e0f2fe",
          textColor: "#075985",
          borderColor: "#7dd3fc",
        }),
        list("tpl-comp-list", [
          "Cross-functional team leadership (5–20 members)",
          "Vendor and contract negotiation",
          "Portfolio planning, RAID tracking, and executive steering updates",
          "Jira, Confluence, MS Project, Smartsheet",
        ]),
      ]),
    },
    {
      id: "tpl-section-projects",
      headerTitle: "Project Highlights",
      headerColor: "#0369a1",
      weight: 1.9,
      blocks: singleBlock("tpl-proj-block", [
        text("tpl-proj-1", "ERP Migration — Global Manufacturing Co.", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-proj-1-date", "2022-01-01"),
        list("tpl-proj-1-list", [
          "$4.2M budget, 18-month timeline, 12-country rollout",
          "Delivered on schedule with 98% user adoption in phase 1",
          "Established change champion network and training plan that reduced support tickets by 31% post go-live",
        ]),
        text("tpl-proj-2", "Cloud Infrastructure Upgrade — FinServ Client", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-proj-2-date", "2020-06-01"),
        list("tpl-proj-2-list", [
          "Led migration of 200+ workloads to AWS with zero critical downtime",
          "Reduced operational costs by 25% year-over-year",
          "Introduced release gating and risk escalation workflow that improved delivery confidence across compliance stakeholders",
        ]),
      ]),
    },
    {
      id: "tpl-section-certs",
      headerTitle: "Certifications",
      headerColor: "#0369a1",
      weight: 0.8,
      blocks: singleBlock("tpl-certs-block", [
        list("tpl-certs", [
          "PMP — Project Management Professional (PMI)",
          "Certified Scrum Master (CSM)",
          "SAFe Agilist",
          "ITIL 4 Foundation",
        ]),
      ]),
    },
  ]),
};

export default projectManagerTemplate;
