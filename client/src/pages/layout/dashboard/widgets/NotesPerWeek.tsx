import React, { useMemo } from "react";
import { BarChart } from "../../../../components/ui/chart";
import { dashboardScaleOptions, FULL_BAR_RADIUS, useChartThemeColors } from "../chart-theme";
import { BarChartSkeleton } from "../dashboard-skeletons";
import { DashboardDayCount } from "../use-dashboard-data";

type NotesPerWeekProps = {
  days: DashboardDayCount[];
  isLoading?: boolean;
};

const NotesPerWeek: React.FC<NotesPerWeekProps> = ({ days, isLoading }) => {
  const colors = useChartThemeColors();

  const chart = useMemo(() => {
    const labels = days.map((day) => day.label);
    const values = days.map((day) => day.count);

    return {
      data: {
        labels,
        datasets: [
          {
            label: "Notes",
            data: values,
            backgroundColor: values.map((_, index) => colors.primaryShades[index % 2 === 0 ? 0 : 2]),
            hoverBackgroundColor: values.map((_, index) => colors.primaryShades[index % 2 === 0 ? 1 : 0]),
            borderRadius: FULL_BAR_RADIUS,
            borderSkipped: false,
            barThickness: 18,
            maxBarThickness: 22,
          },
        ],
      },
      options: {
        plugins: { legend: { display: false }, tooltip: { enabled: true } },
        maintainAspectRatio: false,
        scales: dashboardScaleOptions(colors),
      },
    };
  }, [colors, days]);

  if (isLoading) {
    return <BarChartSkeleton bars={7} />;
  }

  if (days.every((day) => day.count === 0)) {
    return <div className="dashboard__empty">No notes created in the last 7 days.</div>;
  }

  return (
    <div className="dashboard__chart">
      <BarChart data={chart.data} options={chart.options} />
    </div>
  );
};

export default NotesPerWeek;
