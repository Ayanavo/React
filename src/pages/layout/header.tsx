import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoCircledIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";
import { MonitorCogIcon } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";

function header() {
  const { state } = useLocation();
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">{state}</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoCircledIcon className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Every {state ?? "Dashboard"} record in your workspace in one place.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-center flex-auto">
          <div className="relative w-full max-w-md">
            <MagnifyingGlassIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8 w-full" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon">
            <MonitorCogIcon strokeWidth={1.25} className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}

export default header;