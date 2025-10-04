import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";
type FontTheme = "system" | "roboto" | "inter" | "poppins" | "paprika" | "oswald";

type ThemeProviderProps = {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  colorTheme?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  color: string;
  setColor: (color: string) => void;
  font: FontTheme;
  setFont: (font: FontTheme) => void;
};

const defaultTheme = "system";
const defaultColor = "zinc";
const defaultFont = "system";

const initialState: ThemeProviderState = {
  theme: defaultTheme,
  setTheme: () => null,
  color: defaultColor,
  setColor: () => null,
  font: defaultFont,
  setFont: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);
export function ThemeProvider({ children, storageKey = "vite-ui-theme", ...props }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme);
  const [color, setColor] = useState<string>(() => localStorage.getItem(`${storageKey}-color`) || defaultColor);
  const [font, setFont] = useState<FontTheme>(() => (localStorage.getItem(`${storageKey}-font`) as FontTheme) || defaultFont);

  useEffect(() => {
    const root = document.documentElement;
    root.removeAttribute("class");
    const effectiveTheme =
      theme === "system" ?
        matchMedia("(prefers-color-scheme: dark)").matches ?
          "dark"
        : "light"
      : theme;

    root.classList.add(effectiveTheme);
    root.classList.add(color);
    root.classList.add(font);
  }, [theme, color, font]);

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
    font,
    setFont: (font: FontTheme) => {
      localStorage.setItem(`${storageKey}-font`, font);
      setFont(font);
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

export const useFont = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) throw new Error("useFont must be used within a ThemeProvider");
  return context;
};
