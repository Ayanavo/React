import { Badge } from "@/components/ui/badge";
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
  const tagStyle =
    item?.tagColor ?
      { borderColor: `${item.tagColor}4f`, backgroundColor: `${item.tagColor}40` }
    : undefined;

  const cardStyle = {
    ...noteThemeStyle,
    ...(item?.tagColor ? { ["--note-tag-color" as string]: item.tagColor } : {}),
  } as React.CSSProperties;

  return (
    <Card
      className={cn(
        "note-card note-box shadow-none cursor-pointer min-h-[140px] flex flex-col overflow-hidden",
        hasCustomBackground && "note-box--themed",
        item?.tagColor && "note-card--tagged",
        className
      )}
      style={cardStyle}
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
          <p className={cn("text-sm whitespace-pre-wrap break-words line-clamp-6", hasCustomBackground ? "note-muted" : "text-muted-foreground")}>
            {item.description}
          </p>
        : <p className={cn("text-sm italic", hasCustomBackground ? "note-muted" : "text-muted-foreground/60")}>No description</p>}

        <div className="note-card__footer mt-auto flex flex-wrap items-center justify-between gap-2">
          {item?.tagName ?
            <Badge variant="secondary" className="cursor-default gap-1.5 rounded-lg text-[10px]" style={tagStyle}>
              {item.tagColor ?
                <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: item.tagColor }} />
              : null}
              {item.tagName}
            </Badge>
          : <span />}
          {modifiedDate && (
            <p className={cn("text-right text-xs", hasCustomBackground ? "note-muted" : "text-muted-foreground/70")}>
              Modified {modifiedDate}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default notecard;
