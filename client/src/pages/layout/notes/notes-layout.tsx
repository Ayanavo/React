import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import { getNoteById, getNotes } from "@/shared/services/note";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PlusIcon } from "lucide-react";
import React, { useState } from "react";
import GridLayoutComponent from "./grid-layout";
import ListingLayoutComponent from "./listing-layout";
import NoteEditorComponent from "./note-editor";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { mapNoteRecordToState } from "./note-mapper";
import { State } from "./state";
import "./note.scss";

function note() {
  const NotesLayout = [
    { name: "list", label: "List View", icon: "SquareMenuIcon" },
    {
      name: "grid",
      label: "Grid View",
      icon: "Grid2X2Icon",
    },
  ];

  const queryClient = useQueryClient();
  const [layout, setLayout] = useState<string>("list");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<State | undefined>(undefined);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const noteListing: State[] = notes.map(mapNoteRecordToState);

  const handleCreate = () => {
    setSelectedNote(undefined);
    setIsOpen(true);
  };

  const handleSave = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setIsOpen(false);
    setSelectedNote(undefined);
  };

  const handleDelete = () => {
    queryClient.invalidateQueries({ queryKey: ["notes"] });
    setIsOpen(false);
    setSelectedNote(undefined);
  };

  const handleSelect = async (note: State) => {
    if (!note?._id) {
      setSelectedNote(note);
      setIsOpen(true);
      return;
    }

    try {
      setIsLoadingNote(true);
      const noteDetail = await getNoteById(note._id);
      setSelectedNote(mapNoteRecordToState(noteDetail));
      setIsOpen(true);
    } catch (error) {
      showToast({
        title: "Failed to load note",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsLoadingNote(false);
    }
  };

  return (
    <>
      <NoteEditorComponent setIsOpen={setIsOpen} isOpen={isOpen} formData={selectedNote} onSave={handleSave} onDelete={handleDelete} />
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
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

      {isLoadingNote && <p className="px-3 text-sm text-muted-foreground">Loading note...</p>}
      {layout === "list" && <ListingLayoutComponent noteListing={noteListing} onSelect={handleSelect} isLoading={isLoading} />}
      {layout === "grid" && <GridLayoutComponent noteListing={noteListing} onSelect={handleSelect} setIsOpen={setIsOpen} isOpen={isOpen} isLoading={isLoading} />}
    </>
  );
}

export default note;
