export type TutorialStep = {
  id: string;
  route: string;
  target?: string;
  title: string;
  description: string;
  placement?: "top" | "bottom" | "left" | "right" | "center";
  requiredPermission?: string;
};

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: "menu",
    route: "/dashboard",
    target: "app-menu",
    title: "Navigate the app",
    description:
      "Use the sidebar menu to move between pages — Activities, Notes, Tags, Summarize, CV Builder, Cover Letter, and more. Click any item to open that section.",
    placement: "right",
  },
  {
    id: "summarize-input",
    route: "/summarize",
    target: "summarize-composer",
    title: "Add a job description",
    description:
      "Paste a job description or attach a document (PDF, Word, Excel, and more). Pick an AI model and send your message to generate a tailored summary.",
    placement: "top",
    requiredPermission: "/summarize",
  },
  {
    id: "summarize-history",
    route: "/summarize",
    target: "summarize-history",
    title: "Review past summaries",
    description:
      "Every summarize conversation is saved in chat history. Open a previous session anytime to continue the conversation or reuse an earlier job summary.",
    placement: "left",
    requiredPermission: "/summarize",
  },
  {
    id: "summarize-generate",
    route: "/summarize",
    title: "Generate a CV or cover letter",
    description:
      "After your job summary is ready, use Create CV or Create Cover Letter to open the builder with your summary pre-loaded — ready to edit and export.",
    placement: "center",
    requiredPermission: "/summarize",
  },
  {
    id: "cv-pallet",
    route: "/cv-builder/create",
    target: "cv-editor-pallet",
    title: "Customize your CV",
    description:
      "Use the side toolbar to adjust page layout, typography, sections, and attach notes. Expand or collapse panels to focus on what you need.",
    placement: "right",
    requiredPermission: "/cv-builder",
  },
  {
    id: "cv-preview-download",
    route: "/cv-builder/create",
    target: "builder-preview-download",
    title: "Preview and download",
    description: "Preview your CV on the canvas, then download it as a PDF when you are satisfied with the result.",
    placement: "left",
    requiredPermission: "/cv-builder",
  },
  {
    id: "cv-toolbar",
    route: "/cv-builder/create",
    target: "cv-toolbar",
    title: "Templates and saving",
    description:
      "Browse templates, run an ATS check against the job description, and save or update your CV from the top toolbar.",
    placement: "bottom",
    requiredPermission: "/cv-builder",
  },
  {
    id: "cover-letter-pallet",
    route: "/cover-letter/create",
    target: "cover-letter-pallet",
    title: "Edit your cover letter",
    description:
      "The side toolbar lets you adjust tone, layout, and content blocks. Regenerate sections with AI or fine-tune text manually.",
    placement: "right",
    requiredPermission: "/cover-letter",
  },
  {
    id: "cover-letter-preview",
    route: "/cover-letter/create",
    target: "builder-preview-download",
    title: "Preview and download",
    description:
      "Use the preview and download buttons on the canvas — the same controls as the CV builder — to review and export your cover letter.",
    placement: "left",
    requiredPermission: "/cover-letter",
  },
  {
    id: "notes",
    route: "/notes",
    target: "notes-toolbar",
    title: "Reusable notes",
    description:
      "Create notes for skills, experience, projects, and more. Attach them inside the CV and Cover Letter builders, or apply existing templates from your library.",
    placement: "bottom",
    requiredPermission: "/notes",
  },
  {
    id: "tags",
    route: "/tags",
    target: "tags-grid",
    title: "Organize with tags",
    description:
      "Tags help categorize notes, CVs, cover letters, and activity records. Create color-coded tags to filter and group your content across the app.",
    placement: "bottom",
    requiredPermission: "/tags",
  },
  {
    id: "activity",
    route: "/activities",
    target: "activity-workspace",
    title: "Reminders and events",
    description:
      "Track deadlines, interviews, and follow-ups on the calendar. Click a date to add an event or reminder, and check the upcoming list for what is next.",
    placement: "top",
    requiredPermission: "/activities",
  },
  {
    id: "complete",
    route: "/dashboard",
    title: "You are all set!",
    description: "Hope you enjoy the application! You can revisit any section from the menu whenever you need.",
    placement: "center",
  },
];

export function getTutorialStepsForPermissions(permissions: string[]): TutorialStep[] {
  const allowed = new Set(permissions);
  return TUTORIAL_STEPS.filter((step) => !step.requiredPermission || allowed.has(step.requiredPermission));
}
