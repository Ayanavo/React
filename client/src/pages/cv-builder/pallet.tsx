import { ChevronDown } from "lucide-react";
import React, { useState } from "react";
import LayoutPallet from "./layout-pallet";
import AccessoriesPallet from "./accessories-pallet";

const Pallet = () => {
  const sidebarConfig = [
    {
      title: "Layout",
      name: "layout",
      component: LayoutPallet,
      area: 20,
    },
    {
      title: "Typography",
      name: "accessories",
      component: AccessoriesPallet,
      area: 80,
    },
  ] as const;

  const [expandedSections, setExpandedSections] = useState({
    layout: true,
    accessories: true,
  });

  const toggleSection = (section: "layout" | "accessories") => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="w-64 h-full bg-background border-r shadow-sm flex-shrink-0 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {sidebarConfig.map((section) => (
            <div key={section.name} className="border border-border rounded-lg overflow-hidden bg-card hover:border-muted-foreground/50 transition-colors">
              <button onClick={() => toggleSection(section.name)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors">
                <h2 className="text-sm font-semibold text-foreground">{section.title}</h2>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expandedSections[section.name] ? "" : "-rotate-90"}`} />
              </button>
              {expandedSections[section.name] && (
                <div className="border-t border-border px-4 py-3 space-y-2 bg-muted/30">
                  <section.component />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Pallet;
