import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Grid2X2Icon, SquareMenuIcon } from "lucide-react";
import React from "react";

function note() {
  return (
    <>
      <ToggleGroup type="single">
        <ToggleGroupItem value="bold" aria-label="Toggle bold">
          <SquareMenuIcon className="h-4 w-4" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic" aria-label="Toggle italic">
          <Grid2X2Icon className="h-4 w-4" />
        </ToggleGroupItem>
      </ToggleGroup>
      <Card className="m-3">
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
        <CardFooter>
          <Button className="w-full" type="submit">
            Add Note
          </Button>
        </CardFooter>
      </Card>
    </>
  );
}

export default note;
