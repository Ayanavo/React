import {
  buildBalancedPages,
  degreeAndDate,
  list,
  locationField,
  singleBlock,
  text,
  twoColumns,
} from "./builder.js";
import type { CVTemplateRecord } from "./types.js";

const academicResearcherTemplate: CVTemplateRecord = {
  id: "academic-researcher",
  name: "Academic Researcher",
  description: "Scholarly profile with education date alignment and single-block publications.",
  category: "Academia",
  pageProperties: {
    backgroundColor: "#ffffff",
    color: "#1c1917",
    dividerColor: "#d6d3d1",
    dividerStyle: "solid",
  },
  elements: buildBalancedPages([
    [
      {
        id: "tpl-section-contact",
        headerTitle: null,
        weight: 0.9,
        blocks: twoColumns(
          "tpl-contact-left",
          [
            text("tpl-name", "Dr. Priya Sharma", { fontSize: 24, fontWeight: "bold", color: "#1c1917" }),
            text("tpl-title", "Associate Research Scientist — Computational Biology", {
              fontSize: 13,
              fontWeight: "medium",
              color: "#57534e",
            }),
          ],
          "tpl-contact-right",
          [
            text("tpl-contact", "priya.sharma@university.edu", { fontSize: 12, color: "#78716c" }),
            text("tpl-orcid", "ORCID: 0000-0002-1234-5678", { fontSize: 12, color: "#78716c" }),
            locationField("tpl-location", "Cambridge, MA"),
          ],
          55,
          45,
        ),
      },
      {
        id: "tpl-section-interests",
        headerTitle: "Research Interests",
        headerColor: "#44403c",
        weight: 1.1,
        blocks: singleBlock("tpl-interests-block", [
          list("tpl-interests", [
            "Machine learning for multi-omics and clinical phenotype integration",
            "Single-cell and spatial transcriptomics pipeline optimization",
            "Causal inference approaches for biomarker discovery in neurodegenerative disease cohorts",
            "Reproducible computational workflows and open-science tooling",
          ]),
        ]),
      },
      {
        id: "tpl-section-education",
        headerTitle: "Education",
        headerColor: "#44403c",
        weight: 1,
        blocks: degreeAndDate("tpl-phd", "Ph.D. Bioinformatics — MIT", "2019-05-01", {
          note: "Dissertation: Deep representation learning for heterogeneous genomic data",
        }),
      },
      {
        id: "tpl-section-education-ms",
        headerTitle: null,
        weight: 0.7,
        blocks: degreeAndDate("tpl-ms", "M.S. Computer Science — IIT Delhi", "2014-05-01"),
      },
    ],
    [
      {
        id: "tpl-section-publications",
        headerTitle: "Selected Publications",
        headerColor: "#44403c",
        weight: 1.8,
        blocks: singleBlock("tpl-pub-block", [
          text("tpl-pub-1", "Sharma P., Ruiz M., et al. (2024). Deep learning models for spatial transcriptomics.", {
            fontSize: 13,
            fontWeight: "medium",
          }),
          text("tpl-pub-1-journal", "Nature Methods, 21(3), 412–425.", {
            fontSize: 12,
            color: "#78716c",
            fontStyle: { italic: true },
          }),
          text("tpl-pub-2", "Sharma P., Chen L. (2022). A pipeline for scalable single-cell analysis.", {
            fontSize: 13,
            fontWeight: "medium",
          }),
          text("tpl-pub-2-journal", "Bioinformatics, 38(8), 2201–2208.", {
            fontSize: 12,
            color: "#78716c",
            fontStyle: { italic: true },
          }),
          text("tpl-pub-3", "Sharma P., Nwosu T., et al. (2021). Transfer learning across rare-disease transcriptomic datasets.", {
            fontSize: 13,
            fontWeight: "medium",
          }),
          text("tpl-pub-3-journal", "Genome Biology, 22(1), 301.", {
            fontSize: 12,
            color: "#78716c",
            fontStyle: { italic: true },
          }),
        ]),
      },
      {
        id: "tpl-section-grants",
        headerTitle: "Grants & Awards",
        headerColor: "#44403c",
        weight: 0.9,
        blocks: singleBlock("tpl-grants-block", [
          list("tpl-grants", [
            "NIH R01 Grant ($2.1M) — Principal Investigator (2023–2028)",
            "Best Paper Award, RECOMB 2023",
            "Graduate Research Fellowship, NSF (2015–2019)",
            "Chan Zuckerberg Initiative EOSS Grant — Co-PI (2022)",
          ]),
        ]),
      },
    ],
  ]),
};

export default academicResearcherTemplate;
