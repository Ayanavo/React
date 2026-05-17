import { motion } from "framer-motion";
import { Activity, CheckCircle, Cpu, FileText, Star } from "lucide-react";
import React from "react";

const stats = [
  { id: 1, label: "Total Notes", value: 342, icon: FileText, trend: "+3.4%" },
  { id: 2, label: "Notes Today", value: 4, icon: Star, trend: "+1" },
  { id: 3, label: "Completed Tasks", value: 27, icon: CheckCircle, trend: "-0.8%" },
  { id: 4, label: "Productivity", value: 86, icon: Activity, trend: "+5%" },
  { id: 5, label: "AI Summaries", value: 12, icon: Cpu, trend: "+2" },
];

const Card: React.FC<{ item: any }> = ({ item }) => {
  const Icon = item.icon;
  return (
    <motion.div whileHover={{ y: -4 }} className="flex flex-col p-5 rounded-2xl bg-card/80 border border-border shadow-lg transition hover:-translate-y-1 hover:bg-card/95">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-accent/10 text-accent-foreground">
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{item.label}</div>
            <div className="text-2xl font-semibold text-foreground">{item.value}</div>
          </div>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">{item.trend}</div>
      </div>
      <div className="mt-3 h-6">
        <svg className="w-full h-6" viewBox="0 0 100 20" preserveAspectRatio="none">
          <polyline points="0,12 20,8 40,10 60,6 80,8 100,4" fill="none" stroke="#60a5fa" strokeWidth="2" strokeOpacity="0.8" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      </div>
    </motion.div>
  );
};

const StatsGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {stats.map((s) => (
        <Card key={s.id} item={s} />
      ))}
    </div>
  );
};

export default StatsGrid;
