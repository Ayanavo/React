import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import showToast from "@/hooks/toast";
import { formatAppMonthYear } from "@/lib/date-format";
import { useConfirmDialog } from "@/shared/confirmation";
import { ChevronLeft, ChevronRight, PanelLeft } from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import ActivityCalendar, { CalendarEvent, CalendarView } from "./activity-calendar";
import { ActivityItem } from "./activity.types";
import DatePickerComponent from "./datepicker";
import ActivityFormDialog from "./event";
import ActivityUpcomingList from "./activity-upcoming";
import "./activity.scss";
import { useActivityManager } from "./use-activity-manager";

function ActivityPage() {
  const { confirm } = useConfirmDialog();
  const [focusDate, setFocusDate] = useState<Date>(new Date());
  const [sidebarDate, setSidebarDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>("dayGridMonth");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);

  const {
    activities,
    calendarEvents,
    isLoading,
    createActivity,
    updateActivity,
    deleteActivity,
    findActivity,
  } = useActivityManager(focusDate, calendarView);

  const activeLabel = useMemo(() => {
    if (calendarView === "dayGridYear") {
      return moment(focusDate).format("YYYY");
    }

    return formatAppMonthYear(focusDate);
  }, [calendarView, focusDate]);

  useEffect(() => {
    setFocusDate(sidebarDate);
  }, [sidebarDate]);

  function focusCalendarOnActivity(activity: ActivityItem) {
    const date = new Date(activity.start);
    setFocusDate(date);
    setSidebarDate(date);
    setFocusedDate(date);
  }

  function handleSidebarDateChange(date: Date) {
    setSidebarDate(date);
    setFocusedDate(null);
  }

  function openCreateDialog(date: Date) {
    setFocusedDate(null);
    setSelectedActivity(null);
    setSelectedDate(date);
    setDialogOpen(true);
  }

  function openEditDialog(activity: ActivityItem) {
    setSelectedActivity(activity);
    setSelectedDate(new Date(activity.start));
    setDialogOpen(true);
  }

  function openCalendarEvent(event: CalendarEvent, date: Date) {
    setFocusedDate(null);
    const activity = findActivity(event.id) ?? null;
    if (activity?.source === "holiday") {
      return;
    }

    if (activity) {
      openEditDialog(activity);
      return;
    }

    openCreateDialog(date);
  }

  async function handleSubmit(values: Parameters<typeof createActivity>[0], activityId?: string) {
    try {
      if (activityId) {
        const result = await updateActivity(activityId, values);
        if (!result) return;

        showToast({ title: result.message || "Activity updated successfully", variant: "success" });
        return;
      }

      const result = await createActivity(values);
      showToast({ title: result.message || "Activity created successfully", variant: "success" });
    } catch {
      showToast({ title: "Failed to save activity", variant: "error" });
    }
  }

  async function handleDelete(activityId: string) {
    const accepted = await confirm({
      title: "Delete activity",
      message: "Are you sure you want to delete this activity? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!accepted) return;

    try {
      const result = await deleteActivity(activityId);
      if (!result) {
        showToast({ title: "Unable to delete activity", variant: "error" });
        return;
      }

      setDialogOpen(false);
      showToast({ title: result.message || "Activity deleted successfully", variant: "success" });
    } catch {
      showToast({ title: "Failed to delete activity", variant: "error" });
    }
  }

  function handleNavigate(action: "today" | "prev" | "next") {
    const unit =
      calendarView === "dayGridDay" ? "day"
      : calendarView === "dayGridWeek" ? "week"
      : calendarView === "dayGridYear" ? "year"
      : "month";

    let next = moment(focusDate);

    switch (action) {
      case "today":
        next = moment();
        break;
      case "prev":
        next = next.subtract(1, unit);
        break;
      case "next":
        next = next.add(1, unit);
        break;
    }

    const nextDate = next.toDate();
    setFocusDate(nextDate);
    setSidebarDate(nextDate);
    setFocusedDate(null);
  }

  const sidebar = (
    <aside className="activity-page__sidebar">
      <DatePickerComponent type="datetime" onSendData={handleSidebarDateChange} date={sidebarDate} />
      <ActivityUpcomingList activities={activities} onSelect={focusCalendarOnActivity} />
    </aside>
  );

  return (
    <div className="activity-page flex h-full min-h-0 flex-col overflow-hidden">
      <ActivityFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activity={selectedActivity}
        defaultDate={selectedDate}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
      />

      <div className="px-6 pt-4">
        <BreadcrumbInbuild />
      </div>

      <div className="activity-page__content flex flex-1 flex-col gap-4 overflow-hidden p-4">
        <section className="activity-page__toolbar flex flex-col gap-3 rounded-xl border bg-card p-4 shadow-sm xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="mr-2 text-lg font-semibold text-foreground">{activeLabel}</h2>
            <Button variant="outline" size="sm" onClick={() => handleNavigate("today")}>
              Today
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleNavigate("prev")} aria-label="Previous period">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleNavigate("next")} aria-label="Next period">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ToggleGroup type="single" value={calendarView} variant="outline" onValueChange={(value) => value && setCalendarView(value as CalendarView)}>
              <ToggleGroupItem value="dayGridDay">Day</ToggleGroupItem>
              <ToggleGroupItem value="dayGridWeek">Week</ToggleGroupItem>
              <ToggleGroupItem value="dayGridMonth">Month</ToggleGroupItem>
              <ToggleGroupItem value="dayGridYear">Year</ToggleGroupItem>
            </ToggleGroup>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="lg:hidden">
                  <PanelLeft className="mr-2 h-4 w-4" />
                  Panel
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100vw-2rem,22rem)] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Activity panel</SheetTitle>
                </SheetHeader>
                <div className="mt-4">{sidebar}</div>
              </SheetContent>
            </Sheet>
          </div>
        </section>

        <div className="activity-page__workspace grid min-h-0 flex-1 gap-4 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <div className="activity-page__sidebar-column">{sidebar}</div>

          <main className="activity-page__main">
            {isLoading ?
              <div className="space-y-3 rounded-xl border bg-card p-4 shadow-sm">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-[24rem] w-full" />
              </div>
            : <ActivityCalendar
                view={calendarView}
                focusDate={focusDate}
                events={calendarEvents}
                focusedDate={focusedDate}
                onDateClick={openCreateDialog}
                onEventClick={openCalendarEvent}
              />
            }
          </main>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
