import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import React from "react";
import { State } from "./state";

type NoteCardProps = {
  item: State;
  onSelect: (note: State) => void;
  className?: string;
};

function notecard({ item, onSelect, className }: NoteCardProps) {
  const modifiedDate = formatAppDate(item?.updatedAt);

  return (
    <Card
      className={cn("note-box shadow-none hover:shadow transition-shadow cursor-pointer min-h-[140px] flex flex-col", className)}
      style={item?.backgroundColor ? { backgroundColor: item.backgroundColor } : undefined}
      onClick={() => item && onSelect(item)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-snug line-clamp-3 pr-2">{item?.title || "Untitled"}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {item?.image?.[0] && <img alt="" className="max-h-40 w-full rounded-md border object-cover" src={item.image[0]} />}
        {item?.description ?
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{item.description}</p>
        : <p className="text-sm text-muted-foreground/60 italic">No description</p>}
        {modifiedDate && <p className="mt-auto text-right text-xs text-muted-foreground/70">Modified {modifiedDate}</p>}
      </CardContent>
    </Card>
  );
}

export default notecard;
