import { ChevronDown, FileText, LayoutGrid, Type, Notebook, ChevronsDown, ChevronsUp } from "lucide-react";
import React, { useState } from "react";
import LayoutPallet from "./layout-pallet";
import AccessoriesPallet from "./accessories-pallet";
import PagePallet from "./page-panel";
import NotesPallet from "./notes-pallet";

type PALLET_CONFIG = "layout" | "accessories" | "page" | "notes";

const Pallet = () => {
  const sidebarConfig = [
    {
      title: "Page",
      name: "page",
      component: PagePallet,
      area: 20,
      icon: FileText,
    },
    {
      title: "Layout",
      name: "layout",
      component: LayoutPallet,
      area: 20,
      icon: LayoutGrid,
    },
    {
      title: "Typography",
      name: "accessories",
      component: AccessoriesPallet,
      area: 60,
      icon: Type,
    },
    {
      title: "Notes",
      name: "notes",
      component: NotesPallet,
      area: 40,
      icon: Notebook,
    },
  ] as const;

  const [expandedSections, setExpandedSections] = useState({
    page: true,
    layout: true,
    accessories: true,
    notes: true,
  });

  const toggleSection = (section: PALLET_CONFIG) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const isAnyExpanded = Object.values(expandedSections).some(Boolean);
  const handleToggleAll = () => {
    const nextState = !isAnyExpanded;
    setExpandedSections({
      page: nextState,
      layout: nextState,
      accessories: nextState,
      notes: nextState,
    });
  };

  return (
    <div className="w-96 h-full bg-background border-r shadow-sm flex-shrink-0 overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Editor Panels</span>
        <button onClick={handleToggleAll} className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-primary/10 rounded-lg border border-transparent hover:border-primary/20">
          {isAnyExpanded ?
            <>
              <ChevronsUp className="w-3.5 h-3.5" />
              Collapse All
            </>
          : <> 
          <ChevronsDown className="w-3.5 h-3.5" />
          Expand All
          </>
          }
        </button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
 {sidebarConfig.map((section) => {
            const Icon = section.icon;
            const isExpanded = expandedSections[section.name];

            return (
              <div
                key={section.name}
                className={`border rounded-xl overflow-hidden transition-all duration-300 bg-card
                  ${isExpanded
                    ? "border-primary/20 shadow-[0_2px_12px_-3px_rgba(0,0,0,0.05),0_4px_20px_-2px_rgba(0,0,0,0.02)]"
                    : "border-border hover:border-primary/20 hover:shadow-sm"
                  }`}
              >
                <button
                  onClick={() => toggleSection(section.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                      ${isExpanded
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <h2 className="text-sm font-semibold text-foreground tracking-wide transition-colors group-hover:text-primary">
                      {section.title}
                    </h2>
                  </div>
                  <div className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-300 ${isExpanded ? "" : "-rotate-90"}`} />
                  </div>
                </button>
                {isExpanded && (
                  <div className="border-t border-border px-5 py-4 space-y-3 bg-muted/10">
                    <section.component />
                  </div>
                )}
              </div>
            );
          })}

           
        </div>
      </div>
    </div>
  );
};

export default Pallet;
