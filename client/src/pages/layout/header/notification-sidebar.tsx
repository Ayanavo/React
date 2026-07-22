import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { ActivityItem, PRIORITY_LABELS } from "@/pages/layout/activity/activity.types";
import { AlertCircle, Bell, CalendarClock, ChevronRight, Clock } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useActivityNotifications } from "./use-activity-notifications";

type NotificationSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: ActivityItem[];
  tone?: "danger" | "default";
};

function getScheduleLabel(activity: ActivityItem) {
  if (activity.allDay) return "All day";
  return formatAppDate(activity.start, true);
}

function NotificationItem({
  activity,
  tone,
  onSelect,
}: {
  activity: ActivityItem;
  tone?: "danger" | "default";
  onSelect: (activity: ActivityItem) => void;
}) {
  const isDone = activity.status === "done" || activity.status === "cancelled";

  return (
    <button
      type="button"
      onClick={() => onSelect(activity)}
      className={cn(
        "flex w-full items-start gap-3 rounded-lg border bg-card p-3 text-left transition-colors hover:bg-accent/50",
        tone === "danger" && "border-destructive/30 bg-destructive/5",
        isDone && "opacity-60"
      )}>
      <span
        className="mt-1 h-2 w-2 shrink-0 rounded-full"
        style={{ backgroundColor: activity.color }}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-sm font-medium text-foreground">{activity.title}</span>
          {!isDone ?
            <Badge variant="outline" className="h-2 px-1.5 text-[10px] font-medium">
              {PRIORITY_LABELS[activity.priority]}
            </Badge>
          : null}
        </div>
        <p className="text-xs text-muted-foreground">{getScheduleLabel(activity)}</p>
        {activity.location ?
          <p className="truncate text-xs text-muted-foreground">{activity.location}</p>
        : null}
      </div>
      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    </button>
  );
}

function NotificationSectionBlock({
  section,
  onSelect,
}: {
  section: NotificationSection;
  onSelect: (activity: ActivityItem) => void;
}) {
  if (section.items.length === 0) return null;

  return (
    <section className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <span
          className={cn(
            "inline-flex h-7 w-7 items-center justify-center rounded-md border",
            section.tone === "danger" ?
              "border-destructive/30 bg-destructive/10 text-destructive"
            : "border-border bg-muted/40 text-foreground"
          )}
          aria-hidden="true">
          {section.icon}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
        </div>
        <Badge variant="secondary" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
          {section.items.length}
        </Badge>
      </div>
      <ul className="space-y-2">
        {section.items.map((activity) => (
          <li key={activity.id}>
            <NotificationItem activity={activity} tone={section.tone} onSelect={onSelect} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function NotificationSidebarContent({
  onNavigate,
  overdue,
  today,
  upcoming,
  isLoading,
  isEmpty,
}: {
  onNavigate: () => void;
  overdue: ActivityItem[];
  today: ActivityItem[];
  upcoming: ActivityItem[];
  isLoading: boolean;
  isEmpty: boolean;
}) {
  const navigate = useNavigate();

  const sections: NotificationSection[] = [
    {
      id: "overdue",
      title: "Overdue",
      icon: <AlertCircle className="h-3.5 w-3.5" />,
      items: overdue,
      tone: "danger",
    },
    {
      id: "today",
      title: "Today",
      icon: <Clock className="h-3.5 w-3.5" />,
      items: today,
    },
    {
      id: "upcoming",
      title: "Upcoming",
      icon: <CalendarClock className="h-3.5 w-3.5" />,
      items: upcoming,
    },
  ];

  function handleSelect() {
    onNavigate();
    navigate("/activities");
  }

  if (isLoading) {
    return (
      <div className="space-y-3 px-1">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-16 w-full rounded-lg" />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-6 py-12 text-center">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border bg-background">
          <Bell className="h-4 w-4 text-muted-foreground" />
        </span>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">No activity notifications</p>
          <p className="text-xs text-muted-foreground">Scheduled and overdue activities will appear here.</p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={handleSelect}>
          Go to Activities
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5">
      <ScrollArea className="min-h-0 flex-1 pr-3">
        <div className="space-y-5 pb-2">
          {sections.map((section) => (
            <NotificationSectionBlock key={section.id} section={section} onSelect={handleSelect} />
          ))}
        </div>
      </ScrollArea>
      <Button type="button" variant="outline" className="w-full shrink-0" onClick={handleSelect}>
        View all activities
      </Button>
    </div>
  );
}

export default function NotificationSidebar({ enabled = true }: { enabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const { overdue, today, upcoming, isLoading, isEmpty, unreadCount } = useActivityNotifications(enabled);

  if (!enabled) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative h-7 w-7 shrink-0 rounded-full bg-foreground text-background hover:bg-foreground/90 hover:text-background"
        aria-label="Open activity notifications"
        onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
        {unreadCount > 0 ?
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-destructive-foreground ring-2 ring-background">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        : null}
      </Button>

      <SheetContent side="right" className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader className="shrink-0 space-y-1 border-b pb-4 text-left">
          <SheetTitle>Notifications</SheetTitle>
          <SheetDescription>Activity reminders, today&apos;s schedule, and upcoming events.</SheetDescription>
        </SheetHeader>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden pt-4">
          <NotificationSidebarContent
            onNavigate={() => setOpen(false)}
            overdue={overdue}
            today={today}
            upcoming={upcoming}
            isLoading={isLoading}
            isEmpty={isEmpty}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
