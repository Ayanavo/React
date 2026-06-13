import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

export const LineChart = ({ data, options }: any) => {
  return <Line data={data} options={options} />;
};

export const DoughnutChart = ({ data, options }: any) => {
  return <Doughnut data={data} options={options} />;
};

export const BarChart = ({ data, options }: any) => {
  return <Bar data={data} options={options} />;
};

export default {
  LineChart,
  DoughnutChart,
  BarChart,
};
