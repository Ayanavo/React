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
}: {
  setIsOpen: (arg: boolean) => void;
  isOpen: boolean;
  noteListing: State[];
  onSelect: (note: State) => void;
  isLoading?: boolean;
}) {
  useEffect(() => {
    return () => {
      isOpen && setIsOpen(false);
    };
  }, [isOpen, setIsOpen]);

  if (isLoading) {
    return <NoteGridSkeleton />;
  }

  if (!noteListing.length) {
    return <p className="m-3 text-sm text-muted-foreground">No notes yet. Create one to get started.</p>;
  }

  return (
    <div className="m-3 columns-1 gap-4 sm:columns-2 md:columns-3 xl:columns-4">
      {noteListing.map((item: State) => (
        <NoteCard
          key={item?._id ?? `${item?.title}-${item?.description}`}
          item={item}
          onSelect={onSelect}
          className="mb-4 break-inside-avoid w-full"
        />
      ))}
    </div>
  );
}

export default gridlayout;
