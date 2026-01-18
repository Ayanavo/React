import { useCV } from "@/lib/useCV";
import { Heading1, Heading2, List, Calendar, Bold, Italic, Text } from "lucide-react";
import React from "react";

interface AccessoryType {
  id: string;
  label: string;
  type: "header" | "subheader" | "list" | "date" | "text";
  defaultContent: string;
  defaultProperties: any;
  icon: React.ReactNode;
}

const AccessoriesPallet = () => {
  //   const { addElement } = useCV();
  const accessories: AccessoryType[] = [
    {
      id: "header",
      label: "Header",
      type: "header",
      defaultContent: "Header Text",
      defaultProperties: { fontSize: 14, fontWeight: "700" },
      icon: <Heading1 className="w-6 h-6" />,
    },
    {
      id: "subheader",
      label: "Subheader",
      type: "subheader",
      defaultContent: "Subheader Text",
      defaultProperties: { fontSize: 14, fontWeight: "600" },
      icon: <Heading2 className="w-6 h-6" />,
    },
    {
      id: "list",
      label: "List",
      type: "list",
      defaultContent: "• Item 1\n• Item 2\n• Item 3",
      defaultProperties: { fontSize: 14, fontWeight: "normal" },
      icon: <List className="w-6 h-6" />,
    },
    {
      id: "date",
      label: "Date",
      type: "date",
      defaultContent: "Jan 2020 - Present",
      defaultProperties: { fontSize: 12, fontWeight: "500", fontStyle: "italic" },
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "font-weight",
      label: "Text",
      type: "text",
      defaultContent: "Text",
      defaultProperties: { fontSize: 14, fontWeight: "700" },
      icon: <Text className="w-6 h-6" />,
    },
  ];

  const addAccessory = (accessory: AccessoryType) => {
    const newElement = {
      id: Math.random().toString(),
      type: accessory.type,
      content: accessory.defaultContent,
      properties: accessory.defaultProperties,
    };
    // addElement(newElement);
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {accessories.map((accessory) => (
        <button
          key={accessory.id}
          onClick={() => addAccessory(accessory)}
          className="aspect-square flex flex-col items-center justify-center gap-2 rounded-lg bg-background border border-border hover:border-primary/50 hover:bg-muted transition-all hover:shadow-md  group"
          title={`Add ${accessory.label}`}>
          <div className="text-muted-foreground group-hover:text-primary transition-colors">{accessory.icon}</div>
          <span className="text-xs font-medium text-foreground text-center leading-tight">{accessory.label}</span>
        </button>
      ))}
    </div>
  );
};

export default AccessoriesPallet;
