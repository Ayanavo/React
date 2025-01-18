import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  colorTheme?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: string;
  setColor: (color: string) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
  color: "zinc",
  setColor: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export function ThemeProvider({ children, storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
  const defaultTheme = "system";
  const defaultColor = "zinc";
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [color, setColor] = useState<string>(() => localStorage.getItem(`${storageKey}-color`) || defaultColor);

  useEffect(() => {
    const root = window.document.documentElement;
    root.removeAttribute("class");
    const effectiveTheme =
      theme === "system" ?
        window.matchMedia("(prefers-color-scheme: dark)").matches ?
          "dark"
        : "light"
      : theme;

    root.classList.add(effectiveTheme);
    root.classList.add(color);
  }, [theme, color]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
    color,
    setColor: (color: string) => {
      localStorage.setItem(`${storageKey}-color`, color);
      setColor(color);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};

export const useColor = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useColor must be used within a ThemeProvider");
  return context;
};
