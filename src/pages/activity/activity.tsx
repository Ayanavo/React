import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionGridPlugin from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState } from "react";
import DatePickerComponent from "./datepicker";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const events = [
  { title: "Jane Feedback", start: "2023-09-12T08:00:00", end: "2023-09-12T09:30:00", color: "#e9d5ff" },
  { title: "Design System", start: "2023-09-12T09:30:00", end: "2023-09-12T11:00:00", color: "#bfdbfe" },
  { title: "Daily Sync", start: "2023-09-12T11:00:00", end: "2023-09-12T11:30:00", color: "#ddd6fe" },
  { title: "Break", start: "2023-09-12T11:30:00", end: "2023-09-12T12:00:00", color: "#bbf7d0" },
  { title: "Asie's Birthday", start: "2023-09-14T18:00:00", end: "2023-09-14T20:00:00", color: "#bfdbfe" },
];

function activity() {
  const [showEventPopover, setShowEventPopover] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();

  const handleDateClick = (arg: { date: React.SetStateAction<Date> }) => {
    // setSelectedDate(arg.date);
    // setShowEventPopover(true);
  };

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
    <div className="flex flex-col min-h-screen">
      <header className="fixed flex-none p-3">
        <h1 className="text-3xl font-bold mb-6 text-start">Activity</h1>
      </header>
      <main className="flex-grow p-4 sm:p-6 md:p-8 overflow-auto">
        <div className="flex h-screen bg-white">
          <div className="w-64 p-4 border-r">
            <div className="flex items-center mb-6">
              <DatePickerComponent />
            </div>
            {/* <nav>
          <h3 className="mb-2 text-sm font-semibold text-gray-500">My Calendars</h3>
          <ul className="space-y-1">
            <li className="flex items-center">
              <span className="w-3 h-3 mr-2 bg-blue-500 rounded-full"></span>
              <span>Daily Sync</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 mr-2 bg-green-500 rounded-full"></span>
              <span>Birthdays</span>
            </li>
            <li className="flex items-center">
              <span className="w-3 h-3 mr-2 bg-yellow-500 rounded-full"></span>
              <span>Tasks</span>
            </li>
          </ul>
        </nav> */}
          </div>
          <div className="flex-1 p-4">
            <div className="mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">September 2023</h1>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button variant="outline">Today</Button>

                <ToggleGroup className="gap-0" type="single" variant="outline">
                  <ToggleGroupItem className="rounded-r-none" value="day">
                    Day
                  </ToggleGroupItem>
                  <ToggleGroupItem className="rounded-none border-x-0" value="week">
                    Week
                  </ToggleGroupItem>
                  <ToggleGroupItem className="rounded-l-none" value="month">
                    Month
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
            </div>
            <FullCalendar
              plugins={[dayGridPlugin, interactionGridPlugin]}
              initialView="dayGridMonth"
              events={events}
              dateClick={handleDateClick}
              headerToolbar={false}
              height="calc(100vh - 120px)"
            />
          </div>
          <Popover open={showEventPopover} onOpenChange={setShowEventPopover}>
            <PopoverTrigger asChild>
              <Button className="hidden">Add Schedule</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
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
            </PopoverContent>
          </Popover>
        </div>
      </main>
    </div>
  );
}

export default activity;
