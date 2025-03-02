import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ArchiveIcon, MoreVertical, TrashIcon } from "lucide-react";
import React, { useEffect } from "react";
import { State } from "./state";
let noteListing: Array<State> = [];
function listinglayout({ setIsOpen, isOpen }: { setIsOpen: (arg: boolean) => void; isOpen: boolean }) {
  useEffect(() => {
    // (isOpen?.description || isOpen?.title) && noteListing.push(isOpen);
    return () => {
      isOpen && setIsOpen(false);
    };
  }, []);

  return (
    <>
      {noteListing.map((item: State, index: number) => (
        <Card key={index} className="m-3 shadow-none hover:shadow transition-shadow" onClick={() => setIsOpen(true)}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item?.title}</CardTitle>
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
            <p className="text-sm text-gray-600">{item?.description}</p>
          </CardContent>
        </Card>
      ))}
    </>
  );
}

export default listinglayout;
