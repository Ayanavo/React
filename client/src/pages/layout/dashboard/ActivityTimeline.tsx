import { Archive, Edit3, FilePlus, Sparkles } from "lucide-react";
import React from "react";

const activities = [
  { id: 1, type: "Created note", time: "2h ago", icon: FilePlus },
  { id: 2, type: "Edited notebook", time: "Yesterday", icon: Edit3 },
  { id: 3, type: "Generated AI summary", time: "Mon", icon: Sparkles },
  { id: 4, type: "Archived notes", time: "Apr 2", icon: Archive },
];

const ActivityTimeline: React.FC = () => {
  return (
    <div className="space-y-3">
      {activities.map((activity) => {
        const Icon = activity.icon;
        return (
          <div key={activity.id} className="flex items-start gap-3 rounded-xl border bg-muted/30 p-3">
            <div className="rounded-xl bg-background p-2 text-primary">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground">{activity.type}</p>
              <p className="text-xs text-muted-foreground">{activity.time}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ActivityTimeline;
