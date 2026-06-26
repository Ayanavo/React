import { Activity, CalendarClock, CheckCircle, FileText } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { DashboardStats } from "../use-dashboard-data";
import { StatsGridSkeleton } from "../dashboard-skeletons";

type StatsGridProps = {
  stats: DashboardStats;
  isLoading?: boolean;
};

const statItems = [
  { key: "totalNotes" as const, label: "Total Notes", icon: FileText, featured: true },
  { key: "notesToday" as const, label: "Notes Today", icon: Activity, featured: false },
  { key: "upcomingActivities" as const, label: "Upcoming", icon: CalendarClock, featured: false },
  { key: "completedActivities" as const, label: "Completed", icon: CheckCircle, featured: false },
];

const StatsGrid: React.FC<StatsGridProps> = ({ stats, isLoading }) => {
  if (isLoading) {
    return <StatsGridSkeleton />;
  }

  return (
    <div className="dashboard__stat-strip">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.key}
            className={cn(
              "dashboard__stat",
              item.featured && "border-primary/30 bg-primary/5"
            )}>
            <span className="dashboard__stat-icon">
              <Icon className="h-3.5 w-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-2xl font-semibold tracking-tight">{stats[item.key]}</p>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
