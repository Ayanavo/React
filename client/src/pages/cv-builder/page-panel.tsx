import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useCV } from "@/lib/useCV";
import { Minus, Plus } from "lucide-react";
import React, { useState } from "react";

const PagePallet = () => {
  const { addPage, showSideBar, toggleSideBar, showPagination, togglePagination } = useCV();
  const [pageCount, setPageCount] = useState(1);

  const PaginationLocationConfig = [
    { label: "Top Left", name: "top-left" },
    { label: "Top", name: "top" },
    { label: "Top Right", name: "top-right" },
    { label: "Bottom Left", name: "bottom-left" },
    { label: "Bottom", name: "bottom" },
    { label: "Bottom Right", name: "bottom-right" },
  ];

  // Handle increase and decrease in page count and trigger adding pages
  const handlePageCountChange = (increment: boolean) => {
    setPageCount((prev) => {
      const newPageCount = increment ? prev + 1 : Math.max(1, prev - 1);
      // Add page when pageCount changes
      addPage(newPageCount);
      return newPageCount;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between py-2 rounded-md">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Add Page</Label>
        <ButtonGroup>
          <Button className="p-1" variant="outline" size="sm" onClick={() => handlePageCountChange(false)}>
            <Minus className="h-4 w-4" />
          </Button>
          <Button className="px-2 py-1" variant="outline" size="sm">
            {pageCount}
          </Button>
          <Button className="p-1" variant="outline" size="sm" onClick={() => handlePageCountChange(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </ButtonGroup>
      </div>

      <div className="flex items-center justify-between py-2 rounded-md">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Add SideBar</Label>
        <Switch checked={showSideBar} onCheckedChange={toggleSideBar} />
      </div>

      {showSideBar && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap"> SideBar Location</Label>
          <Select
            defaultValue="bottom-right"
            onValueChange={(value) => {
              console.log(value);
            }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PaginationLocationConfig.map((item) => {
                return (
                  <SelectItem key={item.name} value={item.name}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between py-2 rounded-md">
        <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Add Pagination</Label>
        <Switch checked={showPagination} onCheckedChange={togglePagination} />
      </div>

      {showPagination && (
        <div className="space-y-2 flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground text-nowrap"> Pagination Location</Label>
          <Select
            defaultValue="bottom-right"
            onValueChange={(value) => {
              console.log(value);
            }}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PaginationLocationConfig.map((item) => {
                return (
                  <SelectItem key={item.name} value={item.name}>
                    {item.label}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default PagePallet;
