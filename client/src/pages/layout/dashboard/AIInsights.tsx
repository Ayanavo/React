import React from "react";
import { Lightbulb, Clock, Activity } from "lucide-react";

const insights = [
  { icon: Lightbulb, text: "Most productive day: Thursday" },
  { icon: Clock, text: "You write more in the evening" },
  { icon: Activity, text: "Technology is your most used category" },
];

const AIInsights: React.FC = () => {
  return (
    <div>
      <h4 className="text-md font-medium text-foreground mb-3">AI Insights</h4>
      <div className="space-y-3">
        {insights.map((i, idx) => {
          const Icon = i.icon;
          return (
            <div key={idx} className="flex items-center gap-3 p-3 rounded-2xl bg-card/70 border border-border">
              <div className="p-2 rounded-lg bg-accent/10 text-accent-foreground">
                <Icon className="w-5 h-5" />
              </div>
              <div className="text-foreground">{i.text}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIInsights;
