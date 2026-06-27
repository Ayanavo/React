import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";
import { useLocation } from "react-router-dom";
import packageJson from "../../../../package.json";
import GlobalSearch from "./global-search";

type NavItem = { label: string; icon: string; route: string };

function header({ NavList }: { NavList: Array<NavItem> }) {
  const { pathname } = useLocation();
  const NavObj = NavList.find((item) => pathname.includes(item.route));

  return (
    <GlobalSearch navList={NavList}>
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-sm">
        <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 sm:h-16 sm:gap-3 sm:px-5 md:grid-cols-[minmax(0,1fr)_minmax(0,28rem)_minmax(0,1fr)]">
          <div className="flex min-w-0 items-center gap-2 overflow-hidden md:col-start-1">
            <SidebarTrigger className="shrink-0 md:hidden" />
            <h1 className="truncate text-lg font-bold sm:text-2xl">{NavObj?.label ?? "Dashboard"}</h1>
          </div>

          <GlobalSearch.Trigger className="hidden md:col-start-2 md:flex md:justify-self-center" />

          <div className="col-start-2 flex shrink-0 items-center justify-end gap-1 sm:gap-2 md:col-start-3 md:row-start-1">
            <GlobalSearch.IconButton className="md:hidden" />

            <span className="shrink-0 text-xs text-muted-foreground">
              v{packageJson.version}
            </span>
{/* 
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
                <DropdownMenuItem disabled className="text-xs text-muted-foreground">
                  Version {packageJson.version}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu> */}
          </div>
        </div>
      </header>
    </GlobalSearch>
  );
}

export default header;
