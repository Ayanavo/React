import React, { createContext, useContext, useState } from "react";

/* ---------------- TYPES ---------------- */

export type CVElementType = "section" | "block" | "header" | "subheader" | "text" | "list" | "date";

export interface CVElement {
  id: string;
  type: CVElementType;
  content?: string;
  properties?: {
    fontSize?: number;
    fontWeight?: "normal" | "bold" | "600" | "700";
    fontStyle?: "normal" | "italic";
    marginTop?: number;
    marginBottom?: number;
  };
  children?: CVElement[];
}

/* ---------------- CONTEXT ---------------- */

interface CVContextType {
  elements: CVElement[];

  selectedElementId: string | null;
  selectElement: (id: string | null) => void;
  selectSection: (id: string | null) => void;
  addSection: () => void;
  removeSection: (sectionId: string) => void;
  addBlock: (sectionId: string) => void;
  removeBlock: (sectionId: string) => void;
  addContent: (blockId: string, element: CVElement) => void;

  updateElement: (id: string, updates: Partial<CVElement>) => void;
  removeElement: (id: string) => void;
}

const CVContext = createContext<CVContextType | undefined>(undefined);

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
              type: "header",
              content: "Header",
              properties: { fontSize: 28, fontWeight: "700" },
            },
          ],
        },
      ],
    },
  ]);

  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);

  /* -------- ACTIONS -------- */

  const addSection = () => {
    const sectionId = crypto.randomUUID();
    const blockId = crypto.randomUUID();
    setElements((prev) => [
      ...prev,
      {
        id: sectionId,
        type: "section",
        children: [
          {
            id: blockId,
            type: "block",
            children: [],
          },
        ],
      },
    ]);
  };

  const removeSection = (sectionId: string) => {
    setElements((prev) => removeFromTree(prev, sectionId));
    if (selectedElementId === sectionId) setSelectedElementId(null);
  };

  const addBlock = (sectionId: string) => {
    setElements((prev) =>
      updateTree(prev, sectionId, (section) => ({
        ...section,
        children: [
          ...(section.children || []),
          {
            id: crypto.randomUUID(),
            type: "block",
            children: [],
          },
        ],
      }))
    );
  };

  const removeBlock = (blockId: string) => {
    setElements((prev) =>
      updateTree(prev, blockId, (block) => {
        // find parent section
        let parentSection: CVElement | null = null;

        const findParent = (nodes: CVElement[]) => {
          for (const node of nodes) {
            if (node.children?.some((c) => c.id === blockId)) {
              parentSection = node;
              return;
            }
            if (node.children) findParent(node.children);
          }
        };

        findParent(prev);

        if (!parentSection || (parentSection as CVElement).children!.length <= 1) {
          return block; // 🚫 prevent deleting last block
        }

        return block;
      })
    );

    setElements((prev) => removeFromTree(prev, blockId));
  };

  const addContent = (blockId: string, element: CVElement) => {
    setElements((prev) =>
      updateTree(prev, blockId, (block) => ({
        ...block,
        children: [...(block.children || []), element],
      }))
    );
  };

  const updateElement = (id: string, updates: Partial<CVElement>) => {
    setElements((prev) => updateTree(prev, id, (el) => ({ ...el, ...updates })));
  };

  const removeElement = (id: string) => {
    setElements((prev) => removeFromTree(prev, id));
    if (selectedElementId === id) setSelectedElementId(null);
  };

  return (
    <CVContext.Provider
      value={{
        elements,
        selectedElementId,
        selectElement: setSelectedElementId,
        selectSection: setSelectedSectionId,
        addSection,
        removeSection,
        addBlock,
        removeBlock,
        addContent,
        updateElement,
        removeElement,
      }}>
      {children}
    </CVContext.Provider>
  );
}

/* ---------------- HOOK ---------------- */

export function useCV() {
  const context = useContext(CVContext);
  if (!context) {
    throw new Error("useCV must be used within CVProvider");
  }
  return context;
}
