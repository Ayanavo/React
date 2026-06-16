export type CVTemplateElement = {
  id: string;
  type: string;
  height?: number;
  width?: number;
  content?: string | string[];
  properties?: Record<string, unknown>;
  editable?: boolean;
  children?: CVTemplateElement[];
};

export type CVTemplatePageProperties = {
  backgroundColor?: string;
  color?: string;
  dividerColor?: string;
  dividerStyle?: "solid" | "dashed" | "dotted";
};

export type CVTemplateRecord = {
  id: string;
  name: string;
  description: string;
  category?: string;
  elements: CVTemplateElement[];
  pageProperties: CVTemplatePageProperties;
};
