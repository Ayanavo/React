import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ChipComponent from "@/shared/controls/chip";
import ColorComponent from "@/shared/controls/color";
import DateComponent from "@/shared/controls/date";
import TextComponent from "@/shared/controls/text";
import TextAreaComponent from "@/shared/controls/textarea";
import moment from "moment";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";

export default function event({ setIsOpen, isOpen, momentValue }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; momentValue: moment.Moment }) {
  const defaultValues = { color: "#BA0000", date: new Date(momentValue.toISOString()) };
  const form = useForm<{ name: string; date: Date }>({
    defaultValues: defaultValues,
  });

  function onSubmit() {
    setIsOpen(false);
    console.log("Form submitted", form.getValues());
    // Add event logic here
    // Example: save event to database or create event in calendar library
    // Example: set notification for user about successful event creation
    // Example: update calendar display with new event
  }

  useEffect(() => {
    form.reset(defaultValues);
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="hidden"></Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Event</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <FormProvider {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <DateComponent
                form={form}
                schema={{
                  name: "date",
                  label: "Date",
                  placeholder: "",
                  type: "date",
                  validation: {
                    required: true,
                  },
                }}
              />
              <TextComponent
                form={form}
                schema={{
                  name: "name",
                  label: "Event Title",
                  placeholder: "New event title",
                  type: "text",
                  validation: {
                    required: false,
                  },
                }}
              />

              <TextComponent
                form={form}
                schema={{
                  name: "location",
                  label: "Location",
                  placeholder: "",
                  type: "text",
                  validation: {
                    required: false,
                  },
                }}
              />

              <ChipComponent
                form={form}
                schema={{
                  name: "participants",
                  label: "Participants",
                  placeholder: "Add participants",
                  type: "text",
                  validation: {
                    required: false,
                  },
                }}
              />

              <ColorComponent
                form={form}
                schema={{
                  name: "color",
                  label: "Event color",
                  placeholder: "",
                  type: "color",
                  validation: {
                    required: false,
                  },
                }}
              />

              <TextAreaComponent
                form={form}
                schema={{
                  name: "description",
                  label: "Description",
                  placeholder: "Add a description for the event",
                  type: "textarea",
                  validation: {
                    required: false,
                  },
                }}
              />

              <Button type="submit" className="w-full">
                Submit
              </Button>
            </form>
          </FormProvider>
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
