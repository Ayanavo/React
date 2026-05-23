import React from "react";
import { DoughnutChart } from "../../../../components/ui/chart";
import { FULL_DOUGHNUT_RADIUS, useChartThemeColors } from "../chart-theme";

const CategoryDistribution: React.FC = () => {
  const colors = useChartThemeColors();

  const data = {
    labels: ["Technology", "Writing", "Ideas", "Personal"],
    datasets: [
      {
        label: "Categories",
        data: [45, 25, 20, 10],
        backgroundColor: colors.series.slice(0, 4),
        hoverBackgroundColor: colors.seriesSoft.slice(0, 4),
        borderWidth: 0,
        borderRadius: FULL_DOUGHNUT_RADIUS,
        spacing: 6,
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { color: colors.mutedForeground, boxWidth: 12, useBorderRadius: true, borderRadius: 6 },
      },
    },
    maintainAspectRatio: false,
    cutout: "62%",
  };

  return (
    <div className="h-48 w-full">
      <DoughnutChart data={data} options={options} />
    </div>
  );
};

export default CategoryDistribution;
