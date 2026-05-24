import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

/* ---------------- TYPES ---------------- */
export type PaginationLocation = "top-left" | "top" | "top-right" | "bottom-left" | "bottom" | "bottom-right";

export type PageProperties = {
  backgroundColor?: string;
  color?: string;
};

export type CVElementType = "page" | "section" | "block" | "text" | "list" | "date" | "token" | "image" | "icon" | "header" | "location";
export type fontWeight = "light" | "normal" | "medium" | "semi-bold" | "bold";
export type DateFormat = "DD_MM_YYYY" | "DD_MMM_YYYY" | "DD_MMMM_YYYY" | "MMM_YYYY" | "MMMM_YYYY" | "YYYY";

export interface CVElement {
  id: string;
  type: CVElementType;
  height?: number;
  content?: string | string[];
  properties?: {
    imageSrc?: string;
    dateFormat?: DateFormat;
    includeTime?: boolean;
    timeFormat?: "24" | "12-lower" | "12-upper";

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
      iconFill?: "fill" | "unfill";
      direction?: "row" | "column";
    };
    showIcon?: boolean;
    iconFill?: "fill" | "unfill";
    tokenStyle?: {
      backgroundColor?: string;
      borderColor?: string;
      radius?: number;
    };
    tokenInterlink?: {
      enabled?: boolean;
      icon?: "dot" | "slash" | "pipe" | "arrow" | "plus";
    };
    headerStyle?: {
      content?: string;
      color?: string;
      fontSize?: number;
      backgroundColor?: string;
      textAlign?: "start" | "center" | "end";
      underline?: {
        enabled?: boolean;
        width?: "fullWidth" | "fitWidth";
        gap?: number;
      };
    };
    imageStyle?: {
      radius?: number;
      imageScale?: number; // default = 1
    };
    imageMeta?: {
      naturalWidth?: number;
      naturalHeight?: number;
    };
    imageBorder?: {
      enabled?: boolean;
      borderColor?: string;
      borderWidth?: number;
      padding?: number;
    };
    icon?: string;
  };

  editable?: boolean;
  children?: CVElement[];
}

/* ---------------- CONTEXT ---------------- */

interface CVContextType {
  elements: CVElement[];
  selectedPageId: string | null;
  selectedElement: CVElement | null;
  selectedElementId: string | null;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedHeaderId: string | null;
  selectPage: (pageId: string) => void;
  selectSection: (pageId: string, sectionId: string) => void;
  selectBlock: (pageId: string, sectionId: string, blockId: string) => void;
  selectElement: (elementId: string) => void;
  selectHeader: (pageId: string, sectionId: string, headerId: string) => void;
  addSection: (pageId: string) => void;
  removeSection: (sectionId?: string) => void;
  addBlock: (pageId: string, sectionId: string) => void;
  removeBlock: (blockId?: string) => void;
  addContent: (blockId: string, element: CVElement) => void;
  updateElement: (id: string, updates: Partial<CVElement>) => void;
  removeElement: (id: string) => void;
  addHeader: (pageId: string, sectionId: string) => void;
  updateHeader: (id: string, updates: Partial<CVElement>) => void;
  removeHeader: (headerId?: string) => void;
  showSectionDividers: boolean;
  toggleSectionDividers: () => void;
  clearSelection: () => void;
  commitEdits: () => void;
  pageProperties: PageProperties;
  updatePageProperties: (props: Partial<PageProperties>) => void;
  loadCVState: (elements: CVElement[], pageProperties?: PageProperties) => void;
  showPagination: boolean;
  togglePagination: () => void;
  paginationLocation: PaginationLocation;
  setPaginationLocation: (location: PaginationLocation) => void;
  addPage: (value: number) => void;
  removePage: (pageId?: string) => void;
  showSideBar: boolean;
  toggleSideBar: () => void;
  MAX_PAGES: number;
  MAX_SECTIONS: number;
  MAX_BLOCKS_PER_SECTION: number;
  A4_WIDTH: number;
  A4_HEIGHT: number;
}

const CVContext = createContext<CVContextType | undefined>(undefined);
const STORAGE_KEY = "cv-editor-session";

/* ---------------- CONSTANTS ---------------- */

const MAX_PAGES = 20;
const MAX_SECTIONS = 10;
const MAX_BLOCKS_PER_SECTION = 5;
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const DEFAULT_ELEMENT_CONFIG = [
  {
    id: crypto.randomUUID() as string,
    type: "page",
    children: [
      {
        id: crypto.randomUUID() as string,
        type: "section",
        height: A4_HEIGHT * 1,
        children: [
          {
            id: crypto.randomUUID() as string,
            type: "block",
            children: [
              // {
              //   id: crypto.randomUUID() as string,
              //   type: "text",
              //   content: "Header",
              //   properties: { fontSize: 28, fontWeight: "medium" as fontWeight, textAlign: "center", color: "#c5c5c5" },
              // },
            ],
          },
        ],
      },
    ],
  },
] as const satisfies CVElement[];

/* ---------------- HELPERS ---------------- */

const updateTree = (nodes: CVElement[], id: string, updater: (node: CVElement) => CVElement): CVElement[] =>
  nodes.map((node) => {
    if (node.id === id) return updater(node);
    if (!node.children) return node;
    return { ...node, children: updateTree(node.children, id, updater) };
  });

const removeFromTree = (nodes: CVElement[], id: string): CVElement[] => nodes.filter((n) => n.id !== id).map((n) => (n.children ? { ...n, children: removeFromTree(n.children, id) } : n));

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
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }

    return DEFAULT_ELEMENT_CONFIG;
  };

  const [elements, setElements] = useState<CVElement[]>(getInitialElements);
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedHeaderId, setSelectedHeaderId] = useState<string | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [showSectionDividers, setShowSectionDividers] = useState(false);
  const [showPagination, setShowPagination] = useState(false);
  const [paginationLocation, setPaginationLocation] = useState<PaginationLocation>("bottom-right");
  const [showSideBar, setShowSideBar] = useState(false);
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

  useEffect(() => {
    console.log(selectedHeaderId, selectedBlockId, selectedSectionId);
  });

  /* -------- SELECTION -------- */

  const selectPage = (pageId: string) => {
    setSelectedPageId(pageId);
    setSelectedSectionId(null);
    setSelectedHeaderId(null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  const selectSection = (pageId: string, sectionId: string) => {
    setSelectedPageId(pageId);
    setSelectedSectionId(sectionId);
    setSelectedHeaderId(null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  const selectBlock = (pageId: string, sectionId: string, blockId: string) => {
    setSelectedPageId(pageId);
    setSelectedSectionId(sectionId);
    setSelectedBlockId(blockId);
    setSelectedHeaderId(null);
    setSelectedElementId(null);
  };

  const selectElement = (elementId: string) => {
    setSelectedElementId(elementId);
  };

  const selectHeader = (pageId: string, sectionId: string, headerId: string) => {
    setSelectedPageId(pageId);
    setSelectedSectionId(sectionId);
    setSelectedHeaderId(headerId);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  /* -------- DERIVED -------- */

  const selectedElement = findElementById(elements, selectedElementId);

  /* -------- ACTIONS -------- */

  const addSection = (pageId: string) => {
    const sectionId = crypto.randomUUID();
    const blockId = crypto.randomUUID();

    setElements((prev) => {
      return updateTree(prev, pageId, (page) => {
        if (page.type !== "page") return page;

        const sections = page.children ?? [];

        if (sections.length >= MAX_SECTIONS) {
          return page;
        }

        const updatedSections = sections.map((section) => ({
          ...section,
          height: 100 / (sections.length + 1),
        }));

        return {
          ...page,
          children: [
            ...updatedSections,
            {
              id: sectionId,
              type: "section",
              height: equalHeight,
              children: [
                {
                  id: blockId,
                  type: "block",
                  children: [],
                },
              ],
            },
          ],
        };
      });
    });

    selectSection(pageId, sectionId);
  };

  const removeSection = (sectionId = selectedSectionId ?? undefined) => {
    console.log(sectionId);

    if (!sectionId) return;

    setElements((prev) => removeFromTree(prev, sectionId));
    setSelectedSectionId(null);
    setSelectedBlockId(null);
  };
  const addBlock = (pageId: string, sectionId: string) => {
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

    selectBlock(pageId, sectionId, blockId);
  };

  const removeBlock = (blockId = selectedBlockId ?? undefined) => {
    let parentSectionId: string | null = null;
    let canDelete = false;

    const findParentSection = (nodes: CVElement[]) => {
      for (const node of nodes) {
        if (node.type === "section") {
          const blocks = node.children?.filter((child) => child.type === "block") ?? [];
          if (blocks.some((block) => block.id === blockId)) {
            parentSectionId = node.id;
            canDelete = blocks.length > 1;
            return;
          }
        }
        if (node.children) findParentSection(node.children);
      }
    };

    findParentSection(elements);

    if (!canDelete) return;
    if (!blockId) return;
    setElements((prev) => removeFromTree(prev, blockId));
    setSelectedBlockId(null);
    setSelectedSectionId(parentSectionId);
  };

  const addContent = (blockId: string, element: CVElement) => {
    setElements((prev) =>
      updateTree(prev, blockId, (block) => {
        if (block.type !== "block") return block;

        return {
          ...block,
          children: [...(block.children ?? []), element],
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

  const addHeader = (pageId: string, sectionId: string) => {
    console.log("header added", pageId, sectionId);

    const headerId = crypto.randomUUID();
    setElements((prev) =>
      updateTree(prev, sectionId, (section) => {
        if (section.type !== "section") return section;
        return {
          ...section,
          children: [
            ...(section.children ?? []),
            {
              id: headerId,
              type: "header",
              properties: {
                headerStyle: {
                  content: "",
                  color: "#000000",
                  fontSize: 20,
                  backgroundColor: "#ffffff",
                  textAlign: "start",
                  underline: {
                    enabled: false,
                    width: "fullWidth",
                    gap: 4,
                  },
                },
              },
            },
          ],
        };
      })
    );
    selectHeader(pageId, sectionId, headerId);
  };

  const updateHeader = (id: string, updates: Partial<CVElement>) => {
    setElements((prev) => updateTree(prev, id, (el) => ({ ...el, ...updates })));
  };

  const removeHeader = (headerId = selectedHeaderId ?? undefined) => {
    if (!headerId) return;

    let parentSectionId: string | null = null;

    const findParentSection = (nodes: CVElement[]) => {
      for (const node of nodes) {
        if (node.type === "section" && node.children?.some((child) => child.id === headerId)) {
          parentSectionId = node.id;
          return;
        }
        if (node.children) findParentSection(node.children);
      }
    };

    findParentSection(elements);
    setElements((prev) => removeFromTree(prev, headerId));
    if (selectedHeaderId === headerId) setSelectedHeaderId(null);
    setSelectedSectionId(parentSectionId);
  };

  const toggleSectionDividers = () => {
    setShowSectionDividers((prev) => !prev);
  };

  const togglePagination = () => {
    setShowPagination((prev) => !prev);
  };

  const toggleSideBar = () => {
    setShowSideBar((prev) => !prev);
  };

  const addPage = (pageCount: number) => {
    const pageId = crypto.randomUUID();
    const sectionId = crypto.randomUUID();
    const blockId = crypto.randomUUID();

    setElements((prev) => {
      const newPage: CVElement = {
        id: pageId,
        type: "page",
        children: [
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
        ],
      };
      if (pageCount >= MAX_PAGES) {
        return prev;
      }
      return [...prev, newPage];
    });
  };

  const removePage = (pageId = selectedPageId ?? undefined) => {
    setElements((prev) => {
      const pageToRemoveIndex = prev.findIndex((page) => page.id === pageId);
      if (pageToRemoveIndex === -1) {
        return prev;
      }
      if (prev.length <= 1) return DEFAULT_ELEMENT_CONFIG;
      return prev.filter((_, index) => index !== pageToRemoveIndex);
    });

    if (selectedPageId === pageId) {
      setSelectedPageId(null);
      setSelectedSectionId(null);
      setSelectedBlockId(null);
    }
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

  const loadCVState = useCallback((nextElements: CVElement[], nextPageProperties: PageProperties = {}) => {
    setElements(nextElements);
    setPageProperties(nextPageProperties);
    setSelectedPageId(null);
    setSelectedSectionId(null);
    setSelectedBlockId(null);
    setSelectedHeaderId(null);
    setSelectedElementId(null);
  }, []);

  const clearSelection = () => {
    setSelectedSectionId(null);
    setSelectedBlockId(null);
    setSelectedElementId(null);
  };

  return (
    <CVContext.Provider
      value={{
        elements,

        selectedPageId,
        selectedSectionId,
        selectedBlockId,
        selectedElementId,
        selectedHeaderId,
        selectedElement,

        selectPage,
        selectSection,
        selectBlock,
        selectElement,
        selectHeader,

        addSection,
        removeSection,
        addBlock,
        removeBlock,
        addContent,
        updateElement,
        removeElement,
        addHeader,
        updateHeader,
        removeHeader,

        showSectionDividers,
        toggleSectionDividers,
        clearSelection,

        commitEdits,

        pageProperties,
        updatePageProperties,
        loadCVState,

        addPage,
        removePage,
        showPagination,
        togglePagination,
        paginationLocation,
        setPaginationLocation,

        showSideBar,
        toggleSideBar,
        MAX_PAGES,
        MAX_SECTIONS,
        MAX_BLOCKS_PER_SECTION,
        A4_WIDTH,
        A4_HEIGHT,
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
