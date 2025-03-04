import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import GridLayoutComponent from "./grid-layout";
import ListingLayoutComponent from "./listing-layout";
import NoteEditorComponent from "./note-editor";
// import { State } from "./state";

function note() {
  const NotesLayout = [
    { name: "list", label: "List View", icon: "SquareMenuIcon" },
    {
      name: "grid",
      label: "Grid View",
      icon: "Grid2X2Icon",
    },
    // {
    //   name: "kanban",
    //   label: "Kanban View",
    //   icon: "SquareKanbanIcon",
    // },
  ];
  // Toggle between list and grid view
  const [layout, setLayout] = useState<string>("list");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const handleCreate = () => setIsOpen(true); //

  // const [state, disapatch] = useReducer(reducer, InitialState);
  return (
    <>
      <NoteEditorComponent setIsOpen={setIsOpen} isOpen={isOpen} />
      <div className="flex justify-end">
        <div className="m-3 flex items-center justify-center space-x-2">
          <TooltipProvider disableHoverableContent>
            <ToggleGroup className="gap-0" type="single" variant="outline" value={layout} onValueChange={(value) => value && setLayout(value)}>
              {NotesLayout.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === NotesLayout.length - 1;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem className={cn(isFirst && "rounded-r-none", isLast && "rounded-l-none", !(isFirst || isLast) && "rounded-none border-x-0")} value={item.name}>
                        <IconsComponent customClass="h-4 w-4" icon={item.icon} />
                      </ToggleGroupItem>
                    </TooltipTrigger>
                    <TooltipContent>{item.label}</TooltipContent>
                  </Tooltip>
                );
              })}
            </ToggleGroup>
          </TooltipProvider>

          <Button type="button" onClick={handleCreate}>
            <PlusIcon className="h-4 w-4" />
            <span>Add Note</span>
          </Button>
        </div>
      </div>

      {layout === "list" && <ListingLayoutComponent setIsOpen={setIsOpen} isOpen={isOpen} />}
      {layout === "grid" && <GridLayoutComponent setIsOpen={setIsOpen} isOpen={isOpen} />}
    </>
  );
}

export default note;
