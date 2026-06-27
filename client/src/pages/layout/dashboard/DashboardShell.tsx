import { Moon, Sun } from "lucide-react";
import { formatAppDateTime } from "@/lib/date-format";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AIInsights from "./AIInsights";
import QuickActions from "./QuickActions";
import RecentNotesList from "./RecentNotesList";
import UpcomingActivitiesList from "./UpcomingActivitiesList";
import { getCurrentUserAPI } from "@/shared/services/auth";
import ActivitiesByTag from "./widgets/ActivitiesByTag";
import NotesPerWeek from "./widgets/NotesPerWeek";
import StatsGrid from "./widgets/StatsGrid";
import { useDashboardData } from "./use-dashboard-data";
import "./dashboard.scss";

function Panel({
  title,
  description,
  linkTo,
  linkLabel = "View all",
  span = "span-4",
  children,
}: {
  title: string;
  description?: string;
  linkTo?: string;
  linkLabel?: string;
  span?: "span-4" | "span-6" | "span-8" | "span-12";
  children: React.ReactNode;
}) {
  return (
    <section className={`dashboard__panel dashboard__panel--${span}`}>
      <div className="dashboard__panel-head">
        <div className="min-w-0 flex-1 space-y-1">
          <h2 className="truncate text-base font-semibold">{title}</h2>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
        {linkTo ?
          <Link to={linkTo} className="shrink-0 text-xs font-medium text-primary hover:underline">
            {linkLabel}
          </Link>
        : null}
      </div>
      <div className="dashboard__panel-body">{children}</div>
    </section>
  );
}

const DashboardShell: React.FC = () => {
  const [userName, setUserName] = useState("there");
  const [greetingLabel, setGreetingLabel] = useState("Good Morning");
  const [isDaytime, setIsDaytime] = useState(true);
  const [timeText, setTimeText] = useState("");

  const {
    isLoading,
    recentNotes,
    upcomingActivities,
    activitiesByTag,
    notesPerDay,
    stats,
    insights,
    tagById,
  } = useDashboardData();

  useEffect(() => {
    let isMounted = true;

    const loadUser = async () => {
      try {
        const response = await getCurrentUserAPI();
        if (!isMounted || !response?.user) return;
        const firstName = response.user.firstName?.trim();
        const lastName = response.user.lastName?.trim();
        const fullName = [firstName, lastName].filter(Boolean).join(" ") || "there";
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
    <div className="dashboard h-full min-h-0 overflow-y-auto scrollbar-none text-foreground">
      <main className="dashboard__main">
        <header className="dashboard__header">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-xl font-semibold tracking-tight text-foreground break-words md:text-3xl">
              {greetingLabel}, {userName}{" "}
              <GreetingIcon className="inline-block h-5 w-5 align-middle text-primary md:h-7 md:w-7" />
            </h1>
            <p className="text-sm text-muted-foreground">Plan, capture, and review your notes from one place.</p>
            <p className="text-xs text-muted-foreground">{timeText}</p>
          </div>
          <QuickActions />
        </header>

        <StatsGrid stats={stats} isLoading={isLoading} />

        <div className="dashboard__bento">
          <Panel title="Notes Created This Week" description="New notes over the last 7 days" span="span-8">
            <NotesPerWeek days={notesPerDay} isLoading={isLoading} />
          </Panel>

          <Panel title="Workspace Insights" description="Patterns from your notes and activities" span="span-4">
            <AIInsights insights={insights} isLoading={isLoading} />
          </Panel>

          <Panel title="Activities by Tag" description="How your scheduled work is grouped" span="span-6">
            <ActivitiesByTag slices={activitiesByTag} isLoading={isLoading} />
          </Panel>

          <Panel title="Upcoming Activities" description="Your next scheduled items" linkTo="/activities" span="span-6">
            <UpcomingActivitiesList activities={upcomingActivities} tagById={tagById} isLoading={isLoading} />
          </Panel>

          <Panel title="Recent Notes" description="Quick access to what you worked on last" linkTo="/notes" span="span-12">
            <RecentNotesList notes={recentNotes} isLoading={isLoading} compact />
          </Panel>
        </div>
      </main>
    </div>
  );
};

export default DashboardShell;
