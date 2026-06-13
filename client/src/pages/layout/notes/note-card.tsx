import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatAppDateTime } from "@/lib/date-format";
import { getNoteThemeStyle, hasExplicitNoteBackground } from "@/shared/color-picker";
import { cn } from "@/lib/utils";
import React from "react";
import { State } from "./state";

type NoteCardProps = {
  item: State;
  onSelect: (note: State) => void;
  className?: string;
};

function notecard({ item, onSelect, className }: NoteCardProps) {
  const modifiedDate = formatAppDateTime(item?.updatedAt);
  const hasCustomBackground = hasExplicitNoteBackground(item?.backgroundColor);
  const noteThemeStyle = getNoteThemeStyle(item?.backgroundColor);

  return (
    <Card
      className={cn(
        "note-box shadow-none hover:shadow transition-shadow cursor-pointer min-h-[140px] flex flex-col",
        hasCustomBackground && "note-box--themed",
        className
      )}
      style={noteThemeStyle}
      onClick={() => item && onSelect(item)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-snug line-clamp-3 pr-2">
          {item?.title || "Untitled"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {item?.image?.[0] && (
          <img alt="" className="max-h-40 w-full rounded-md border object-cover" src={item.image[0]} />
        )}
        {item?.description ?
          <p className={cn("text-sm whitespace-pre-wrap break-words", hasCustomBackground ? "note-muted" : "text-muted-foreground")}>
            {item.description}
          </p>
        : <p className={cn("text-sm italic", hasCustomBackground ? "note-muted" : "text-muted-foreground/60")}>No description</p>}
        {modifiedDate && (
          <p className={cn("mt-auto text-right text-xs", hasCustomBackground ? "note-muted" : "text-muted-foreground/70")}>
            Modified {modifiedDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default notecard;
