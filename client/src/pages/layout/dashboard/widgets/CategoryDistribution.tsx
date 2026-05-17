import React from "react";
import { DoughnutChart } from "../../../../components/ui/chart";

const CategoryDistribution: React.FC = () => {
  const data = {
    labels: ["Technology", "Writing", "Ideas", "Personal"],
    datasets: [
      {
        label: "Categories",
        data: [45, 25, 20, 10],
        backgroundColor: ["#7c3aed", "#06b6d4", "#10b981", "#f59e0b"],
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    plugins: { legend: { position: "bottom", labels: { color: "#94a3b8" } } },
    maintainAspectRatio: false,
  };

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-medium text-foreground mb-2">Category Distribution</h3>
      <div className="w-full h-44">
        <DoughnutChart data={data} options={options} />
      </div>
    </div>
  );
};

export default CategoryDistribution;
