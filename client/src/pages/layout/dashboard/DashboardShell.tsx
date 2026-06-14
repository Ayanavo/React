import { Moon, Sun } from "lucide-react";
import { formatAppDateTime } from "@/lib/date-format";
import moment from "moment";
import React, { useEffect, useState } from "react";
import ActivityTimeline from "./ActivityTimeline";
import AIInsights from "./AIInsights";
import QuickActions from "./QuickActions";
import RecentNotesList from "./RecentNotesList";
import { getCurrentUserAPI } from "@/shared/services/auth";
import CategoryDistribution from "./widgets/CategoryDistribution";
import NotesPerWeek from "./widgets/NotesPerWeek";
import StatsGrid from "./widgets/StatsGrid";
import DashboardCard from "./DashboardCard";

const DashboardShell: React.FC = () => {
  const [userName, setUserName] = useState("Ayanavo");
  const [greetingLabel, setGreetingLabel] = useState("Good Morning");
  const [isDaytime, setIsDaytime] = useState(true);
  const [timeText, setTimeText] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await getCurrentUserAPI();
        if (!isMounted || !response?.user) return;
        const firstName = response.user.firstName?.trim();
        const lastName = response.user.lastName?.trim();
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Ayanavo";
        setUserName(fullName);
      } catch (error) {
        console.error("Unable to load current user", error);
      }
    };

    const updateTime = () => {
      const now = moment();
      const hour = now.hour();
      setTimeText(formatAppDateTime(now));
      setIsDaytime(hour >= 6 && hour < 18);
      if (hour >= 18 || hour < 5) {
        setGreetingLabel("Good Evening");
      } else if (hour >= 12) {
        setGreetingLabel("Good Afternoon");
      } else {
        setGreetingLabel("Good Morning");
      }
    };

    loadUser();
    updateTime();
    const interval = window.setInterval(updateTime, 60000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const GreetingIcon = isDaytime ? Sun : Moon;

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-none bg-background text-foreground">
      <main className="space-y-6 p-6">
        <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
              {greetingLabel}, {userName}{" "}
              <GreetingIcon className="inline-block h-6 w-6 align-middle text-primary md:h-7 md:w-7" />
            </h1>
            <p className="text-sm text-muted-foreground">Plan, capture, and review your notes from one place.</p>
            <p className="text-xs text-muted-foreground">{timeText}</p>
          </div>
          <QuickActions />
        </header>

        <StatsGrid />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DashboardCard title="Notes Created This Week" description="Activity over the last 7 days">
              <NotesPerWeek />
            </DashboardCard>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <DashboardCard title="Category Distribution" description="How your notes are grouped">
                <CategoryDistribution />
              </DashboardCard>
              <DashboardCard title="Recent Activity" description="Latest updates across your workspace">
                <ActivityTimeline />
              </DashboardCard>
            </div>
          </div>

          <aside className="space-y-6">
            <DashboardCard title="AI Insights" description="Patterns from your writing habits">
              <AIInsights />
            </DashboardCard>
            <DashboardCard
              title="Recent Notes"
              description="Quick access to what you worked on last"
              headerAction={<span className="text-xs font-medium text-primary">View all</span>}>
              <RecentNotesList />
            </DashboardCard>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
