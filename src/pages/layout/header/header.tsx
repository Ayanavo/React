import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EllipsisVerticalIcon, InfoIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import GlobarSearchComponent from "./globalsearch";
import { useLocation } from "react-router-dom";

type NavItem = { label: string; icon: string; route: string };
function header({ NavList }: { NavList: Array<NavItem> }) {
  const { pathname } = useLocation();
  const NavObj = NavList.find((item) => pathname.includes(item.route));
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState(false);

  useHotkeys<HTMLParagraphElement>(
    "ctrl+k",
    () => {
      setIsOpen(true);
    },
    {
      preventDefault: true,
    }
  );

  useEffect(() => {
    if (inputValue) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    }
    setIsLoading(false);
  }, [inputValue]);

  return (
    <>
      <GlobarSearchComponent isOpen={isOpen} setIsOpen={setIsOpen} />
      <header className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between h-16 px-5">
          <div className="flex items-center space-x-2 overflow-hidden">
            <h1 className="text-2xl font-bold">{NavObj?.label}</h1>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <InfoIcon className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Every {NavObj?.label} record in your workspace in one place.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-center flex-auto">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                {isLoading ?
                  <LoaderCircleIcon className="animate-spin  h-4 w-4  text-muted-foreground" role="status" aria-label="Loading..." />
                : <SearchIcon className=" h-4 w-4  text-muted-foreground" aria-hidden="true" />}
              </div>
              <Input type="search" placeholder="Search Application..." className="pl-8 w-full pe-11" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />

              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
                <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <EllipsisVerticalIcon className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>
                  <InfoIcon className="mr-2 h-4 w-4" />
                  <span>Help</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
    </>
  );
}

export default header;
