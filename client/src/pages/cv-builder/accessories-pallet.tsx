import { useCV } from "@/lib/useCV";
import { Calendar, Heading1, Heading2, List, Text } from "lucide-react";
import React from "react";

interface AccessoryType {
  id: string;
  label: string;
  type: "header" | "subheader" | "list" | "date" | "text";
  defaultContent: string;
  defaultProperties: Record<string, any>;
  icon: React.ReactNode;
}

const AccessoriesPallet = () => {
  const { selectedBlockId, addContent } = useCV();

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
      id: "text",
      label: "Text",
      type: "text",
      defaultContent: "Text",
      defaultProperties: { fontSize: 14, fontWeight: "400" },
      icon: <Text className="w-6 h-6" />,
    },
  ];

  const addAccessory = (accessory: AccessoryType) => {
    if (!selectedBlockId) return;

    addContent(selectedBlockId, {
      id: crypto.randomUUID(),
      type: accessory.type,
      content: accessory.defaultContent,
      properties: accessory.defaultProperties,
    });
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      {accessories.map((accessory) => {
        const disabled = !selectedBlockId;

        return (
          <button
            key={accessory.id}
            disabled={disabled}
            onClick={() => addAccessory(accessory)}
            title={disabled ? "Select a block to add content" : `Add ${accessory.label}`}
            className={`
              aspect-square flex flex-col items-center justify-center gap-2
              rounded-lg border transition-all
              ${disabled ? "opacity-40 cursor-not-allowed bg-muted" : "bg-background border-border hover:border-primary/50 hover:bg-muted hover:shadow-md"}
            `}>
            <div className="text-muted-foreground">{accessory.icon}</div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">{accessory.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default AccessoriesPallet;
