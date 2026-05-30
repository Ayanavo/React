import React from "react";
import { BarChart } from "../../../../components/ui/chart";
import { dashboardScaleOptions, FULL_BAR_RADIUS, useChartThemeColors } from "../chart-theme";

const NotesPerWeek: React.FC = () => {
  const colors = useChartThemeColors();
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const values = [3, 5, 4, 8, 6, 7, 5];

  const data = {
    labels,
    datasets: [
      {
        label: "Notes",
        data: values,
        backgroundColor: values.map((_, index) => colors.primaryShades[index % 2 === 0 ? 0 : 2]),
        hoverBackgroundColor: values.map((_, index) => colors.primaryShades[index % 2 === 0 ? 1 : 0]),
        borderRadius: FULL_BAR_RADIUS,
        borderSkipped: false,
        barThickness: 32,
        maxBarThickness: 36,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false }, tooltip: { enabled: true } },
    maintainAspectRatio: false,
    scales: dashboardScaleOptions(colors),
  };

  return (
    <div className="h-56 w-full">
      <BarChart data={data} options={options} />
    </div>
  );
};

export default NotesPerWeek;
