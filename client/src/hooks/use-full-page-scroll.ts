import { useEffect } from "react";

/**
 * Auth/marketing pages need document-level scroll, but the app shell locks
 * html/body/#root to overflow:hidden for internal panel scrolling.
 */
export function useFullPageScroll(enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const html = document.documentElement;
    const body = document.body;
    const root = document.getElementById("root");

    const previous = {
      htmlOverflow: html.style.overflow,
      htmlHeight: html.style.height,
      bodyOverflow: body.style.overflow,
      bodyHeight: body.style.height,
      rootOverflow: root?.style.overflow ?? "",
      rootHeight: root?.style.height ?? "",
      rootMinHeight: root?.style.minHeight ?? "",
      htmlHadScrollbarNone: html.classList.contains("scrollbar-none"),
      bodyHadScrollbarNone: body.classList.contains("scrollbar-none"),
    };

    html.style.overflow = "auto";
    html.style.height = "auto";
    body.style.overflow = "auto";
    body.style.height = "auto";
    html.classList.add("scrollbar-none");
    body.classList.add("scrollbar-none");

    if (root) {
      root.style.overflow = "visible";
      root.style.height = "auto";
      root.style.minHeight = "100%";
    }

    return () => {
      html.style.overflow = previous.htmlOverflow;
      html.style.height = previous.htmlHeight;
      body.style.overflow = previous.bodyOverflow;
      body.style.height = previous.bodyHeight;

      if (!previous.htmlHadScrollbarNone) {
        html.classList.remove("scrollbar-none");
      }
      if (!previous.bodyHadScrollbarNone) {
        body.classList.remove("scrollbar-none");
      }

      if (root) {
        root.style.overflow = previous.rootOverflow;
        root.style.height = previous.rootHeight;
        root.style.minHeight = previous.rootMinHeight;
      }
    };
  }, [enabled]);
}
