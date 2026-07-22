import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import showToast from "@/hooks/toast";
import { formatAppMonthYear } from "@/lib/date-format";
import { useConfirmDialog } from "@/shared/confirmation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CalendarClock, ChevronLeft, ChevronRight, PanelLeft, PanelLeftClose } from "lucide-react";
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
  const [focusDate, setFocusDate] = useState<Date>(moment().toDate());
  const [sidebarDate, setSidebarDate] = useState<Date>(moment().toDate());
  const [calendarView, setCalendarView] = useState<CalendarView>("dayGridMonth");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityItem | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(moment().toDate());
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(true);

  const { activities, calendarEvents, isLoading, createActivity, updateActivity, deleteActivity, findActivity } =
    useActivityManager(focusDate, calendarView);

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
    const date = moment(activity.start).toDate();
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
    setSelectedDate(moment(activity.start).toDate());
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

  const sidebarPickerType = calendarView === "dayGridMonth" || calendarView === "dayGridYear" ? "date" : "datetime";

  const sidebarWidth = sidebarPickerType === "datetime" ? "22.5rem" : "15rem";

  const dateSidebar = (
    <aside className="activity-page__sidebar">
      <DatePickerComponent
        key={sidebarPickerType}
        type={sidebarPickerType}
        onSendData={handleSidebarDateChange}
        date={sidebarDate}
      />
    </aside>
  );

  const upcomingPanel = (
    <aside className="activity-page__upcoming">
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

      <div className="px-4 pt-3 sm:px-6 sm:pt-4">
        <BreadcrumbInbuild className="w-full min-w-0" />
      </div>

      <div className="activity-page__content flex flex-1 flex-col gap-3 overflow-hidden p-3 sm:gap-4 sm:p-4">
        <section className="activity-page__toolbar flex flex-col gap-3 rounded-xl border bg-card p-3 shadow-sm sm:p-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="activity-page__toolbar-period min-w-0">
            <div className="activity-page__toolbar-period-mobile md:hidden">
              <Button
                variant="outline"
                size="icon"
                className="activity-page__toolbar-chevron h-8 w-8 shrink-0"
                onClick={() => handleNavigate("prev")}
                aria-label="Previous period">
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="activity-page__toolbar-period-label min-w-0">
                <h2 className="activity-page__toolbar-title truncate text-center text-base font-bold text-foreground">
                  {activeLabel}
                </h2>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="activity-page__toolbar-chevron h-8 w-8 shrink-0"
                onClick={() => handleNavigate("next")}
                aria-label="Next period">
                <ChevronRight className="h-4 w-4" />
              </Button>

              <Button
                variant="secondary"
                size="sm"
                className="activity-page__toolbar-today-mobile h-8 shrink-0 px-2.5 text-xs font-semibold"
                onClick={() => handleNavigate("today")}>
                Today
              </Button>
            </div>

            <div className="activity-page__toolbar-period-desktop hidden min-w-0 items-center justify-between gap-2 md:flex">
              <h2 className="activity-page__toolbar-title min-w-0 truncate text-base font-bold text-foreground sm:mr-2 sm:text-lg">
                {activeLabel}
              </h2>
              <div className="activity-page__toolbar-nav flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 shrink-0 px-2.5 sm:px-3"
                  onClick={() => handleNavigate("today")}>
                  <span className="activity-page__toolbar-label">Today</span>
                  <span className="activity-page__toolbar-label-short">Today</span>
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleNavigate("prev")}
                  aria-label="Previous period">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => handleNavigate("next")}
                  aria-label="Next period">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="activity-page__toolbar-actions flex min-w-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="activity-page__sidebar-toggle hidden h-8 shrink-0 px-2.5 xl:inline-flex"
                  onClick={() => setShowDatePicker((prev) => !prev)}
                  aria-label={showDatePicker ? "Hide date picker" : "Show date picker"}
                  aria-pressed={showDatePicker}>
                  {showDatePicker ?
                    <PanelLeftClose className="h-4 w-4" />
                  : <PanelLeft className="h-4 w-4" />}
                  <span className="activity-page__toolbar-label ml-2">Date picker</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>{showDatePicker ? "Hide date picker" : "Show date picker"}</TooltipContent>
            </Tooltip>

            <ToggleGroup
              type="single"
              value={calendarView}
              variant="outline"
              className="activity-page__view-toggle min-w-0 flex-1"
              onValueChange={(value) => value && setCalendarView(value as CalendarView)}>
              <ToggleGroupItem value="dayGridDay" className="activity-page__view-toggle-item h-9 flex-1 px-1 text-xs sm:h-8 sm:flex-none sm:px-3 sm:text-sm">
                Day
              </ToggleGroupItem>
              <ToggleGroupItem value="dayGridWeek" className="activity-page__view-toggle-item h-9 flex-1 px-1 text-xs sm:h-8 sm:flex-none sm:px-3 sm:text-sm">
                <span className="sm:hidden">Wk</span>
                <span className="hidden sm:inline">Week</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="dayGridMonth" className="activity-page__view-toggle-item h-9 flex-1 px-1 text-xs sm:h-8 sm:flex-none sm:px-3 sm:text-sm">
                <span className="sm:hidden">Mo</span>
                <span className="hidden sm:inline">Month</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="dayGridYear" className="activity-page__view-toggle-item h-9 flex-1 px-1 text-xs sm:h-8 sm:flex-none sm:px-3 sm:text-sm">
                <span className="sm:hidden">Yr</span>
                <span className="hidden sm:inline">Year</span>
              </ToggleGroupItem>
            </ToggleGroup>

            <div className="activity-page__toolbar-sheets flex shrink-0 items-center gap-1.5 xl:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="icon" className="activity-page__toolbar-sheet-btn h-9 w-9 shrink-0" aria-label="Open date picker">
                    <PanelLeft className="h-4 w-4" />
                  </Button>
                </SheetTrigger>
              <SheetContent
                side="left"
                hideClose
                className="scrollbar-none w-[min(100vw-2rem,22rem)] overflow-y-auto p-0">
                <SheetHeader className="border-b px-4 py-3 text-left">
                  <SheetTitle>Pick a date</SheetTitle>
                </SheetHeader>
                <div className="p-4">{dateSidebar}</div>
              </SheetContent>
            </Sheet>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="activity-page__toolbar-sheet-btn h-9 w-9 shrink-0" aria-label="Open upcoming events">
                  <CalendarClock className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                hideClose
                className="scrollbar-none w-[min(100vw-2rem,22rem)] overflow-y-auto p-0">
                <SheetHeader className="border-b px-4 py-3 text-left">
                  <SheetTitle>Upcoming events</SheetTitle>
                </SheetHeader>
                <div className="p-4">{upcomingPanel}</div>
              </SheetContent>
            </Sheet>
            </div>
          </div>
        </section>

        <div
          className="activity-page__workspace min-h-0 flex-1"
          data-sidebar-open={showDatePicker}
          data-sidebar-picker={sidebarPickerType}
          style={{ "--activity-sidebar-width": sidebarWidth } as React.CSSProperties}
          data-tutorial="activity-workspace">
          <div className="activity-page__sidebar-column">{dateSidebar}</div>

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

          <div className="activity-page__upcoming-column">{upcomingPanel}</div>
        </div>
      </div>
    </div>
  );
}

export default ActivityPage;
