import React from "react";
import { LineChart } from "../../../../components/ui/chart";

const NotesPerWeek: React.FC = () => {
  const labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const data = {
    labels,
    datasets: [
      {
        label: "Notes",
        data: [3, 5, 4, 8, 6, 7, 5],
        borderColor: "rgba(99,102,241,0.9)",
        backgroundColor: "rgba(99,102,241,0.12)",
        tension: 0.4,
        fill: true,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    maintainAspectRatio: false,
    scales: {
      x: { grid: { display: false }, ticks: { color: "#94a3b8" } },
      y: { grid: { color: "rgba(148,163,184,0.06)" }, ticks: { color: "#94a3b8" } },
    },
    animations: { tension: { duration: 800, easing: "easeOutQuart" } },
  };

  return (
    <div className="w-full h-64">
      <h3 className="text-lg font-medium text-foreground mb-2">Notes Created This Week</h3>
      <div className="w-full h-52">
        <LineChart data={data} options={options} />
      </div>
    </div>
  );
};

export default NotesPerWeek;
