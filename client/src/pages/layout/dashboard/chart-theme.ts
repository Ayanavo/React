import { useEffect, useState } from "react";

export type ChartThemeColors = {
  primary: string;
  primaryShades: string[];
  series: string[];
  seriesSoft: string[];
  mutedForeground: string;
  border: string;
};

const CHART_VARS = ["--chart-1", "--chart-2", "--chart-3", "--chart-4", "--chart-5"] as const;

export function getChartThemeColors(): ChartThemeColors {
  const style = getComputedStyle(document.documentElement);

  const hsl = (variable: string, alpha = 1) => {
    const value = style.getPropertyValue(variable).trim();
    if (!value) return "transparent";
    return alpha < 1 ? `hsl(${value} / ${alpha})` : `hsl(${value})`;
  };

  const primary = hsl("--primary");
  const series = CHART_VARS.map((name) => hsl(name));

  return {
    primary,
    primaryShades: [primary, hsl("--primary", 0.72), hsl("--primary", 0.48), hsl("--primary", 0.28)],
    series,
    seriesSoft: CHART_VARS.map((name) => hsl(name, 0.72)),
    mutedForeground: hsl("--muted-foreground"),
    border: hsl("--border"),
  };
}

export function useChartThemeColors(): ChartThemeColors {
  const [colors, setColors] = useState<ChartThemeColors>(() =>
    typeof window !== "undefined" ? getChartThemeColors() : {
      primary: "",
      primaryShades: [],
      series: [],
      seriesSoft: [],
      mutedForeground: "",
      border: "",
    }
  );

  useEffect(() => {
    const refresh = () => setColors(getChartThemeColors());
    refresh();

    const observer = new MutationObserver(refresh);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style"] });

    return () => observer.disconnect();
  }, []);

  return colors;
}

/** Pill-shaped bar ends (100% of bar thickness). */
export const FULL_BAR_RADIUS = 9999;

/** Fully rounded arc segment corners on doughnut charts. */
export const FULL_DOUGHNUT_RADIUS = 9999;

export const dashboardScaleOptions = (colors: ChartThemeColors) => ({
  x: {
    grid: { display: false },
    ticks: { color: colors.mutedForeground },
    border: { display: false },
  },
  y: {
    grid: { color: colors.border },
    ticks: { color: colors.mutedForeground },
    border: { display: false },
  },
});
