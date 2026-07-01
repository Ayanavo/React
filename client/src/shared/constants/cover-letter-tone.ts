export const COVER_LETTER_TONES = [
  {
    id: "professional",
    label: "Professional",
    description: "Balanced, polished, and suitable for most roles",
  },
  {
    id: "formal",
    label: "Formal",
    description: "Traditional and respectful language",
  },
  {
    id: "friendly",
    label: "Friendly",
    description: "Warm and approachable while staying professional",
  },
  {
    id: "enthusiastic",
    label: "Enthusiastic",
    description: "Energetic and motivated about the opportunity",
  },
  {
    id: "confident",
    label: "Confident",
    description: "Direct and assertive about your fit for the role",
  },
  {
    id: "concise",
    label: "Concise",
    description: "Brief and to the point with minimal filler",
  },
] as const;

export type CoverLetterTone = (typeof COVER_LETTER_TONES)[number]["id"];

export const DEFAULT_COVER_LETTER_TONE: CoverLetterTone = "professional";

export const isCoverLetterTone = (value: string): value is CoverLetterTone =>
  COVER_LETTER_TONES.some((tone) => tone.id === value);
