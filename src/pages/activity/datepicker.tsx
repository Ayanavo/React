import { Calendar } from "@/components/ui/calendar";
import React from "react";

function datepicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  return <Calendar mode="single" selected={date} onSelect={setDate} />;
}

export default datepicker;
