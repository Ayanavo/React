import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { MoreVertical, ArchiveIcon, TrashIcon } from "lucide-react";
import React from "react";

function listinglayout() {
  function openNote(item: any): void {
    console.log(item);
  }
  return (
    <>
      {[]
        .constructor(16)
        .fill(null)
        .map((_: any, index: number) => (
          <Card key={index} className="m-3 shadow-none hover:shadow transition-shadow" onClick={() => openNote(index)}>
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

export default listinglayout;
