import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, MonitorCogIcon, SearchIcon } from "lucide-react";
import React from "react";
import { useLocation } from "react-router-dom";
type NavItem = { label: string; icon: string; route: string };
function header({ NavList }: { NavList: Array<NavItem> }) {
  const { pathname } = useLocation();
  const NavObj = NavList.find((item) => pathname.includes(item.route));
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
                <MonitorCogIcon strokeWidth={1.25} className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              <DropdownMenuItem>Extra</DropdownMenuItem>
              <DropdownMenuItem>Help</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={(event: Event) => event.preventDefault()}>
                <div className="flex items-center space-x-2">
                  <Switch id="theme" />
                  <Label htmlFor="theme">Theme</Label>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

export default header;
