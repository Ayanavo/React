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
    <div className="min-h-screen flex bg-background text-foreground">
      <main className="flex-1 p-6 space-y-6">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">
              {greetingLabel}, {userName} <GreetingIcon className="inline-block w-7 h-7 align-middle text-sky-400" />
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">You captured 12 ideas this week — keep building.</p>
            <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">Current time: {timeText}</div>
          </div>
          <QuickActions />
        </header>

        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-3xl bg-card/90 border border-border backdrop-blur-md p-6 shadow-xl">
              <NotesPerWeek />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-card/90 border border-border backdrop-blur-md p-6 shadow-xl">
                <CategoryDistribution />
              </div>
              <div className="rounded-3xl bg-card/90 border border-border backdrop-blur-md p-6 shadow-xl">
                <ActivityTimeline />
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-3xl bg-card/90 border border-border backdrop-blur-md p-4 shadow-xl">
              <AIInsights />
            </div>

            <div className="rounded-3xl bg-card/90 border border-border backdrop-blur-md p-4 shadow-xl">
              <RecentNotesList />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
