import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { formatAppDate } from "@/lib/date-format";
import React from "react";
import { CalendarEvent } from "./activity-calendar";

function activitylist({ events }: { events: CalendarEvent[] }) {
  return (
    <div className="mt-6 mx-3">
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg text-gray-600 font-semibold no-underline hover:no-underline hover:text-black">
            Holidays:
          </AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2">
              {events.map((activity, i) => (
                <li key={i} className="text-sm">
                  <div className="grid grid-cols-2 items-center pb-2 border-gray-300">
                    <span className="truncate font-semibold">{activity.title}</span>
                    <span className="text-gray-500">{formatAppDate(activity.start)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

export default activitylist;
