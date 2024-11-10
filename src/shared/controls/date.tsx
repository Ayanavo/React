import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FieldValues, UseFormReturn } from "react-hook-form";

type DateSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "date";
  validation: { required: boolean };
};

function date({ form, schema }: { form: UseFormReturn<FieldValues>; schema: DateSchema }) {
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
          <FormLabel>{schema.label}</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button variant={"outline"} className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <DatePicker
                showTimeSelect
                showYearDropdown
                scrollableYearDropdown
                inline
                selected={field.value}
                onChange={handleDateChange}
                calendarClassName="bg-white border-none"
                wrapperClassName="w-full"
                popperClassName="react-datepicker-popper"
                dayClassName={(date) => (date && field.value && date.getTime() === field.value.getTime() ? "bg-black text-white" : "text-black hover:bg-gray-200")}
                monthClassName={() => "react-datepicker__month"}
                monthYearClassName={() => "react-datepicker__month-year"}
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
