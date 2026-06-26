import { Button } from "@/components/ui/button";
import { CalendarDays, Plus, Sparkles } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const QuickActions: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm" onClick={() => navigate("/notes")}>
        <Plus className="h-4 w-4" />
        New Note
      </Button>
      <Button size="sm" variant="outline" onClick={() => navigate("/activities")}>
        <CalendarDays className="h-4 w-4" />
        Activities
      </Button>
      <Button size="sm" variant="outline" onClick={() => navigate("/summarize")}>
        <Sparkles className="h-4 w-4" />
        AI Summary
      </Button>
    </div>
  );
};

export default QuickActions;
