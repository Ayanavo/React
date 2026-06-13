import React from "react";
import NoteCard from "./note-card";
import { NoteListSkeleton } from "./note-skeleton";
import { State } from "./state";

function listinglayout({
  noteListing,
  onSelect,
  isLoading,
}: {
  noteListing: State[];
  onSelect: (note: State) => void;
  isLoading?: boolean;
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
        />
      ))}
    </>
  );
}

export default listinglayout;
