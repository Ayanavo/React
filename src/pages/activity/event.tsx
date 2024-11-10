import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import moment from "moment";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import ColorComponent from "../../shared/controls/color";
import TextComponent from "../../shared/controls/text";
import DateComponent from "../../shared/controls/date";

export default function event({ setIsOpen, isOpen, momentValue }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; momentValue: moment.Moment }) {
  const defaultValues = { date: new Date(momentValue.toISOString()) };
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
