import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import moment from "moment";
import React from "react";

function activitylist({
  events,
}: {
  events: Array<{
    allDay: boolean;
    color: string;
    end?: string | undefined;
    title: string;
    start: string;
  }>;
}) {
  return (
    <div className="mt-6 mx-3">
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg text-gray-600 font-semibold no-underline hover:no-underline hover:text-black">Holidays:</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2">
              {events.map((activity, i) => (
                <li key={i} className="text-sm">
                  <div className="grid grid-cols-2 items-center pb-2 border-gray-300">
                    <span className="truncate font-semibold">{activity.title}</span>
                    <span className="text-gray-500">{moment(activity.start).format("DD MM YYYY")}</span>
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
