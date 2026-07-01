import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { NumericSliderField } from "@/components/ui/numeric-slider-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CVElement, CVElementType, useCV } from "@/lib/useCV";
import moment from "moment";
import {
  AlignLeft,
  Calendar,
  ChevronDown,
  ChevronsDown,
  ChevronsUp,
  FileText,
  LayoutGrid,
  List,
  ListOrdered,
  Loader2,
  Quote,
  RefreshCw,
  Sparkles,
  Tag,
  Type,
} from "lucide-react";
import React, { useState } from "react";
import ElementSpacingControls from "../cv-builder/element-spacing-controls";
import { isSpacedElementType, TEXT_INDENT_MAX } from "../cv-builder/element-spacing";
import FontWeightControls from "../cv-builder/font-weight-controls";
import SectionDividerControls from "../cv-builder/section-divider-controls";
import TextAlignControls from "../cv-builder/text-align-controls";
import TokenFormatControls from "../cv-builder/token-format-controls";
import PagePallet from "../cv-builder/page-panel";
import { COVER_LETTER_TONES, type CoverLetterTone } from "@/shared/constants/cover-letter-tone";

type CoverLetterPalletProps = {
  tone: CoverLetterTone;
  onToneChange: (tone: CoverLetterTone) => void;
  onRegenerate: () => void;
  isRegenerating: boolean;
  canRegenerate: boolean;
};

type ContentAccessory = {
  id: string;
  label: string;
  type: CVElementType;
  defaultContent: string | string[];
  defaultProperties: Record<string, unknown>;
  icon: React.ComponentType<{ className?: string }>;
};

const CONTENT_ACCESSORIES: ContentAccessory[] = [
  {
    id: "text",
    label: "Text",
    type: "text",
    defaultContent: "",
    defaultProperties: { fontSize: 14, fontWeight: "normal" },
    icon: Type,
  },
  {
    id: "list",
    label: "Bullet List",
    type: "list",
    defaultContent: [""],
    defaultProperties: { fontSize: 14, fontWeight: "normal", listStyle: { icon: "bullet" } },
    icon: List,
  },
  {
    id: "numbered-list",
    label: "Numbered List",
    type: "list",
    defaultContent: [""],
    defaultProperties: { fontSize: 14, fontWeight: "normal", listStyle: { icon: "number" } },
    icon: ListOrdered,
  },
  {
    id: "quote",
    label: "Quote",
    type: "quote",
    defaultContent: "",
    defaultProperties: { fontSize: 14, fontWeight: "normal", fontStyle: { italic: true } },
    icon: Quote,
  },
  {
    id: "date",
    label: "Date",
    type: "date",
    defaultContent: moment().toISOString(),
    defaultProperties: { fontSize: 12, fontWeight: "normal", dateFormat: "DD_MMM_YYYY" },
    icon: Calendar,
  },
  {
    id: "tag",
    label: "Tags",
    type: "token",
    defaultContent: [""],
    defaultProperties: {
      fontSize: 10,
      fontWeight: "normal",
      tokenStyle: {
        backgroundColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        radius: 6,
      },
    },
    icon: Tag,
  },
];

const CoverLetterPallet = ({
  tone,
  onToneChange,
  onRegenerate,
  isRegenerating,
  canRegenerate,
}: CoverLetterPalletProps) => {
  const {
    selectedBlockId,
    addContent,
    selectedElement,
    updateElement,
    addHeader,
    addSection,
    selectedPageId,
    selectedSectionId,
    MAX_SECTIONS,
    elements,
  } = useCV();

  const [expandedSections, setExpandedSections] = useState({
    tone: true,
    page: true,
    layout: true,
    content: true,
    format: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const addAccessory = (accessory: ContentAccessory) => {
    if (!selectedBlockId) return;

    addContent(selectedBlockId, {
      id: crypto.randomUUID(),
      type: accessory.type,
      content: accessory.defaultContent,
      properties: accessory.defaultProperties,
      editable: true,
    } as CVElement);
  };

  const updateSelected = (updates: Partial<CVElement>) => {
    if (!selectedElement) return;
    updateElement(selectedElement.id, updates);
  };

  const sectionCount = () => {
    if (!selectedPageId) return 0;
    const page = elements.find((pageNode) => pageNode.id === selectedPageId);
    return page?.children?.filter((child) => child.type === "section").length ?? 0;
  };

  const sections = [
    {
      key: "tone" as const,
      title: "Tone",
      icon: Sparkles,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cover-letter-tone">Tone</Label>
            <Select value={tone} onValueChange={(value) => onToneChange(value as CoverLetterTone)} disabled={isRegenerating}>
              <SelectTrigger id="cover-letter-tone">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {COVER_LETTER_TONES.map((toneOption) => (
                  <SelectItem key={toneOption.id} value={toneOption.id}>
                    {toneOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {COVER_LETTER_TONES.find((toneOption) => toneOption.id === tone)?.description}
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full justify-center gap-2"
            onClick={onRegenerate}
            disabled={!canRegenerate || isRegenerating}>
            {isRegenerating ?
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Regenerating...
              </>
            : <>
                <RefreshCw className="h-4 w-4" />
                Regenerate letter
              </>
            }
          </Button>

          {!canRegenerate && (
            <p className="text-xs text-muted-foreground">
              Add a job summary when saving, or open a letter created from Summarize, to regenerate content.
            </p>
          )}
        </div>
      ),
    },
    { key: "page" as const, title: "Page", icon: FileText, content: <PagePallet /> },
    {
      key: "layout" as const,
      title: "Layout",
      icon: LayoutGrid,
      content: (
        <div className="space-y-4">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between"
            disabled={!selectedPageId || sectionCount() >= MAX_SECTIONS}
            onClick={() => selectedPageId && addSection(selectedPageId)}>
            <span>Add section</span>
            <span className="text-xs text-muted-foreground">
              {sectionCount()}/{MAX_SECTIONS}
            </span>
          </Button>
          <SectionDividerControls />
          <p className="text-xs text-muted-foreground">
            Add multiple sections to separate parts of your letter. Enable dividers to show lines between sections.
          </p>
        </div>
      ),
    },
    {
      key: "content" as const,
      title: "Content",
      icon: Type,
      content: (
        <div className="space-y-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start"
            disabled={!selectedPageId || !selectedSectionId}
            onClick={() => selectedPageId && selectedSectionId && addHeader(selectedPageId, selectedSectionId)}>
            Add Cover Header
          </Button>
          <div className="grid grid-cols-2 gap-2">
            {CONTENT_ACCESSORIES.map((accessory) => {
              const Icon = accessory.icon;
              return (
                <Button
                  key={accessory.id}
                  type="button"
                  variant="outline"
                  className="h-auto flex-col gap-1 py-3"
                  disabled={!selectedBlockId}
                  onClick={() => addAccessory(accessory)}>
                  <Icon className="h-4 w-4" />
                  <span className="text-xs">{accessory.label}</span>
                </Button>
              );
            })}
          </div>
          {!selectedBlockId && (
            <p className="text-xs text-muted-foreground">Select a content block on the canvas to add elements.</p>
          )}
        </div>
      ),
    },
    {
      key: "format" as const,
      title: "Format",
      icon: AlignLeft,
      content: (
        <div className="space-y-4">
          {!selectedElement ?
            <p className="text-xs text-muted-foreground">Select an element on the canvas to format it.</p>
          : <>
              {["text", "list", "quote", "date", "token"].includes(selectedElement.type) && (
                <>
                  <TextAlignControls
                    label="Align"
                    value={selectedElement.properties?.textAlign ?? "start"}
                    onChange={(textAlign) =>
                      updateSelected({
                        properties: {
                          ...selectedElement.properties,
                          textAlign,
                        },
                      })
                    }
                  />

                  <NumericSliderField
                    label="Font size"
                    value={selectedElement.properties?.fontSize ?? (selectedElement.type === "token" ? 10 : 14)}
                    min={8}
                    max={72}
                    step={1}
                    onChange={(size) =>
                      updateSelected({ properties: { ...selectedElement.properties, fontSize: size } })
                    }
                  />

                  <FontWeightControls
                    value={selectedElement.properties?.fontWeight ?? "normal"}
                    onChange={(fontWeightValue) =>
                      updateSelected({
                        properties: { ...selectedElement.properties, fontWeight: fontWeightValue },
                      })
                    }
                  />

                  {["text", "list", "quote", "date"].includes(selectedElement.type) && (
                    <NumericSliderField
                      label="Tab / indent"
                      value={selectedElement.properties?.textIndent ?? 0}
                      min={0}
                      max={TEXT_INDENT_MAX}
                      step={1}
                      onChange={(indent) =>
                        updateSelected({ properties: { ...selectedElement.properties, textIndent: indent } })
                      }
                    />
                  )}

                  {selectedElement.type === "token" && (
                    <TokenFormatControls
                      properties={selectedElement.properties}
                      onChange={(properties) => updateSelected({ properties })}
                    />
                  )}
                </>
              )}

              {isSpacedElementType(selectedElement.type) && (
                <ElementSpacingControls
                  marginTop={selectedElement.properties?.marginTop}
                  marginBottom={selectedElement.properties?.marginBottom}
                  onChange={(spacing) =>
                    updateSelected({
                      properties: {
                        ...selectedElement.properties,
                        ...spacing,
                      },
                    })
                  }
                />
              )}
            </>
          }
        </div>
      ),
    },
  ];

  const isAnyExpanded = Object.values(expandedSections).some(Boolean);

  return (
    <div className="cover-letter-pallet w-full md:w-[20rem] h-full bg-background border-r shadow-sm flex-shrink-0 overflow-hidden flex flex-col">
      <div className="flex w-full items-center gap-3 border-b bg-card px-4 py-3">
        <span className="min-w-0 flex-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Cover Letter
        </span>
        <button
          type="button"
          onClick={() => {
            const next = !isAnyExpanded;
            setExpandedSections({ tone: next, page: next, layout: next, content: next, format: next });
          }}
          className="ml-auto shrink-0 text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
          {isAnyExpanded ?
            <>
              <ChevronsUp className="w-3.5 h-3.5" /> Collapse
            </>
          : <>
              <ChevronsDown className="w-3.5 h-3.5" /> Expand
            </>
          }
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.key];

          return (
            <div key={section.key} className="border rounded-xl overflow-hidden bg-card">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">{section.title}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              {isExpanded && <div className="px-4 pb-4">{section.content}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CoverLetterPallet;
