import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";
import "/src/shared/controls/datepicker.scss";

function datepicker({ onSendData, date }: { onSendData: any; date: Date }) {
  return (
    <DatePicker
      className="mt-56 "
      renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div className="flex justify-evenly pt-1 relative items-center">
          <div className="space-x-7 flex items-center">
            <Button variant="outline" size="icon" className="size-7 opacity-50 hover:opacity-100" onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
              <ChevronLeftIcon />
            </Button>
            <div className="text-sm font-medium" aria-live="polite">
              {moment(date).format("MMMM YYYY")}
            </div>
            <Button variant="outline" size="icon" className="size-7 opacity-50 hover:opacity-100" onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
              <ChevronRightIcon />
            </Button>
          </div>
        </div>
      )}
      inline
      selected={date}
      onChange={onSendData}
      calendarClassName="shadow rounded-md border-solid border border-background font-sans"
    />
  );
}

export default datepicker;
