import React, { useMemo } from "react";
import { BarChart } from "../../../../components/ui/chart";
import { dashboardScaleOptions, FULL_BAR_RADIUS, useChartThemeColors } from "../chart-theme";
import { HorizontalBarChartSkeleton } from "../dashboard-skeletons";
import { DashboardTagSlice } from "../use-dashboard-data";

type ActivitiesByTagProps = {
  slices: DashboardTagSlice[];
  isLoading?: boolean;
};

const ActivitiesByTag: React.FC<ActivitiesByTagProps> = ({ slices, isLoading }) => {
  const colors = useChartThemeColors();

  const chart = useMemo(() => {
    const labels = slices.map((slice) => slice.label);
    const values = slices.map((slice) => slice.count);
    const backgroundColor = slices.map((slice, index) => slice.color || colors.series[index % colors.series.length]);
    const hoverBackgroundColor = slices.map((_, index) => colors.seriesSoft[index % colors.seriesSoft.length]);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Activities",
            data: values,
            backgroundColor,
            hoverBackgroundColor,
            borderRadius: FULL_BAR_RADIUS,
            borderSkipped: false,
            barThickness: 14,
            maxBarThickness: 18,
          },
        ],
      },
      options: {
        indexAxis: "y" as const,
        plugins: {
          legend: { display: false },
          tooltip: { enabled: true },
        },
        maintainAspectRatio: false,
        scales: dashboardScaleOptions(colors),
      },
    };
  }, [colors, slices]);

  if (isLoading) {
    return <HorizontalBarChartSkeleton rows={4} />;
  }

  if (slices.length === 0) {
    return <div className="dashboard__empty">No tagged activities yet.</div>;
  }

  const chartHeight = Math.max(136, slices.length * 34 + 28);

  return (
    <div className="dashboard__chart dashboard__chart--horizontal" style={{ height: chartHeight }}>
      <BarChart data={chart.data} options={chart.options} />
    </div>
  );
};

export default ActivitiesByTag;
