import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import ColorComponent from "@/shared/controls/color";
import TextComponent from "@/shared/controls/text";
import TextAreaComponent from "@/shared/controls/textarea";
import { getTags, type TagRecord } from "@/shared/services/tag";
import { useQuery } from "@tanstack/react-query";
import { Save, Trash2 } from "lucide-react";
import moment from "moment";
import React, { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import DateTimePicker from "./datepicker";
import LocationAutocompleteField from "./location-autocomplete";
import {
  ActivityFormValues,
  ActivityItem,
  ActivityPriority,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
  RECURRENCE_INTERVAL_LABELS,
  RecurrenceInterval,
} from "./activity.types";

type ActivityFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: ActivityItem | null;
  defaultDate: Date;
  onSubmit: (values: ActivityFormValues, activityId?: string) => void;
  onDelete?: (activityId: string) => void;
};

function buildDefaultValues(activity: ActivityItem | null, defaultDate: Date): ActivityFormValues {
  if (!activity) {
    return {
      title: "",
      description: "",
      date: defaultDate,
      allDay: false,
      color: "#6366f1",
      priority: "medium",
      location: "",
      tag: "",
      recurring: false,
      recurrenceInterval: "month",
      recurrenceEndDate: moment(defaultDate).add(1, "month").toDate(),
    };
  }

  return {
    title: activity.title,
    description: activity.description ?? "",
    date: new Date(activity.start),
    endDate: activity.end ? new Date(activity.end) : undefined,
    allDay: activity.allDay ?? false,
    color: activity.color ?? "#6366f1",
    priority: activity.priority,
    location: activity.location ?? "",
    tag: activity.tag ?? "",
  };
}

export default function ActivityFormDialog({
  open,
  onOpenChange,
  activity,
  defaultDate,
  onSubmit,
  onDelete,
}: ActivityFormDialogProps) {
  const isReadOnly = activity?.source === "holiday";
  const isEditing = Boolean(activity);
  const defaultValues = useMemo(() => buildDefaultValues(activity, defaultDate), [activity, defaultDate]);

  const { data: tags = [], isFetching: isTagsFetching } = useQuery<TagRecord[]>({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const form = useForm<ActivityFormValues>({
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form, open]);

  function handleSubmit(values: ActivityFormValues) {
    if (isReadOnly) {
      onOpenChange(false);
      return;
    }

    if (values.recurring) {
      if (!values.recurrenceInterval || !values.recurrenceEndDate) {
        form.setError("recurrenceEndDate", { type: "manual", message: "Until date and time is required" });
        return;
      }

      if (moment(values.recurrenceEndDate).isBefore(moment(values.date))) {
        form.setError("recurrenceEndDate", { type: "manual", message: "Until date must be after the schedule date" });
        return;
      }
    }

    onSubmit(values, activity?.id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="hidden">Open activity dialog</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle>{isReadOnly ? "Holiday details" : isEditing ? "Edit activity" : "Create activity"}</DialogTitle>
          <DialogDescription>
            {isReadOnly ?
              "Public holidays are read-only and synced from the holiday calendar."
            : "Plan tasks, events, and meetings with scheduling and tags."}
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(handleSubmit)}>
            <TextComponent
              form={form}
              schema={{
                name: "title",
                label: "Title",
                placeholder: "Activity title",
                type: "text",
                validation: { required: true },
              }}
            />

            <div className="space-y-2">
              <Label>Schedule</Label>
              <DateTimePicker
                mode="form"
                type="datetime"
                date={form.watch("date")}
                onSendData={(nextDate) => form.setValue("date", nextDate, { shouldDirty: true, shouldValidate: true })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Tag</Label>
                <Select
                  value={form.watch("tag") || undefined}
                  onValueChange={(value) => form.setValue("tag", value, { shouldDirty: true })}
                  disabled={isReadOnly || tags.length === 0}>
                  <SelectTrigger className="[&>span]:flex [&>span]:items-center">
                    <SelectValue placeholder={isTagsFetching ? "Loading tags..." : "Select tag"} />
                  </SelectTrigger>
                  <SelectContent>
                    {tags.map((tagItem) => (
                      <SelectItem key={tagItem._id} value={tagItem._id}>
                        <ColoredSelectLabel color={tagItem.color} label={tagItem.name} />
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <SelectField<ActivityPriority>
                label="Priority"
                value={form.watch("priority")}
                disabled={isReadOnly}
                onValueChange={(value) => form.setValue("priority", value, { shouldDirty: true })}
                options={Object.entries(PRIORITY_LABELS).map(([value, label]) => ({
                  value: value as ActivityPriority,
                  label,
                  color: PRIORITY_COLORS[value as ActivityPriority],
                }))}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
              <Label htmlFor="all-day">All day</Label>
              <Switch
                id="all-day"
                checked={form.watch("allDay")}
                disabled={isReadOnly}
                onCheckedChange={(checked) => form.setValue("allDay", checked, { shouldDirty: true })}
              />
            </div>

            {!isEditing && !isReadOnly ?
              <div className="space-y-4 rounded-lg border bg-muted/20 p-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="recurring">Repeat event</Label>
                  <Switch
                    id="recurring"
                    checked={Boolean(form.watch("recurring"))}
                    onCheckedChange={(checked) => {
                      form.setValue("recurring", checked, { shouldDirty: true });
                      if (checked && !form.getValues("recurrenceEndDate")) {
                        form.setValue("recurrenceEndDate", moment(form.getValues("date")).add(1, "month").toDate(), {
                          shouldDirty: true,
                        });
                      }
                    }}
                  />
                </div>

                {form.watch("recurring") ?
                  <>
                    <SelectField<RecurrenceInterval>
                      label="Repeat every"
                      value={form.watch("recurrenceInterval") ?? "month"}
                      onValueChange={(value) => form.setValue("recurrenceInterval", value, { shouldDirty: true })}
                      options={Object.entries(RECURRENCE_INTERVAL_LABELS).map(([value, label]) => ({
                        value: value as RecurrenceInterval,
                        label,
                      }))}
                    />

                    <div className="space-y-2">
                      <Label>Until date and time</Label>
                      <DateTimePicker
                        mode="form"
                        type="datetime"
                        minDate={form.watch("date")}
                        date={form.watch("recurrenceEndDate") ?? moment(form.watch("date")).add(1, "month").toDate()}
                        onSendData={(nextDate) =>
                          form.setValue("recurrenceEndDate", nextDate, { shouldDirty: true, shouldValidate: true })
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Events will repeat on the same time until this date.
                      </p>
                    </div>
                  </>
                : null}
              </div>
            : null}

            <LocationAutocompleteField form={form} disabled={isReadOnly} />

            <ColorComponent
              form={form}
              schema={{
                name: "color",
                label: "Color",
                placeholder: "",
                type: "color",
                validation: { required: false },
              }}
            />

            <TextAreaComponent
              form={form}
              schema={{
                name: "description",
                label: "Description",
                placeholder: "Add details, agenda, or notes",
                type: "textarea",
                validation: { required: false },
              }}
            />

            <DialogFooter className="gap-2 sm:justify-end">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {isEditing && !isReadOnly && onDelete && activity ?
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => onDelete(activity.id)}>
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              : null}
              <Button type="submit">
                {!isReadOnly ?
                  <>
                    <Save className="h-4 w-4" />
                    {isEditing ? "Save changes" : "Create activity"}
                  </>
                : "Close"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}

function ColoredSelectLabel({ color, label }: { color?: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      {color ?
        <span
          className="inline-flex size-2.5 shrink-0 rounded-full border border-border"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
      : null}
      <span>{label}</span>
    </span>
  );
}

function SelectField<T extends string>({
  label,
  value,
  onValueChange,
  options,
  disabled,
}: {
  label: string;
  value: T;
  onValueChange: (value: T) => void;
  options: Array<{ value: T; label: string; color?: string }>;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger className="[&>span]:flex [&>span]:items-center">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <ColoredSelectLabel color={option.color} label={option.label} />
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
