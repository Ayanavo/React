import { CVElementType, useCV } from "@/lib/useCV";
import { Calendar, Image, List, MapPin, Tag, Text } from "lucide-react";
import React from "react";
import ElementOptions from "./options-panel";

interface AccessoryType {
  id: string;
  label: string;
  type: CVElementType;
  defaultContent: string | string[];
  defaultProperties: Record<string, any>;
  icon: React.ComponentType<{ className?: string }>;
}

const AccessoriesPallet = () => {
  const { selectedBlockId, addContent } = useCV();

  const accessories: AccessoryType[] = [
    {
      id: "text",
      label: "Texts",
      type: "text",
      defaultContent: "",
      defaultProperties: { fontSize: 14, fontWeight: "normal" },
      icon: Text,
    },
    {
      id: "list",
      label: "List Items",
      type: "list",
      defaultContent: [""],
      defaultProperties: { fontSize: 14, fontWeight: "normal" },
      icon: List,
    },
    {
      id: "date",
      label: "Date / Time",
      type: "date",
      defaultContent: "",
      defaultProperties: { fontSize: 12, fontWeight: "normal", includeTime: false, timeFormat: "24" },
      icon: Calendar,
    },
    {
      id: "location",
      label: "Locations",
      type: "location",
      defaultContent: "",
      defaultProperties: { fontSize: 14, fontWeight: "normal" },
      icon: MapPin,
    },
    {
      id: "image",
      label: "Images",
      type: "image",
      defaultContent: "",
      defaultProperties: {
        fontSize: 10,
        fontWeight: "normal",
        imageStyle: {
          radius: 6,
          imageScale: 1,
        },
        imageBorder: {
          enabled: false,
          borderColor: "#000",
          borderWidth: 1,
          padding: 0,
        },
      },
      icon: Image,
    },
    {
      id: "tag",
      label: "Tags",
      type: "token",
      defaultContent: "",
      defaultProperties: {
        fontSize: 10,
        fontWeight: "normal",
        backgroundColor: "#f1f5f9",
        borderColor: "#cbd5e1",
        radius: 6,
      },
      icon: Tag,
    },
  ];

  const addAccessory = (accessory: AccessoryType) => {
    if (!selectedBlockId) return;

    addContent(selectedBlockId, {
      id: crypto.randomUUID(),
      type: accessory.type,
      content: accessory.defaultContent as string | string[],
      properties: accessory.defaultProperties,
      editable: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* ACCESSORIES */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Content Elements</h3>
          {!selectedBlockId && (
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium animate-pulse">
              Select a canvas block first
            </span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2">
          {accessories.map((accessory) => {
            const Icon = accessory.icon;
            const disabled = !selectedBlockId;

            return (
              <button
                key={accessory.id}
                disabled={disabled}
                onClick={() => addAccessory(accessory)}
                title={disabled ? "Select a block on the canvas to add content" : `Add ${accessory.label}`}
                className={`
                  flex items-center gap-2 p-2 rounded-lg border bg-card text-card-foreground text-left
                  hover:border-primary/50 hover:bg-accent/40 transition-all duration-300 group
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:bg-card border-border
                `}>
                <div
                  className={`w-8 h-8 shrink-0 rounded-md flex items-center justify-center transition-all duration-300
                  ${
                    disabled ?
                      "bg-muted text-muted-foreground"
                    : "bg-primary/5 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                  }`}>
                  <Icon className="w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[11px] font-semibold leading-tight text-foreground group-hover:text-primary transition-colors">
                    {accessory.label}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OPTIONS */}
      <div className="border-t border-border pt-4">
        <ElementOptions />
      </div>
    </div>
  );
};

export default AccessoriesPallet;
