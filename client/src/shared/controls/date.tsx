import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import moment from "moment";
import React from "react";
import DatePicker from "react-datepicker";

import { FieldValue } from "react-hook-form";
import "./custom.scss";
import "./datepicker.scss";

type DateSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "date";
  validation: { required: boolean };
};

function date({ form, schema }: { form: FieldValue<any>; schema: DateSchema }) {
  const handleDateChange = (date: Date | null) => {
    form.setValue(schema.name, date);
  };

  const handleTodayClick = () => {
    const today = new Date();
    form.setValue(schema.name, today);
  };

  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>
            {schema.label} {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
              <DatePicker
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
                showTimeSelect
                showYearDropdown
                scrollableYearDropdown
                inline
                selected={field.value}
                onChange={handleDateChange}
                calendarClassName="bg-white font-sans"
                timeClassName={(time) => (time.getTime() === field.value.getTime() ? "bg-black text-white hover:!bg-black" : "text-black hover:bg-gray-200 active:bg-gray-200")}
              />

              <div className="p-3 border-t border-border">
                <Button variant="default" className="w-full bg-black hover:bg-gray-800 text-white" onClick={handleTodayClick}>
                  Today
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default date;
