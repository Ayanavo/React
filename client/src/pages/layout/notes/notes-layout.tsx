import IconsComponent from "@/common/icons";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import AddActionButton from "@/components/inbuild/add-action-button";
import SelectionFloaterToolbar from "@/components/inbuild/selection-floater-toolbar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import { useConfirmDialog } from "@/shared/confirmation";
import { deleteNote, getNoteById, getNotes } from "@/shared/services/note";
import { getTags } from "@/shared/services/tag";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownUpIcon, FileText, ListFilterIcon } from "lucide-react";
import React, { useCallback, useMemo, useState } from "react";
import GridLayoutComponent from "./grid-layout";
import ListingLayoutComponent from "./listing-layout";
import NoteEditorComponent from "./note-editor";
import { filterNotesByTag, mapNoteRecordToState, sortNotes } from "./note-mapper";
import "./note.scss";
import { NoteSortOption, State } from "./state";

const sortOptions: { value: NoteSortOption; label: string }[] = [
  { value: "updated-desc", label: "Recently updated" },
  { value: "updated-asc", label: "Oldest updated" },
  { value: "title-asc", label: "Title (A-Z)" },
  { value: "title-desc", label: "Title (Z-A)" },
  { value: "tag-asc", label: "Tag (A-Z)" },
  { value: "tag-desc", label: "Tag (Z-A)" },
];

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
  const { confirm } = useConfirmDialog();
  const [layout, setLayout] = useState<string>("list");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [selectedNote, setSelectedNote] = useState<State | undefined>(undefined);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState("all");
  const [sortBy, setSortBy] = useState<NoteSortOption>("updated-desc");
  const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes"],
    queryFn: getNotes,
  });

  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const noteListing = useMemo(
    () => notes.map((note) => mapNoteRecordToState(note, tags)),
    [notes, tags]
  );

  const filteredNoteListing = useMemo(
    () => sortNotes(filterNotesByTag(noteListing, selectedTagId), sortBy),
    [noteListing, selectedTagId, sortBy]
  );

  const hasActiveFilter = selectedTagId !== "all";
  const selectedCount = selectedNoteIds.size;

  const bulkDeleteMutation = useMutation<number, Error, string[]>({
    mutationFn: async (ids) => {
      const results = await Promise.allSettled(ids.map((id) => deleteNote(id)));
      const succeeded = results.filter((result) => result.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (failed > 0 && succeeded === 0) {
        const firstError = results.find((result) => result.status === "rejected") as PromiseRejectedResult | undefined;
        throw new Error(firstError?.reason instanceof Error ? firstError.reason.message : "Bulk delete failed");
      }

      return succeeded;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      setSelectedNoteIds(new Set());
      const label = deletedCount === 1 ? "Note" : "Notes";
      showToast({ title: `${deletedCount} ${label} deleted successfully`, variant: "success" });
    },
    onError: (error: Error) => {
      showToast({
        title: "Note bulk deletion failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const handleToggleSelect = useCallback((noteId: string) => {
    setSelectedNoteIds((prev) => {
      const next = new Set(prev);
      if (next.has(noteId)) {
        next.delete(noteId);
      } else {
        next.add(noteId);
      }
      return next;
    });
  }, []);

  const handleClearSelection = useCallback(() => {
    setSelectedNoteIds(new Set());
  }, []);

  const handleBulkDelete = useCallback(async () => {
    const ids = Array.from(selectedNoteIds);
    if (ids.length === 0) return;

    const label = ids.length === 1 ? "note" : "notes";
    const ok = await confirm({
      title: ids.length === 1 ? "Delete Note" : `Delete ${ids.length} Notes`,
      message: `Are you sure you want to delete ${ids.length} selected ${label}? This action cannot be undone.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      showLoadingOnConfirmClick: true,
    });

    if (!ok) return;
    bulkDeleteMutation.mutate(ids);
  }, [bulkDeleteMutation, confirm, selectedNoteIds]);

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
      setSelectedNote(mapNoteRecordToState(noteDetail, tags));
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
        existingNoteCount={notes.length}
        onSave={handleSave}
        onDelete={handleDelete}
      />
      <div className="flex h-full min-h-0 flex-col overflow-hidden">
        <div className="flex-none">
          <div className="flex items-center justify-between px-2 pt-3">
            <BreadcrumbInbuild />
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 px-3 pb-1">
            <div className="m-1 flex flex-wrap items-center justify-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="relative h-9 w-9 shrink-0">
                    <ListFilterIcon className="h-4 w-4" />
                    <span className="sr-only">Filter notes</span>
                    {hasActiveFilter ?
                      <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    : null}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64" onCloseAutoFocus={(event) => event.preventDefault()}>
                  <DropdownMenuLabel>Filter by tag</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="space-y-2 px-2 py-2" onClick={(event) => event.stopPropagation()}>
                    <Select value={selectedTagId} onValueChange={setSelectedTagId}>
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder="All tags" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All tags</SelectItem>
                        <SelectItem value="none">Untagged</SelectItem>
                        {tags.map((tag) => (
                          <SelectItem key={tag._id} value={tag._id}>
                            <span className="flex items-center gap-2">
                              {tag.color ?
                                <span className="inline-flex h-2.5 w-2.5 rounded-full" style={{ backgroundColor: tag.color }} />
                              : null}
                              {tag.name}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {hasActiveFilter ?
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => setSelectedTagId("all")}>Clear filters</DropdownMenuItem>
                    </>
                  : null}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9 shrink-0">
                    <ArrowDownUpIcon className="h-4 w-4" />
                    <span className="sr-only">Sort notes</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {sortOptions.map((option) => (
                    <DropdownMenuItem key={option.value} onSelect={() => setSortBy(option.value)}>
                      <span className={cn(sortBy === option.value && "font-medium text-primary")}>{option.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

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

              <AddActionButton label="Add Note" onClick={handleCreate} />
            </div>
          </div>
          {isLoadingNote && <p className="px-3 text-sm text-muted-foreground">Loading note...</p>}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
          {!noteListing.length && !isLoading && (
            <div className="m-3 overflow-hidden rounded-xl border bg-gradient-to-br from-background via-muted/30 to-muted/60 shadow-sm">
              <div className="relative flex flex-col items-center px-6 py-10 text-center">
                <div className="absolute -top-10 h-fit w-fit rounded-full bg-primary/10 blur-3xl" />

                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl border bg-background shadow-sm">
                  <FileText className="h-7 w-7 text-primary" />
                </div>

                <div className="relative z-10 mt-5 space-y-2">
                  <h3 className="text-base font-semibold tracking-tight">No notes created yet</h3>
                  <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                    Start building your knowledge base by creating reusable notes for resumes, projects, experience, skills,
                    and more.
                  </p>
                </div>

                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              </div>
            </div>
          )}
          {noteListing.length > 0 && !filteredNoteListing.length && !isLoading && (
            <div className="m-3 rounded-xl border bg-muted/20 px-6 py-10 text-center">
              <h3 className="text-base font-semibold tracking-tight">No notes match this filter</h3>
              <p className="mt-2 text-sm text-muted-foreground">Try a different tag filter or clear the current filter.</p>
            </div>
          )}
          {layout === "list" && (
            <ListingLayoutComponent
              noteListing={filteredNoteListing}
              onSelect={handleSelect}
              isLoading={isLoading}
              selectedNoteIds={selectedNoteIds}
              onToggleSelect={handleToggleSelect}
            />
          )}
          {layout === "grid" && (
            <GridLayoutComponent
              noteListing={filteredNoteListing}
              onSelect={handleSelect}
              setIsOpen={setIsOpen}
              isOpen={isOpen}
              isLoading={isLoading}
              selectedNoteIds={selectedNoteIds}
              onToggleSelect={handleToggleSelect}
            />
          )}
        </div>

        <SelectionFloaterToolbar
          selectedCount={selectedCount}
          onClear={handleClearSelection}
          onDelete={handleBulkDelete}
          isDeleting={bulkDeleteMutation.isPending}
          resourceLabel="Note"
        />
      </div>
    </>
  );
}

export default note;
