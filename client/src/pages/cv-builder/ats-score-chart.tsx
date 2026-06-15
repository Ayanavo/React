import { DoughnutChart } from "@/components/ui/chart";
import { FULL_DOUGHNUT_RADIUS, useChartThemeColors } from "@/pages/layout/dashboard/chart-theme";
import { cn } from "@/lib/utils";

type AtsScoreChartProps = {
  score: number;
  className?: string;
};

function scoreColor(score: number, primary: string, series: string[]) {
  if (score >= 75) return primary;
  if (score >= 60) return series[2] ?? primary;
  if (score >= 40) return series[3] ?? primary;
  return series[4] ?? primary;
}

const AtsScoreChart = ({ score, className }: AtsScoreChartProps) => {
  const colors = useChartThemeColors();
  const clamped = Math.min(100, Math.max(0, Math.round(score)));
  const fill = scoreColor(clamped, colors.primary, colors.series);

  const data = {
    labels: ["Score", "Remaining"],
    datasets: [
      {
        data: [clamped, 100 - clamped],
        backgroundColor: [fill, colors.border],
        hoverBackgroundColor: [fill, colors.border],
        borderWidth: 0,
        borderRadius: FULL_DOUGHNUT_RADIUS,
        spacing: 0,
      },
    ],
  };

  const options = {
    rotation: -90,
    circumference: 360,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
    },
    maintainAspectRatio: false,
    animation: {
      animateRotate: true,
      duration: 700,
    },
  };

  return (
    <div className={cn("relative mx-auto h-44 w-44", className)}>
      <DoughnutChart data={data} options={options} />
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold tabular-nums text-foreground">{clamped}%</span>
        <span className="text-xs font-medium text-muted-foreground">ATS Score</span>
      </div>
    </div>
  );
};

export default AtsScoreChart;
