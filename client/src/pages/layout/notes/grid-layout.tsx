import React, { useEffect } from "react";
import NoteCard from "./note-card";
import { NoteGridSkeleton } from "./note-skeleton";
import { State } from "./state";

function gridlayout({
  setIsOpen,
  isOpen,
  noteListing,
  onSelect,
  isLoading,
  selectedNoteIds,
  onToggleSelect,
}: {
  setIsOpen: (arg: boolean) => void;
  isOpen: boolean;
  noteListing: State[];
  onSelect: (note: State) => void;
  isLoading?: boolean;
  selectedNoteIds: Set<string>;
  onToggleSelect: (noteId: string) => void;
}) {
  useEffect(() => {
    return () => {
      isOpen && setIsOpen(false);
    };
  }, [isOpen, setIsOpen]);

  if (isLoading) {
    return <NoteGridSkeleton />;
  }

  return (
    <div className="m-3 columns-1 gap-4 sm:columns-2 md:columns-3 xl:columns-4">
      {noteListing.map((item: State) => (
        <NoteCard
          key={item?._id ?? `${item?.title}-${item?.description}`}
          item={item}
          onSelect={onSelect}
          className="mb-4 break-inside-avoid w-full"
          isSelected={item?._id ? selectedNoteIds.has(item._id) : false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}

export default gridlayout;
