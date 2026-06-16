import {
  buildBalancedPage,
  dateField,
  degreeAndDate,
  list,
  locationField,
  singleBlock,
  text,
  tokens,
  twoColumns,
} from "./builder.js";
import type { CVTemplateRecord } from "./types.js";

const softwareDeveloperTemplate: CVTemplateRecord = {
  id: "software-developer",
  name: "Software Developer",
  description: "Technical profile with focused block layout for contact, education dates, and stacked experience.",
  category: "Technology",
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
          text("tpl-name", "Alex Morgan", { fontSize: 26, fontWeight: "bold", color: "#0f172a" }),
          text("tpl-title", "Staff Full-Stack Engineer", { fontSize: 14, fontWeight: "medium", color: "#2563eb" }),
        ],
        "tpl-contact-right",
        [
          text("tpl-contact", "alex.morgan@email.com  |  +1 (555) 012-3456", { fontSize: 12, color: "#64748b" }),
          text("tpl-github", "github.com/alexmorgan", { fontSize: 12, color: "#64748b" }),
          locationField("tpl-location", "San Francisco, CA"),
        ],
        55,
        45,
      ),
    },
    {
      id: "tpl-section-summary",
      headerTitle: "Professional Summary",
      weight: 1,
      blocks: singleBlock("tpl-summary-block", [
        text(
          "tpl-summary",
          "Product-minded engineer with 8+ years delivering resilient SaaS platforms from concept to scale. Combines strong system design, API performance tuning, and developer-experience improvements to accelerate feature delivery and keep reliability above 99.95%.",
          { fontSize: 13, color: "#334155" },
        ),
        list("tpl-highlights", [
          "8+ years full-stack delivery",
          "99.95% platform reliability",
          "50K+ daily active users served",
          "40% faster deployment cycles",
        ]),
      ]),
    },
    {
      id: "tpl-section-skills",
      headerTitle: "Technical Skills",
      weight: 1.3,
      blocks: singleBlock("tpl-skills-block", [
        tokens("tpl-skills", ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS", "Kubernetes", "Docker", "GraphQL"], {
          chipColor: "#dbeafe",
          textColor: "#1e40af",
          borderColor: "#93c5fd",
        }),
        list("tpl-skill-list", [
          "Languages: TypeScript, JavaScript, Python, SQL, Go",
          "Frameworks: React, Next.js, Express, Fastify, Prisma",
          "Cloud & Data: AWS (ECS, Lambda, RDS), PostgreSQL, Redis, Kafka",
          "Quality & Delivery: Playwright, Jest, GitHub Actions, Terraform, Sentry",
        ]),
      ]),
    },
    {
      id: "tpl-section-experience",
      headerTitle: "Experience",
      weight: 1.9,
      blocks: singleBlock("tpl-exp-block", [
        text("tpl-exp-1-title", "Staff Software Engineer — TechCorp Inc.", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-1-date", "2021-03-01"),
        list("tpl-exp-1-list", [
          "Directed phased monolith-to-service decomposition across 11 domains, cutting deployment lead time from 2 days to under 45 minutes",
          "Designed event-driven analytics pipeline and real-time dashboards supporting 50K+ daily users with sub-300ms median query latency",
          "Launched platform observability standards (tracing, SLOs, runbooks), reducing Sev-1 incidents by 37% in 12 months",
        ]),
        text("tpl-exp-2-title", "Software Engineer — StartupXYZ", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-2-date", "2018-06-01"),
        list("tpl-exp-2-list", [
          "Built multi-tenant billing, onboarding, and reporting modules for a B2B SaaS product that grew from 30 to 400+ customers",
          "Improved Core Web Vitals by introducing route-level code splitting, API caching, and image optimization, reducing load time by 35%",
          "Mentored 6 engineers and introduced architecture RFC reviews that improved cross-team delivery predictability",
        ]),
      ]),
    },
    {
      id: "tpl-section-education",
      headerTitle: "Education",
      weight: 0.8,
      blocks: degreeAndDate("tpl-edu", "B.S. Computer Science — State University", "2014-05-01", {
        note: "GPA: 3.8/4.0  |  Dean's List (6 semesters)  |  ACM Programming Team",
      }),
    },
  ]),
};

export default softwareDeveloperTemplate;
