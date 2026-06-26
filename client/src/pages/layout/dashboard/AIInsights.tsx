import { Activity, Clock, Lightbulb } from "lucide-react";
import React from "react";
import { InsightsListSkeleton } from "./dashboard-skeletons";
import { DashboardInsight } from "./use-dashboard-data";

const insightIcons = [Lightbulb, Clock, Activity];

type AIInsightsProps = {
  insights: DashboardInsight[];
  isLoading?: boolean;
};

const AIInsights: React.FC<AIInsightsProps> = ({ insights, isLoading }) => {
  if (isLoading) {
    return <InsightsListSkeleton count={3} />;
  }

  return (
    <div className="dashboard__list">
      {insights.map((item, index) => {
        const Icon = insightIcons[index % insightIcons.length];
        return (
          <div key={item.id} className="dashboard__insight">
            <span className="dashboard__insight-icon">
              <Icon className="h-3 w-3" />
            </span>
            <p className="text-sm text-foreground">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;
