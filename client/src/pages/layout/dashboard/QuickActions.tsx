import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard__quick-actions flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:justify-start">
      <Button size="sm" className="h-9 shrink-0 gap-2 px-2.5 md:px-3" onClick={() => navigate("/notes")}>
        <Plus className="h-4 w-4" />
        <span className="dashboard__quick-actions-label">New Note</span>
      </Button>
      <Button size="sm" variant="outline" className="h-9 shrink-0 gap-2 px-2.5 md:px-3" onClick={() => navigate("/activities")}>
        <CalendarDays className="h-4 w-4" />
        <span className="dashboard__quick-actions-label">Activities</span>
      </Button>
      <Button size="sm" variant="outline" className="h-9 shrink-0 gap-2 px-2.5 md:px-3" onClick={() => navigate("/summarize")}>
        <Sparkles className="h-4 w-4" />
        <span className="dashboard__quick-actions-label">AI Summary</span>
      </Button>
    </div>
  );
};

export default QuickActions;
