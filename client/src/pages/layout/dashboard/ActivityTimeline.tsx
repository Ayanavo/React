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
    <div>
      <h4 className="text-md font-medium text-foreground mb-3">Activity</h4>
      <div className="space-y-4">
        {activities.map((a) => {
          const Icon = a.icon;
          return (
            <div key={a.id} className="flex items-start gap-3 rounded-2xl bg-card/75 border border-border p-3 shadow-sm">
              <div className="mt-1 p-2 rounded-full bg-accent/10 text-accent-foreground">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="text-foreground">{a.type}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{a.time}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActivityTimeline;
