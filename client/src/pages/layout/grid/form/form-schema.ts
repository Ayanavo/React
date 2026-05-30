export type FormFieldSchema = {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  validation: { required?: boolean };
  default?: string;
};

export type FormTabSchema = {
  tabLabel: string;
  tabId: string;
  sections: {
    sectionLabel: string;
    colType?: number;
    blocks: { fields: FormFieldSchema[] }[];
  }[];
};
