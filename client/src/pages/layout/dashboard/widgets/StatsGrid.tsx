import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, ArrowUpRight, CheckCircle, FileText, Star } from "lucide-react";
import React from "react";

const stats = [
  { id: 1, label: "Total Notes", value: "342", hint: "Increased from last month", icon: FileText, featured: true },
  { id: 2, label: "Notes Today", value: "4", hint: "Captured today", icon: Star, featured: false },
  { id: 3, label: "Completed Tasks", value: "27", hint: "On track this week", icon: CheckCircle, featured: false },
  { id: 4, label: "Productivity", value: "86%", hint: "Steady progress", icon: Activity, featured: false },
];

const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((item) => {
        const Icon = item.icon;
        return (
          <Card
            key={item.id}
            className={cn(
              "shadow-sm transition-colors",
              item.featured ? "border-primary bg-primary text-primary-foreground" : "bg-card"
            )}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className={cn("rounded-xl p-2", item.featured ? "bg-primary-foreground/15" : "bg-muted")}>
                  <Icon className={cn("h-5 w-5", item.featured ? "text-primary-foreground" : "text-primary")} />
                </div>
                <ArrowUpRight className={cn("h-4 w-4 shrink-0", item.featured ? "text-primary-foreground/80" : "text-muted-foreground")} />
              </div>
              <p className={cn("mt-4 text-sm", item.featured ? "text-primary-foreground/80" : "text-muted-foreground")}>{item.label}</p>
              <p className="mt-1 text-3xl font-semibold tracking-tight">{item.value}</p>
              <p className={cn("mt-2 text-xs", item.featured ? "text-primary-foreground/70" : "text-muted-foreground")}>{item.hint}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default StatsGrid;
