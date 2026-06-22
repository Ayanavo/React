import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { NavItem } from "@/config/nav";
import { cn } from "@/lib/utils";
import IconsComponent from "@/common/icons";
import { SearchIcon } from "lucide-react";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useLocation, useNavigate } from "react-router-dom";

type GlobalSearchContextValue = {
  open: () => void;
  close: () => void;
  isOpen: boolean;
};

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null);

function useGlobalSearch() {
  const context = useContext(GlobalSearchContext);
  if (!context) {
    throw new Error("GlobalSearch components must be used within GlobalSearch.");
  }
  return context;
}

const ACCOUNT_ROUTES = new Set(["/profile", "/settings"]);

function useShortcutLabel() {
  return useMemo(() => {
    if (typeof navigator === "undefined") {
      return "Ctrl+K";
    }
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) ? "⌘K" : "Ctrl+K";
  }, []);
}

type GlobalSearchProps = {
  navList: NavItem[];
  children: React.ReactNode;
};

function GlobalSearchRoot({ navList, children }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  useHotkeys(["ctrl+k", "meta+k"], open, { preventDefault: true, enableOnFormTags: true });

  const { mainNav, accountNav } = useMemo(() => {
    const main: NavItem[] = [];
    const account: NavItem[] = [];

    navList.forEach((item) => {
      if (ACCOUNT_ROUTES.has(item.route)) {
        account.push(item);
      } else {
        main.push(item);
      }
    });

    return { mainNav: main, accountNav: account };
  }, [navList]);

  const handleSelect = (route: string) => {
    close();
    if (pathname !== route) {
      navigate(route);
    }
  };

  return (
    <GlobalSearchContext.Provider value={{ open, close, isOpen }}>
      {children}
      <CommandDialog open={isOpen} onOpenChange={setIsOpen}>
        <CommandInput placeholder="Search pages and actions..." />
        <CommandList>
          <CommandEmpty>No matching pages found.</CommandEmpty>

          {mainNav.length > 0 && (
            <CommandGroup heading="Pages">
              {mainNav.map((item) => (
                <CommandItem key={item.route} value={`${item.label} ${item.route}`} onSelect={() => handleSelect(item.route)}>
                  <IconsComponent icon={item.icon} customClass="opacity-70" />
                  <span>{item.label}</span>
                  <CommandShortcut>{item.route.replace("/", "")}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {mainNav.length > 0 && accountNav.length > 0 && <CommandSeparator />}

          {accountNav.length > 0 && (
            <CommandGroup heading="Account">
              {accountNav.map((item) => (
                <CommandItem key={item.route} value={`${item.label} ${item.route}`} onSelect={() => handleSelect(item.route)}>
                  <IconsComponent icon={item.icon} customClass="opacity-70" />
                  <span>{item.label}</span>
                  <CommandShortcut>{item.route.replace("/", "")}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </GlobalSearchContext.Provider>
  );
}

type TriggerProps = {
  className?: string;
};

function GlobalSearchTrigger({ className }: TriggerProps) {
  const { open } = useGlobalSearch();
  const shortcutLabel = useShortcutLabel();

  return (
    <button
      type="button"
      onClick={open}
      aria-label="Open global search"
      className={cn(
        "group flex h-9 w-full items-center gap-2 rounded-md border border-input bg-muted/30 px-3 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className
      )}>
      <SearchIcon className="h-4 w-4 shrink-0 opacity-70" aria-hidden="true" />
      <span className="flex-1 truncate text-left">Search application...</span>
      <kbd className="pointer-events-none hidden h-5 select-none items-center rounded border border-border bg-background px-1.5 font-mono text-[0.625rem] font-medium text-muted-foreground/80 sm:inline-flex">
        {shortcutLabel}
      </kbd>
    </button>
  );
}

function GlobalSearchIconButton({ className }: TriggerProps) {
  const { open } = useGlobalSearch();

  return (
    <Button type="button" variant="ghost" size="icon" className={className} aria-label="Search" onClick={open}>
      <SearchIcon className="h-5 w-5" />
    </Button>
  );
}

const GlobalSearch = Object.assign(GlobalSearchRoot, {
  Trigger: GlobalSearchTrigger,
  IconButton: GlobalSearchIconButton,
});

export default GlobalSearch;
