import React, { createContext, useContext, useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */
export type PageProperties = {
  backgroundColor?: string;
  color?: string;
};

export type CVElementType = "section" | "block" | "text" | "list" | "element";
export type fontWeight = "light" | "normal" | "medium" | "semi-bold" | "bold";

export interface CVElement {
  id: string;
  type: CVElementType;
  content?: string | string[] | string[][];
  properties?: {
    fontSize?: number;
    fontWeight?: fontWeight;
    fontStyle?: {
      strikethrough?: boolean;
      italic?: boolean;
      underline?: boolean;
    };
    textAlign?: "start" | "center" | "end";
    color?: string;
    listStyle?: {
      icon?: string;
      iconColor?: string;
    };
  };
  editable?: boolean;
  children?: CVElement[];
}

/* ---------------- CONTEXT ---------------- */

interface CVContextType {
  elements: CVElement[];
  selectedElement: CVElement | null;
  selectedElementId: string | null;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectSection: (sectionId: string) => void;
  selectBlock: (sectionId: string, blockId: string) => void;
  selectElement: (elementId: string) => void;
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
  commitEdits: () => void;
  pageProperties: PageProperties;
  updatePageProperties: (props: Partial<PageProperties>) => void;
  MAX_SECTIONS: number;
  MAX_BLOCKS_PER_SECTION: number;
}

const CVContext = createContext<CVContextType | undefined>(undefined);
const STORAGE_KEY = "cv-editor-session";

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

const findElementById = (nodes: CVElement[], id: string | null): CVElement | null => {
  if (!id) return null;

  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findElementById(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

/* ---------------- PROVIDER ---------------- */

export function CVProvider({ children }: { children: React.ReactNode }) {
  const getInitialElements = (): CVElement[] => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore corrupt storage
    }

    // default structure
    return [
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
                type: "text",
                content: "Header",
                properties: { fontSize: 28, fontWeight: "medium" },
              },
            ],
          },
        ],
      },
    ];
  };

  const [elements, setElements] = useState<CVElement[]>(getInitialElements);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showSectionDividers, setShowSectionDividers] = useState(false);
  const [pageProperties, setPageProperties] = useState<PageProperties>(() => {
  try {
    const saved = sessionStorage.getItem("cv-page-properties");
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
});


  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(elements));
    } catch {
      // ignore quota / serialization errors
    }
  }, [elements]);

  useEffect(() => {
  sessionStorage.setItem("cv-page-properties", JSON.stringify(pageProperties));
}, [pageProperties]);



  /* -------- SELECTION -------- */

  const selectSection = (sectionId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  const selectBlock = (sectionId: string, blockId: string) => {
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
    setSelectedElementId(null);
  };

  const selectElement = (elementId: string) => {
    setSelectedElementId(elementId);
  };

  /* -------- DERIVED -------- */

  const selectedElement = findElementById(elements, selectedElementId);

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

    setElements((prev) =>
      updateTree(prev, sectionId, (section) => {
        if (section.type !== "section") return section;

        const blocks = section.children ?? [];
        if (blocks.length >= MAX_BLOCKS_PER_SECTION) return section;

        return {
          ...section,
          children: [...blocks, { id: blockId, type: "block", children: [] }],
        };
      })
    );

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
    setElements((prev) =>
      updateTree(prev, id, (el) => ({
        ...el,
        ...updates,
        properties: {
          ...el.properties,
          ...updates.properties,
          fontStyle: {
            ...el.properties?.fontStyle,
            ...updates.properties?.fontStyle,
          },
        },
      }))
    );
  };

  const removeElement = (id: string) => {
    setElements((prev) => removeFromTree(prev, id));
  };

  const toggleSectionDividers = () => {
    setShowSectionDividers((prev) => !prev);
  };

  const commitEdits = () => {
    // force blur of active element
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  };

  const updatePageProperties = (props: Partial<PageProperties>) => {
  setPageProperties((prev) => ({
    ...prev,
    ...props,
  }));
};



  const clearSelection = () => {
    setSelectedSectionId(null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  return (
    <CVContext.Provider
      value={{
        elements,

        selectedSectionId,
        selectedBlockId,
        selectedElementId,
        selectedElement,

        selectSection,
        selectBlock,
        selectElement,

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

        commitEdits,

        pageProperties,
        updatePageProperties,

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
