import type { CVElement } from "@/lib/useCV";
import React, { type CSSProperties } from "react";
import { getElementSpacingStyle } from "./element-spacing";

const ElementSpacingWrapper = ({
  element,
  children,
}: {
  element: CVElement;
  children: React.ReactNode;
}) => {
  const style: CSSProperties = getElementSpacingStyle(element.properties);

  if (!style.marginTop && !style.marginBottom) {
    return <>{children}</>;
  }

  return <div style={style}>{children}</div>;
};

export default ElementSpacingWrapper;
