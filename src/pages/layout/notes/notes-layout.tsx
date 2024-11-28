import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ArchiveIcon, Grid2X2Icon, MoreVertical, PlusIcon, SquareMenuIcon, TrashIcon } from "lucide-react";
import React from "react";

function note() {
  function openNote(item: any): void {
    console.log(item);
  }

  return (
    <>
      <div className="flex justify-end">
        <div className="m-3 flex items-center justify-center space-x-2">
          <ToggleGroup type="single" variant="outline">
            <ToggleGroupItem value="bold" aria-label="Toggle bold">
              <SquareMenuIcon className="h-4 w-4" />
            </ToggleGroupItem>
            <ToggleGroupItem value="italic" aria-label="Toggle italic">
              <Grid2X2Icon className="h-4 w-4" />
            </ToggleGroupItem>
          </ToggleGroup>

          <Button type="button">
            <PlusIcon className="h-4 w-4" />
            <span> Add Note</span>
          </Button>
        </div>
      </div>
      {[]
        .constructor(16)
        .fill(null)
        .map((item: any, index: number) => (
          <Card key={index} className="m-3 shadow-none hover:shadow-md" onClick={() => openNote(index)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note {index + 1}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <ArchiveIcon className="mr-2 h-4 w-4" />
                    <span>Archive</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <TrashIcon className="mr-2 h-4 w-4" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">This is a sample note.</p>
            </CardContent>
          </Card>
        ))}
    </>
  );
}

export default note;
