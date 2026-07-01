import React from "react";
import NoteCard from "./note-card";
import { NoteListSkeleton } from "./note-skeleton";
import { State } from "./state";

function listinglayout({
  noteListing,
  onSelect,
  isLoading,
  selectedNoteIds,
  onToggleSelect,
}: {
  noteListing: State[];
  onSelect: (note: State) => void;
  isLoading?: boolean;
  selectedNoteIds: Set<string>;
  onToggleSelect: (noteId: string) => void;
}) {
  if (isLoading) {
    return <NoteListSkeleton />;
  }

  return (
    <>
      {noteListing.map((item: State) => (
        <NoteCard
          key={item?._id ?? `${item?.title}-${item?.description}`}
          item={item}
          onSelect={onSelect}
          className="m-3"
          isSelected={item?._id ? selectedNoteIds.has(item._id) : false}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </>
  );
}

export default listinglayout;
