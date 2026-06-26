import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatAppMonthYear } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { CalendarIcon } from "lucide-react";
import React, { useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import { FieldValue, useFormState } from "react-hook-form";
import { dateToMonthYear, monthYearToDate } from "@/shared/utils/work-experience";
import "@/shared/controls/datepicker.scss";
import "@/pages/layout/activity/activity-picker.scss";

type MonthPickerFieldProps = {
  form: FieldValue<any>;
  monthName: string;
  yearName: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  minDate?: Date;
  maxDate?: Date;
  compact?: boolean;
};

const getErrorMessage = (errors: Record<string, unknown>, fieldName: string): string | undefined => {
  let current: unknown = errors;

  for (const part of fieldName.split(".")) {
    if (!current || typeof current !== "object") return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  if (!current || typeof current !== "object") return undefined;
  const message = (current as { message?: unknown }).message;
  return typeof message === "string" ? message : undefined;
};

function MonthPickerField({
  form,
  monthName,
  yearName,
  label,
  required,
  disabled,
  placeholder = "Select month",
  minDate,
  maxDate,
  compact = false,
}: MonthPickerFieldProps) {
  const [open, setOpen] = useState(false);
  const month = form.watch(monthName);
  const year = form.watch(yearName);
  const { errors } = useFormState({ control: form.control });
  const errorMessage =
    getErrorMessage(errors as Record<string, unknown>, monthName) ??
    getErrorMessage(errors as Record<string, unknown>, yearName);
  const selectedDate = useMemo(() => monthYearToDate(month, year), [month, year]);

  const handleChange = (date: Date | null) => {
    if (!date) {
      form.setValue(monthName, "", { shouldDirty: true });
      form.setValue(yearName, "", { shouldDirty: true });
      void form.trigger([monthName, yearName]);
      return;
    }

    const { month: nextMonth, year: nextYear } = dateToMonthYear(date);
    form.setValue(monthName, nextMonth, { shouldDirty: true });
    form.setValue(yearName, nextYear, { shouldDirty: true });
    form.clearErrors([monthName, yearName]);
    void form.trigger([monthName, yearName]);
    setOpen(false);
  };

  return (
    <FormField
      control={form.control}
      name={monthName}
      render={() => (
        <FormItem className={cn("flex flex-col", compact && "space-y-1.5")}>
          {label && (
            <FormLabel className={cn(compact && "text-xs font-medium text-muted-foreground")}>
              {label} {required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  type="button"
                  variant="outline"
                  disabled={disabled}
                  className={cn(
                    "w-full justify-start text-left font-normal shadow-sm",
                    compact ? "h-9 px-3 text-sm" : "h-10 px-3",
                    !selectedDate && "text-muted-foreground"
                  )}>
                  <CalendarIcon className="mr-2 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="truncate">{selectedDate ? formatAppMonthYear(selectedDate) : placeholder}</span>
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <DatePicker
                  inline
                  selected={selectedDate}
                  onChange={handleChange}
                  showMonthYearPicker
                  dateFormat="MM/yyyy"
                  minDate={minDate}
                  maxDate={maxDate}
                  calendarClassName="activity-datetime-picker activity-datetime-picker--compact bg-card font-sans"
                  renderCustomHeader={({
                    date,
                    decreaseYear,
                    increaseYear,
                    prevYearButtonDisabled,
                    nextYearButtonDisabled,
                  }) => (
                    <div className="flex items-center justify-between px-3 pb-2 pt-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={decreaseYear}
                        disabled={prevYearButtonDisabled}>
                        <ChevronLeftIcon className="h-4 w-4" />
                      </Button>
                      <div className="text-sm font-semibold text-foreground">{date.getFullYear()}</div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="size-7 text-muted-foreground hover:text-foreground"
                        onClick={increaseYear}
                        disabled={nextYearButtonDisabled}>
                        <ChevronRightIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                />
              </div>
            </PopoverContent>
          </Popover>
          {errorMessage && <p className="text-[0.8rem] font-medium text-destructive">{errorMessage}</p>}
        </FormItem>
      )}
    />
  );
}

export default MonthPickerField;
