import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionGridPlugin, { DateClickArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from "@fullcalendar/timegrid";
import { GearIcon } from "@radix-ui/react-icons";
import { ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";
import React, { SyntheticEvent, useEffect, useRef, useState } from "react";
import ActivityComponent from "./activity-list";
import DatePickerComponent from "./datepicker";
import EventComponent from "./event";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

function activity() {
  const events = [
    { title: "Jane Feedback", date: "2023-09-12T08:00:00" },
    { title: "Design System", date: "2023-09-12T09:30:00" },
    { title: "Daily Sync", date: "2023-09-12T11:00:00" },
    { title: "Break", date: "2023-09-12T11:30:00" },
    { title: "Asie's Birthday", date: "2023-09-14T18:00:00" },
  ];
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState<moment.Moment>(moment());
  const calendarRef = useRef<FullCalendar | null>(null);
  const [activeMonth, setActiveMonth] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [grid, setGrid] = useState<string>("dayGridMonth");
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    if (calendarRef.current) {
      const calendarApi = calendarRef.current.getApi();
      const currentMonth = moment(calendarApi.getDate()).format("MMMM YYYY");
      setActiveMonth(currentMonth);
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

  function handleAlignment(event: SyntheticEvent<HTMLButtonElement>) {
    const calendarApi = calendarRef.current?.getApi();
    switch ((event.target as HTMLButtonElement).value) {
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
      const currentMonth = moment(currentDate).format("MMMM YYYY");
      setActiveMonth(currentMonth);
    }
  }

  function recalculateCalendar() {
    const calendarApi = calendarRef.current?.getApi();
    calendarApi && calendarApi.updateSize();
  }

  // const renderEventContent = (eventInfo: {
  //   timeText: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
  //   event: {
  //     title: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | null | undefined;
  //   };
  // }) => {
  //   return (
  //     <>
  //       <b>{eventInfo.timeText}</b>
  //       <i>{eventInfo.event.title}</i>
  //     </>
  //   );
  // };
  return (
    <div className="flex flex-col min-h-screen ">
      <header className="fixed flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Activity</h1>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-hidden">
        <EventComponent setIsOpen={setIsOpen} isOpen={isOpen} momentValue={selectedDate} />
        <ResizablePanelGroup onLayout={recalculateCalendar} direction="horizontal" className="flex h-screen overflow-hidden bg-white">
          <ResizablePanel minSize={17} className="w-[270px] p-4">
            <div className="pl-0">
              <DatePickerComponent onSendData={setDate} date={date} />
            </div>

            <ActivityComponent events={events} />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={83} minSize={50} className="flex-1 p-4">
            <div className="mb-4 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <h1 className="text-3xl font-bold">{activeMonth}</h1>
                <Button variant="outline" value={"today"} onClick={handleAlignment}>
                  Today
                </Button>
                <Button variant="outline" size="icon" value={"prev"} onClick={handleAlignment}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" value={"next"} onClick={handleAlignment}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <GearIcon className="cursor-pointer" />
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
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              datesSet={handleDatesSet}
              headerToolbar={false}
              editable={true}
              selectable={true}
              height="calc(100vh - 120px)"
            />
          </ResizablePanel>
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
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

export default activity;
