import React from "react";
import moment from "moment";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

function activitylist({ events }: { events: Array<{ title: string; date: string }> }) {
  return (
    <div className="mt-6">
      <Accordion type="single" collapsible defaultValue="item-1" className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-lg font-semibold hover:none">Events:</AccordionTrigger>
          <AccordionContent>
            <ul className="list-disc space-y-2">
              {events.map((activity, i) => (
                <li key={i} className="text-sm">
                  <div className="flex justify-between items-center">
                    <span className="truncate font-semibold">{activity.title}</span>
                    <span className="text-gray-500">{moment(activity.date).format("DD MM YYYY")}</span>
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
