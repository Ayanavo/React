import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EllipsisVerticalIcon, InfoIcon, LoaderCircleIcon, SearchIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import GlobarSearchComponent from "./globalsearch";
import { useLocation } from "react-router-dom";

type NavItem = { label: string; icon: string; route: string };
function header({ NavList, exclutionList = [] }: { NavList: Array<NavItem>; exclutionList: Array<string> }) {
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
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-14 items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5">
          <SidebarTrigger className="shrink-0 md:hidden" />

          <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
            <h1 className="truncate text-lg font-bold sm:text-2xl">{NavObj?.label ?? "Dashboard"}</h1>
            {NavObj && !exclutionList.includes(NavObj?.route) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="hidden h-4 w-4 shrink-0 text-muted-foreground sm:block" />
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    <p>Every {NavObj?.label} record in your workspace in one place.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="hidden min-w-0 flex-auto items-center justify-center md:flex">
            <div className="relative w-full max-w-md">
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                {isLoading ?
                  <LoaderCircleIcon
                    className="h-4 w-4 animate-spin text-muted-foreground"
                    role="status"
                    aria-label="Loading..."
                  />
                : <SearchIcon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
              </div>
              <Input
                type="search"
                placeholder="Search Application..."
                className="w-full pe-11 pl-8"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />

              <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
                <kbd className="inline-flex h-5 max-h-full items-center rounded border border-border px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                  ⌘K
                </kbd>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Search"
              onClick={() => setIsOpen(true)}>
              <SearchIcon className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="More options">
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
