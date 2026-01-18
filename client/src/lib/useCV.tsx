import React, { createContext, useContext, useState } from "react";

/* ---------------- TYPES ---------------- */

export type CVElementType = "section" | "block" | "element";

export interface CVElement {
  id: string;
  type: CVElementType;
  content?: string;
  properties?: {
    fontSize?: number;
    fontWeight?: "normal" | "bold" | "600" | "700";
    fontStyle?: "normal" | "italic";
  };
  editable?: boolean;
  children?: CVElement[];
}

/* ---------------- CONTEXT ---------------- */

interface CVContextType {
  elements: CVElement[];
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectSection: (sectionId: string) => void;
  selectBlock: (sectionId: string, blockId: string) => void;
  addSection: () => void;
  removeSection: (sectionId: string) => void;
  addBlock: (sectionId: string) => void;
  removeBlock: (blockId: string) => void;
  addContent: (blockId: string, element: CVElement) => void;
  updateElement: (id: string, updates: Partial<CVElement>) => void;
  removeElement: (id: string) => void;
  showSectionDividers: boolean;
  toggleSectionDividers: () => void;
  clearSelection: () => void;
  MAX_SECTIONS: number;
  MAX_BLOCKS_PER_SECTION: number;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

/* ---------------- CONSTANTS ---------------- */

const MAX_SECTIONS = 10;
const MAX_BLOCKS_PER_SECTION = 5;

/* ---------------- HELPERS ---------------- */

const updateTree = (nodes: CVElement[], id: string, updater: (node: CVElement) => CVElement): CVElement[] =>
  nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (!node.children) return node;
    return { ...node, children: updateTree(node.children, id, updater) };
  });

const removeFromTree = (nodes: CVElement[], id: string): CVElement[] =>
  nodes.filter((n) => n.id !== id).map((n) => (n.children ? { ...n, children: removeFromTree(n.children, id) } : n));

/* ---------------- PROVIDER ---------------- */

export function CVProvider({ children }: { children: React.ReactNode }) {
  const [elements, setElements] = useState<CVElement[]>([
    {
      id: crypto.randomUUID(),
      type: "section",
      children: [
        {
          id: crypto.randomUUID(),
          type: "block",
          children: [
            {
              id: crypto.randomUUID(),
              type: "element",
              content: "Header",
              properties: { fontSize: 28, fontWeight: "700" },
            },
          ],
        },
      ],
    },
  ]);

  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [showSectionDividers, setShowSectionDividers] = useState(false);

  /* -------- SELECTION -------- */

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(null);
  };

  const selectBlock = (sectionId: string, blockId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
  };

  /* -------- ACTIONS -------- */

  const addSection = () => {
    const sectionId = crypto.randomUUID();
    const blockId = crypto.randomUUID();

    setElements((prev) => {
      const sectionCount = prev.filter((el) => el.type === "section").length;
      if (sectionCount >= MAX_SECTIONS) {
        return prev;
      }
      return [
        ...prev,
        {
          id: sectionId,
          type: "section",
          children: [{ id: blockId, type: "block", children: [] }],
        },
      ];
    });

    selectSection(sectionId);
  };

  const removeSection = (sectionId: string) => {
    setElements((prev) => prev.filter((s) => s.id !== sectionId));

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
      setSelectedBlockId(null);
    }
  };

  const addBlock = (sectionId: string) => {
    const blockId = crypto.randomUUID();

    setElements((prev) => {
      prev.map((el) => {
        if (el.id !== sectionId || el.type !== "section") return el;
        const blocks = el.children ?? [];
        if (blocks.length >= MAX_BLOCKS_PER_SECTION) {
          return el; // hard stop
        }
      });
      return updateTree(prev, sectionId, (section) => ({
        ...section,
        children: [...(section.children || []), { id: blockId, type: "block", children: [] }],
      }));
    });

    selectBlock(sectionId, blockId);
  };

  const removeBlock = (blockId: string) => {
    let parentSectionId: string | null = null;
    let canDelete = false;

    elements.forEach((section) => {
      if (section.type !== "section") return;
      const blocks = section.children || [];
      if (blocks.some((b) => b.id === blockId)) {
        parentSectionId = section.id;
        canDelete = blocks.length > 1;
      }
    });

    if (!canDelete) return;

    setElements((prev) => removeFromTree(prev, blockId));

    if (selectedBlockId === blockId) {
      setSelectedBlockId(null);
      setSelectedSectionId(parentSectionId);
    }
  };

  const addContent = (blockId: string, element: CVElement) => {
    setElements((prev) =>
      prev.map((section) => {
        if (section.type !== "section") return section;

        return {
          ...section,
          children: section.children?.map((block) => {
            if (block.id !== blockId) return block;

            return {
              ...block,
              children: [...(block.children ?? []), element],
            };
          }),
        };
      })
    );
  };

  const updateElement = (id: string, updates: Partial<CVElement>) => {
    setElements((prev) => updateTree(prev, id, (el) => ({ ...el, ...updates })));
  };

  const removeElement = (id: string) => {
    setElements((prev) => removeFromTree(prev, id));
  };

  const toggleSectionDividers = () => {
    setShowSectionDividers((prev) => !prev);
  };

  const clearSelection = () => {
    setSelectedSectionId(null);
    setSelectedBlockId(null);
  };

  return (
    <CVContext.Provider
      value={{
        elements,
        selectedSectionId,
        selectedBlockId,
        selectSection,
        selectBlock,
        addSection,
        removeSection,
        addBlock,
        removeBlock,
        addContent,
        updateElement,
        removeElement,
        showSectionDividers,
        toggleSectionDividers,
        clearSelection,
        MAX_SECTIONS,
        MAX_BLOCKS_PER_SECTION,
      }}>
      {children}
    </CVContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useCV() {
  const ctx = useContext(CVContext);
  if (!ctx) throw new Error("useCV must be used within CVProvider");
  return ctx;
}
