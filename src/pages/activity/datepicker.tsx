import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";

function datepicker({ onSendData, date }: { onSendData: any; date: Date }) {
  return (
    // <Calendar
    //   className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto mt-[50px] rounded-md border"
    //   mode="single"
    //   selected={date}
    //   onSelect={onSendData as SelectSingleEventHandler}
    // />
    <DatePicker
      className="mt-[50px] rounded-md border"
      renderCustomHeader={({ date, decreaseMonth, increaseMonth, prevMonthButtonDisabled, nextMonthButtonDisabled }) => (
        <div className=" flex justify-evenly font-bold">
          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
            <ChevronLeftIcon />
          </button>
          <div>{moment(date).format("MMMM YYYY")}</div>
          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            <ChevronRightIcon />
          </button>
        </div>
      )}
      inline
      selected={date}
      onChange={onSendData}
      calendarClassName="bg-white border-none"
      wrapperClassName="w-full"
      popperClassName="react-datepicker-popper"
      dayClassName={(day) => (day.getDate() === date.getDate() ? "bg-black text-white hover:bg-black" : "text-black hover:bg-gray-200")}
      monthClassName={() => "react-datepicker__month"}
      monthYearClassName={() => "react-datepicker__month-year"}
    />
  );
}

export default datepicker;
