import { CVElementType, useCV } from "@/lib/useCV";
import { Calendar, Image, List, MapPin, SquareUser, Text } from "lucide-react";
import React from "react";
import OptionsPanel from "./options-panel";

interface AccessoryType {
  id: string;
  label: string;
  type: CVElementType;
  defaultContent: string;
  defaultProperties: Record<string, any>;
  icon: React.ReactNode;
}

const AccessoriesPallet = () => {
  const {   selectedBlockId,
    selectedElement,
    addContent,
    updateElement, } = useCV();

  const accessories: AccessoryType[] = [
    {
      id: "text",
      label: "Text",
      type: "text",
      defaultContent: "Text",
      defaultProperties: { fontSize: 14, fontWeight: "400" },
      icon: <Text className="w-6 h-6" />,
    },
    {
      id: "list",
      label: "List",
      type: "element",
      defaultContent: "• Item 1\n• Item 2\n• Item 3",
      defaultProperties: { fontSize: 14, fontWeight: "normal" },
      icon: <List className="w-6 h-6" />,
    },
    {
      id: "date",
      label: "Date",
      type: "element",
      defaultContent: "Jan 2020 - Present",
      defaultProperties: { fontSize: 12, fontWeight: "500", fontStyle: "italic" },
      icon: <Calendar className="w-6 h-6" />,
    },
    {
      id: "location",
      label: "Location",
      type: "element",
      defaultContent: "Kolkata, India",
      defaultProperties: { fontSize: 10, fontWeight: "500", fontStyle: "italic" },
      icon: <MapPin className="w-6 h-6" />,
    },
    {
      id: "image",
      label: "Profile Image",
      type: "element",
      defaultContent: "",
      defaultProperties: {},
      icon: <Image className="w-6 h-6" />,
    },
    {
      id: "icon",
      label: "Icon",
      type: "element",
      defaultContent: "",
      defaultProperties: {},
      icon: <SquareUser className="w-6 h-6" />,
    },
  ];

  const addAccessory = (accessory: AccessoryType) => {
    if (!selectedBlockId) return;

    addContent(selectedBlockId, {
      id: crypto.randomUUID(),
      type: accessory.type,
      content: accessory.defaultContent,
      properties: accessory.defaultProperties,
      editable: true,
    });
  };

  return (
     <div className="space-y-4">
      {/* ACCESSORIES */}
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

      {/* OPTIONS */}
      <OptionsPanel
        element={selectedElement}
        onChange={(props) =>
          selectedElement &&
          updateElement(selectedElement.id, {
            properties: {
              ...selectedElement.properties,
              ...props,
            },
          })
        }
      />
      </div>
  );
};

export default AccessoriesPallet;
