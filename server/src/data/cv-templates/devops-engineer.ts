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

const devopsEngineerTemplate: CVTemplateRecord = {
  id: "devops-engineer",
  name: "DevOps Engineer",
  description: "Infrastructure profile with focused block layout for contact, education dates, and stacked experience.",
  category: "Technology",
  pageProperties: {
    backgroundColor: "#ffffff",
    color: "#0f172a",
    dividerColor: "#d1fae5",
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
          text("tpl-name", "Riley Nakamura", { fontSize: 26, fontWeight: "bold", color: "#0f172a" }),
          text("tpl-title", "Senior DevOps & Platform Engineer", { fontSize: 14, fontWeight: "medium", color: "#059669" }),
        ],
        "tpl-contact-right",
        [
          text("tpl-contact", "riley.nakamura@email.com  |  +1 (555) 234-5678", { fontSize: 12, color: "#64748b" }),
          text("tpl-github", "github.com/rnakamura", { fontSize: 12, color: "#64748b" }),
          locationField("tpl-location", "Seattle, WA"),
        ],
        55,
        45,
      ),
    },
    {
      id: "tpl-section-summary",
      headerTitle: "Professional Summary",
      headerColor: "#059669",
      weight: 1,
      blocks: singleBlock("tpl-summary-block", [
        text(
          "tpl-summary",
          "Infrastructure engineer with 7+ years building secure, observable, and cost-efficient cloud platforms. Specializes in Kubernetes operations, infrastructure-as-code, and CI/CD pipelines that shorten release cycles while improving uptime, compliance, and developer self-service.",
          { fontSize: 13, color: "#334155" },
        ),
        list("tpl-highlights", [
          "99.97% production availability",
          "29% cloud cost reduction",
          "120+ weekly releases enabled",
          "MTTR reduced from 48 to 19 min",
        ]),
      ]),
    },
    {
      id: "tpl-section-skills",
      headerTitle: "Core Skills & Tooling",
      headerColor: "#059669",
      weight: 1.3,
      blocks: singleBlock("tpl-skills-block", [
        tokens("tpl-skills", ["Kubernetes", "Terraform", "AWS", "Docker", "GitHub Actions", "Prometheus", "ArgoCD", "Helm"], {
          chipColor: "#d1fae5",
          textColor: "#065f46",
          borderColor: "#6ee7b7",
        }),
        list("tpl-skill-list", [
          "IaC & Config: Terraform, Ansible, Pulumi, Helm charts",
          "CI/CD: GitHub Actions, Jenkins, ArgoCD, blue/green and canary deployments",
          "Observability: Prometheus, Grafana, Loki, OpenTelemetry, PagerDuty",
          "Security & Ops: Vault, IAM least-privilege, SAST/DAST gates, incident response runbooks",
        ]),
      ]),
    },
    {
      id: "tpl-section-experience",
      headerTitle: "Experience",
      headerColor: "#059669",
      weight: 1.9,
      blocks: singleBlock("tpl-exp-block", [
        text("tpl-exp-1-title", "Senior DevOps Engineer — CloudScale Systems", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-1-date", "2021-01-01"),
        list("tpl-exp-1-list", [
          "Owned EKS platform for 40+ microservices, achieving 99.97% availability across production workloads",
          "Built GitOps delivery model with ArgoCD and Terraform modules, reducing environment provisioning time from days to under 2 hours",
          "Implemented autoscaling and rightsizing program that lowered AWS spend by 29% without performance regressions",
        ]),
        text("tpl-exp-2-title", "DevOps Engineer — DataFlow Analytics", { fontSize: 14, fontWeight: "semi-bold" }),
        dateField("tpl-exp-2-date", "2017-08-01"),
        list("tpl-exp-2-list", [
          "Migrated legacy deployment scripts to containerized CI/CD pipelines supporting 120+ weekly releases",
          "Designed centralized logging and alerting stack used by 8 engineering squads for faster incident triage",
          "Automated compliance checks (SOC 2 controls) in deployment workflows, reducing audit prep effort by 40%",
        ]),
      ]),
    },
    {
      id: "tpl-section-certs",
      headerTitle: "Certifications",
      headerColor: "#059669",
      weight: 0.8,
      blocks: singleBlock("tpl-certs-block", [
        list("tpl-certs", [
          "AWS Certified Solutions Architect — Professional",
          "Certified Kubernetes Administrator (CKA)",
          "HashiCorp Certified: Terraform Associate",
        ]),
      ]),
    },
    {
      id: "tpl-section-education",
      headerTitle: "Education",
      headerColor: "#059669",
      weight: 0.8,
      blocks: degreeAndDate("tpl-edu", "B.S. Information Systems — University of Washington", "2017-06-01", {
        note: "Focus: Cloud Architecture & Distributed Systems",
      }),
    },
  ]),
};

export default devopsEngineerTemplate;
