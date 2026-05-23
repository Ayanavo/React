import { Activity, Clock, Lightbulb } from "lucide-react";
import React from "react";

const insights = [
  { icon: Lightbulb, text: "Most productive day: Thursday" },
  { icon: Clock, text: "You write more in the evening" },
  { icon: Activity, text: "Technology is your most used category" },
];

const AIInsights: React.FC = () => {
  return (
    <div className="space-y-3">
      {insights.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={index} className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <div className="rounded-xl bg-background p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <p className="text-sm text-foreground">{item.text}</p>
          </div>
        );
      })}
    </div>
  );
};

export default AIInsights;
