import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, MonitorCogIcon, SearchIcon, SunMoonIcon } from "lucide-react";
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
type NavItem = { label: string; icon: string; route: string };
function header({ NavList }: { NavList: Array<NavItem> }) {
  const { pathname } = useLocation();
  const NavObj = NavList.find((item) => pathname.includes(item.route));
  const [position, setPosition] = useState("system");
  return (
    <header className="sticky top-0 z-10 bg-background border-b">
      <div className="flex items-center justify-between h-16 px-8">
        <div className="flex items-center space-x-2">
          <h1 className="text-3xl font-bold">{NavObj?.label}</h1>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-5 w-5 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Every {NavObj?.label} record in your workspace in one place.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center justify-center flex-auto">
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input type="search" placeholder="Search..." className="pl-8 w-full" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MonitorCogIcon className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <InfoIcon className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              {/* <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <SunMoonIcon className="mr-2 h-4 w-4" />
                  <span>Appearance</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup value={position} onValueChange={setPosition}>
                      <DropdownMenuRadioItem value="light">Light Mode</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="dark">Dark Mode</DropdownMenuRadioItem>
                      <DropdownMenuRadioItem value="system">Device Mode</DropdownMenuRadioItem>
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default header;
