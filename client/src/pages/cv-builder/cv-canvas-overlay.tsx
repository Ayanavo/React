import React, { createContext, useContext, useLayoutEffect, useState } from "react";

const CvCanvasOverlayContext = createContext<HTMLElement | null>(null);

export function CvCanvasOverlayProvider({ children }: { children: React.ReactNode }) {
  const [overlayEl, setOverlayEl] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const node = document.createElement("div");
    node.setAttribute("data-cv-canvas-overlay", "");
    node.style.cssText = "position:fixed;inset:0;z-index:9998;pointer-events:none;";
    document.body.appendChild(node);
    setOverlayEl(node);

    return () => {
      node.remove();
      setOverlayEl(null);
    };
  }, []);

  return <CvCanvasOverlayContext.Provider value={overlayEl}>{children}</CvCanvasOverlayContext.Provider>;
}

export function useCvCanvasOverlay() {
  return useContext(CvCanvasOverlayContext);
}
