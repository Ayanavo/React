import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatAppDate, formatAppMonthYear } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { ChevronLeftIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import { CalendarIcon, Clock } from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "/src/shared/controls/datepicker.scss";
import "./activity-picker.scss";

export type DatePickerType = "datetime" | "date" | "time" | "month" | "year";
export type DatePickerMode = "panel" | "form";

export type DatePickerConfig = {
  type?: DatePickerType;
  mode?: DatePickerMode;
  timeIntervals?: number;
  showFooter?: boolean;
  showContinue?: boolean;
  continueLabel?: string;
  footerText?: string | ((date: Date, type: DatePickerType) => string);
  minDate?: Date;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  onContinue?: (date: Date) => void;
};

export type DatePickerProps = DatePickerConfig & {
  onSendData?: (date: Date) => void;
  date?: Date;
};

function getDefaultType(mode: DatePickerMode): DatePickerType {
  return mode === "form" ? "datetime" : "datetime";
}

function getFooterSummary(date: Date, type: DatePickerType): string {
  const m = moment(date);

  switch (type) {
    case "datetime":
      return `Your meeting is booked for ${m.format("dddd, MMMM D")} at ${m.format("HH:mm")}.`;
    case "date":
      return `Selected date: ${m.format("dddd, MMMM D")}.`;
    case "time":
      return `Selected time: ${m.format("HH:mm")}.`;
    case "month":
      return `Selected month: ${m.format("MMMM YYYY")}.`;
    case "year":
      return `Selected year: ${m.format("YYYY")}.`;
  }
}

function getPickerProps(type: DatePickerType, timeIntervals: number) {
  switch (type) {
    case "datetime":
      return {
        showTimeSelect: true,
        timeIntervals,
        timeCaption: "Time",
        timeFormat: "h:mm aa",
        dateFormat: "Pp",
      };
    case "date":
      return {
        showTimeSelect: false,
        dateFormat: "P",
      };
    case "time":
      return {
        showTimeSelectOnly: true,
        timeIntervals,
        timeCaption: "Time",
        timeFormat: "h:mm aa",
        dateFormat: "p",
      };
    case "month":
      return {
        showMonthYearPicker: true,
        dateFormat: "MM/yyyy",
      };
    case "year":
      return {
        showYearPicker: true,
        dateFormat: "yyyy",
      };
  }
}

function PickerNavigation({
  viewDate,
  type,
  onPrev,
  onNext,
  prevDisabled,
  nextDisabled,
}: {
  viewDate: Date;
  type: DatePickerType;
  onPrev: () => void;
  onNext: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
}) {
  const label = type === "year" ? moment(viewDate).format("YYYY") : formatAppMonthYear(viewDate);

  return (
    <div className="activity-picker__header flex items-center justify-between px-3 pb-2 pt-2">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-foreground"
        onClick={onPrev}
        disabled={prevDisabled}>
        <ChevronLeftIcon className="h-4 w-4" />
      </Button>
      <div className="text-sm font-semibold text-foreground" aria-live="polite">
        {label}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-7 text-muted-foreground hover:text-foreground"
        onClick={onNext}
        disabled={nextDisabled}>
        <ChevronRightIcon className="h-4 w-4" />
      </Button>
    </div>
  );
}

function PickerCore({
  selectedDate,
  onChange,
  type,
  timeIntervals = 15,
  showFooter = false,
  showContinue = false,
  continueLabel = "Continue",
  footerText,
  minDate,
  maxDate,
  filterDate,
  onContinue,
}: {
  selectedDate: Date;
  onChange: (date: Date | null) => void;
  type: DatePickerType;
  timeIntervals?: number;
  showFooter?: boolean;
  showContinue?: boolean;
  continueLabel?: string;
  footerText?: string | ((date: Date, type: DatePickerType) => string);
  minDate?: Date;
  maxDate?: Date;
  filterDate?: (date: Date) => boolean;
  onContinue?: (date: Date) => void;
}) {
  const pickerProps = getPickerProps(type, timeIntervals);
  const [viewDate, setViewDate] = useState(selectedDate);

  useEffect(() => {
    setViewDate(selectedDate);
  }, [selectedDate]);

  const summary = useMemo(() => {
    if (typeof footerText === "function") return footerText(selectedDate, type);
    if (typeof footerText === "string") return footerText;
    return getFooterSummary(selectedDate, type);
  }, [footerText, selectedDate, type]);

  const pickerClassName = cn(
    "activity-datetime-picker",
    type === "datetime" && "activity-datetime-picker--with-time",
    type === "time" && "activity-datetime-picker--time-only",
    (type === "month" || type === "year") && "activity-datetime-picker--compact"
  );

  const shiftViewDate = (direction: -1 | 1) => {
    setViewDate((current) => {
      const unit =
        type === "year" ? "year"
        : type === "month" ? "year"
        : "month";
      const amount = type === "year" ? 12 * direction : direction;
      return moment(current).add(amount, unit).toDate();
    });
  };

  const viewBoundary =
    type === "year" ? "year"
    : type === "month" ? "year"
    : "month";
  const prevDisabled =
    minDate ? moment(viewDate).startOf(viewBoundary).isSameOrBefore(moment(minDate).startOf(viewBoundary)) : false;
  const nextDisabled =
    maxDate ? moment(viewDate).startOf(viewBoundary).isSameOrAfter(moment(maxDate).startOf(viewBoundary)) : false;
  const showNavigation = type !== "time";

  return (
    <div className="activity-picker">
      {showNavigation && (
        <PickerNavigation
          viewDate={viewDate}
          type={type}
          onPrev={() => shiftViewDate(-1)}
          onNext={() => shiftViewDate(1)}
          prevDisabled={prevDisabled}
          nextDisabled={nextDisabled}
        />
      )}

      <div className="activity-picker__body">
        <DatePicker
          inline
          selected={selectedDate}
          onChange={onChange}
          openToDate={viewDate}
          onMonthChange={setViewDate}
          minDate={minDate}
          maxDate={maxDate}
          filterDate={filterDate}
          calendarClassName={pickerClassName}
          {...pickerProps}
          renderCustomHeader={() => <div className="activity-datetime-picker__header-spacer" aria-hidden="true" />}
        />
      </div>

      {showFooter && (
        <div className="activity-picker__footer">
          <p className="activity-picker__summary">{summary}</p>
          {showContinue && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="activity-picker__continue"
              onClick={() => onContinue?.(selectedDate)}>
              {continueLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

function DateTimePicker({
  onSendData,
  date,
  type,
  mode = "panel",
  timeIntervals = 15,
  showFooter,
  showContinue,
  continueLabel,
  footerText,
  minDate,
  maxDate,
  filterDate,
  onContinue,
}: DatePickerProps) {
  const resolvedType = type ?? getDefaultType(mode);
  const selectedDate = date ?? new Date();
  const [open, setOpen] = useState(false);

  const resolvedShowFooter = showFooter ?? false;
  const resolvedShowContinue = showContinue ?? false;

  const handleDateChange = (nextDate: Date | null) => {
    if (nextDate) {
      onSendData?.(nextDate);
    }
  };

  const handleContinue = (nextDate: Date) => {
    onContinue?.(nextDate);
    setOpen(false);
  };

  const picker = (
    <PickerCore
      selectedDate={selectedDate}
      onChange={handleDateChange}
      type={resolvedType}
      timeIntervals={timeIntervals}
      showFooter={resolvedShowFooter}
      showContinue={resolvedShowContinue}
      continueLabel={continueLabel}
      footerText={footerText}
      minDate={minDate}
      maxDate={maxDate}
      filterDate={filterDate}
      onContinue={handleContinue}
    />
  );

  if (mode === "form") {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-full justify-between rounded-md border bg-background px-3 py-2 text-left text-sm font-normal shadow-sm hover:bg-accent">
            <span className="flex flex-1 items-center justify-between gap-3">
              <span className="truncate text-foreground">{formatAppDate(selectedDate)}</span>
              {(resolvedType === "datetime" || resolvedType === "time") && (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  {moment(selectedDate).format("h:mm A")}
                </span>
              )}
            </span>
            <CalendarIcon className="ml-2 h-4 w-4 text-muted-foreground" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <div className="overflow-hidden rounded-xl border bg-card shadow-lg">{picker}</div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm">{picker}</div>
  );
}

export default DateTimePicker;
