import IconsComponent from "@/common/icons";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import { getNoteById, getNotes } from "@/shared/services/note";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FileText, PlusIcon } from "lucide-react";
import React, { useState } from "react";
import GridLayoutComponent from "./grid-layout";
import ListingLayoutComponent from "./listing-layout";
import NoteEditorComponent from "./note-editor";
import { mapNoteRecordToState } from "./note-mapper";
import "./note.scss";
import { State } from "./state";

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
      <NoteEditorComponent
        setIsOpen={setIsOpen}
        isOpen={isOpen}
        formData={selectedNote}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      <div className="flex justify-end">
        <div className="m-3 flex items-center justify-center space-x-2">
          <TooltipProvider disableHoverableContent>
            <ToggleGroup
              className="gap-0"
              type="single"
              variant="outline"
              value={layout}
              onValueChange={(value) => value && setLayout(value)}>
              {NotesLayout.map((item, index) => {
                const isFirst = index === 0;
                const isLast = index === NotesLayout.length - 1;
                return (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <ToggleGroupItem
                        className={cn(
                          isFirst && "rounded-r-none",
                          isLast && "rounded-l-none",
                          !(isFirst || isLast) && "rounded-none border-x-0"
                        )}
                        value={item.name}>
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
      {!noteListing.length && !isLoading && (
        <div className="m-3 overflow-hidden rounded-xl border bg-gradient-to-br from-background via-muted/30 to-muted/60 shadow-sm">
          <div className="relative flex flex-col items-center px-6 py-10 text-center">
            {/* Decorative glow */}
            <div className="absolute -top-10 h-fit w-fit rounded-full bg-primary/10 blur-3xl" />

            {/* Icon */}
            <div
              className="
          relative z-10 flex h-16 w-16 items-center justify-center
          rounded-2xl border bg-background shadow-sm
        ">
              <FileText className="h-7 w-7 text-primary" />
            </div>

            {/* Content */}
            <div className="relative z-10 mt-5 space-y-2">
              <h3 className="text-base font-semibold tracking-tight">No notes created yet</h3>
              <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                Start building your knowledge base by creating reusable notes for resumes, projects, experience, skills,
                and more.
              </p>
            </div>

            {/* Bottom decoration */}
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>
        </div>
      )}
      {layout === "list" && (
        <ListingLayoutComponent noteListing={noteListing} onSelect={handleSelect} isLoading={isLoading} />
      )}
      {layout === "grid" && (
        <GridLayoutComponent
          noteListing={noteListing}
          onSelect={handleSelect}
          setIsOpen={setIsOpen}
          isOpen={isOpen}
          isLoading={isLoading}
        />
      )}
    </>
  );
}

export default note;
