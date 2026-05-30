import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { formatAppDate, formatAppMonthYear } from "@/lib/date-format";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionGridPlugin, { DateClickArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { ChevronLeft, ChevronRight, Settings2Icon } from "lucide-react";
import moment from "moment";
import React, { useEffect, useRef, useState } from "react";
import { HolidayEvent } from "../../../shared/services/activity";
import ActivityComponent from "./activity-list";
import DatePickerComponent from "./datepicker";
import EventComponent from "./event";
import "./fullcalendar.scss";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";

function activity() {
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const calendarRef = useRef<FullCalendar | null>(null);
  const [activeMonth, setActiveMonth] = useState("");
  const [activeMonthDate, setActiveMonthDate] = useState<moment.Moment>(moment());
  const [date, setDate] = useState<Date>(new Date());
  const [grid, setGrid] = useState<string>("dayGridMonth");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const { isPending, data } = HolidayEvent();

  const HolidayList =
    data?.data.items.map(({ summary, start, end }: { summary: string; start: { date: string }; end?: { date: string } }) => {
      return {
        title: summary,
        start: start.date,
        ...(end && { end: end?.date }),
        allDay: true,
        color: "#0284c7",
      };
    }) ?? [];

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentMonthDate = moment(calendarApi.getDate());
      setActiveMonthDate(currentMonthDate);
      setActiveMonth(formatAppMonthYear(currentMonthDate));
      calendarApi.gotoDate(date);
    }
  }, [date]);

  function handleDateClick(arg: DateClickArg) {
    setSelectedDate(moment(arg.date));
    setIsOpen(true);
  }

  function handleView(view: string) {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi && calendarApi.changeView(view);
    setGrid(view);
  }

  function handleAlignment(event: string) {
    const calendarApi = calendarRef.current?.getApi();
    switch (event) {
      case "today":
        calendarApi && calendarApi.today();
        break;
      case "prev":
        calendarApi && calendarApi.prev();
        break;
      case "next":
        calendarApi && calendarApi.next();
        break;
    }
  }

  function handleDatesSet() {
    console.log("multiple call on view change");

    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentDate = calendarApi.getDate();
      const currentMonthDate = moment(currentDate);
      setActiveMonthDate(currentMonthDate);
      setActiveMonth(formatAppMonthYear(currentMonthDate));
    }
  }

  return (
    <div className="flex flex-col h-[90vh]">
      <EventComponent setIsOpen={setIsOpen} isOpen={isOpen} momentValue={selectedDate} />
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      {/* <div className="px-6 py-2 my-2 border rounded-md mx-5"></div> */}
      <div className="flex overflow-auto">
        <div className="ml-2 px-2 mt-3">
          <DatePickerComponent onSendData={setDate} date={date} />

          <ActivityComponent events={HolidayList.filter((events) => moment(events.start).month() === activeMonthDate.month() && moment(events.start).year() === activeMonthDate.year())} />
        </div>

        {/* <ResizableHandle withHandle /> */}

        <div className="w-full p-4">
          <div className="mb-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold text-primary">{activeMonth}</h1>
              <Button variant="outline" value="today" onClick={() => handleAlignment("today")}>
                Today
              </Button>
              <Button variant="outline" size="icon" value="prev" onClick={() => handleAlignment("prev")}>
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Prev Event</span>
              </Button>
              <Button variant="outline" size="icon" value="next" onClick={() => handleAlignment("next")}>
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next Event</span>
              </Button>
            </div>
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Settings2Icon className="cursor-pointer h-4 w-4" />
                </PopoverTrigger>
                <PopoverContent className="w-60" align="end">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium leading-none">Settings</h4>
                      <p className="text-sm text-muted-foreground">Set apis.</p>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <ToggleGroup className="gap-0" type="single" value={grid} variant="outline" onValueChange={handleView}>
                <ToggleGroupItem className="rounded-r-none" value="dayGridDay">
                  Day
                </ToggleGroupItem>
                <ToggleGroupItem className="rounded-none border-x-0" value="dayGridWeek">
                  Week
                </ToggleGroupItem>
                <ToggleGroupItem className="rounded-l-none" value="dayGridMonth">
                  Month
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
          {!isPending && (
            <div className="calendar-wrapper">
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionGridPlugin]}
                dayHeaderContent={(args) => {
                  switch (args.view.type) {
                    case "dayGridDay":
                      return `${formatAppDate(args.date)} ${moment(args.date).format("dddd")}`;
                    case "dayGridWeek":
                      return `${formatAppDate(args.date)} ${moment(args.date).format("ddd")}`;
                    case "dayGridMonth":
                      return moment(args.date).format("ddd");
                  }
                }}
                eventDisplay="block"
                initialView="dayGridMonth"
                events={HolidayList}
                eventTimeFormat={{ hour: "2-digit", minute: "2-digit", meridiem: true }}
                dateClick={handleDateClick}
                datesSet={handleDatesSet}
                headerToolbar={false}
                editable={true}
                selectable={true}
                height="90vh"
              />
            </div>
          )}
        </div>
        <Dialog open={showEventPopover} onOpenChange={setShowEventPopover}>
          <DialogTrigger asChild>
            <Button className="hidden">Add Schedule</Button>
          </DialogTrigger>
          <DialogContent className="w-80" onInteractOutside={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <h3 className="font-semibold">Add Schedule</h3>
              <Input type="text" placeholder="Event title" />
              <div className="flex space-x-2">
                <Input type="date" value={selectedDate ? selectedDate.toISOString().split("T")[0] : ""} readOnly />
                <Input type="time" />
                <Input type="time" />
              </div>
              <Input type="text" placeholder="Add guest" />
              <Input type="url" placeholder="https://meet.google.com/..." />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEventPopover(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEventPopover(false)}>Save</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

export default activity;
