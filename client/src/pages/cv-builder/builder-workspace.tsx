import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { PanelLeft } from "lucide-react";
import React, { useState } from "react";
import Canvas from "./canvas";

type BuilderWorkspaceProps = {
  pallet: React.ReactNode;
};

function BuilderWorkspace({ pallet }: BuilderWorkspaceProps) {
  const isMobile = useIsMobile();
  const [palletOpen, setPalletOpen] = useState(false);

  return (
    <>
      <div className="relative flex min-h-0 flex-1 overflow-hidden">
        <div className="hidden h-full shrink-0 md:flex">{pallet}</div>
        <Canvas />
        {isMobile ?
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute bottom-4 left-4 z-40 h-11 w-11 rounded-full shadow-lg"
            onClick={() => setPalletOpen(true)}
            aria-label="Open editor panels">
            <PanelLeft className="h-5 w-5" />
          </Button>
        : null}
      </div>

      {isMobile ?
        <Sheet open={palletOpen} onOpenChange={setPalletOpen}>
          <SheetContent
            side="left"
            hideClose
            className="flex h-full w-[min(100%,20rem)] flex-col p-0 sm:max-w-sm">
            {pallet}
          </SheetContent>
        </Sheet>
      : null}
    </>
  );
}

export default BuilderWorkspace;
