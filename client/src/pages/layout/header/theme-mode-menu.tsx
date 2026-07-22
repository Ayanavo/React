import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/pages/settings/theme";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import React from "react";

const themeModes = [
  { type: "light" as const, label: "Light Mode", icon: Sun },
  { type: "dark" as const, label: "Dark Mode", icon: Moon },
  { type: "system" as const, label: "System Mode", icon: Monitor },
];

function ThemeModeMenu() {
  const { theme, setTheme } = useTheme();
  const activeMode = themeModes.find((mode) => mode.type === theme) ?? themeModes[2];
  const ActiveIcon = activeMode.icon;

  const handleSelect = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    sessionStorage.setItem("theme", mode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-9 w-9 shrink-0"
          aria-label="Change theme mode">
          <ActiveIcon className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        {themeModes.map(({ type, label, icon: Icon }) => (
          <DropdownMenuItem key={type} onSelect={() => handleSelect(type)}>
            <Icon className="h-4 w-4" />
            {label}
            {theme === type ?
              <Check className="ml-auto h-4 w-4" />
            : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default ThemeModeMenu;
