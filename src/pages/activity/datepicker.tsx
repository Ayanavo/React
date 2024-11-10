import { Calendar } from "@/components/ui/calendar";
import React from "react";
import { SelectSingleEventHandler } from "react-day-picker";

function datepicker({ onSendData, date }: { onSendData: any; date: Date }) {
  return <Calendar mode="single" selected={date} onSelect={onSendData as SelectSingleEventHandler} />;
}

export default datepicker;
