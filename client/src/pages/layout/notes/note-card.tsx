import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { ArchiveIcon, MoreVertical, TrashIcon } from "lucide-react";
import React from "react";
import { State } from "./state";

type NoteCardProps = {
  item: State;
  onSelect: (note: State) => void;
  className?: string;
};

function notecard({ item, onSelect, className }: NoteCardProps) {
  const stopPropagation = (event: React.MouseEvent) => {
    event.stopPropagation();
  };

  return (
    <Card
      className={cn("note-box shadow-none hover:shadow transition-shadow cursor-pointer min-h-[140px] flex flex-col", className)}
      style={item?.backgroundColor ? { backgroundColor: item.backgroundColor } : undefined}
      onClick={() => item && onSelect(item)}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium leading-snug line-clamp-3 pr-2">{item?.title || "Untitled"}</CardTitle>
        {/* <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 shrink-0 p-0" onClick={stopPropagation}>
              <span className="sr-only">Open menu</span>
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" onClick={stopPropagation}>
            <DropdownMenuItem onClick={stopPropagation}>
              <ArchiveIcon className="mr-2 h-4 w-4" />
              <span>Archive</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={stopPropagation}>
              <TrashIcon className="mr-2 h-4 w-4" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu> */}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3 pt-0">
        {item?.image?.[0] && <img alt="" className="h-24 w-full rounded-md border object-cover" src={item.image[0]} />}
        {item?.description ?
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words">{item.description}</p>
        : <p className="text-sm text-muted-foreground/60 italic">No description</p>}
      </CardContent>
    </Card>
  );
}

export default notecard;
