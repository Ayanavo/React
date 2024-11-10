import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import moment from "moment";
import React, { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import TextComponent from "../../shared/controls/text";
import ColorComponent from "../../shared/controls/color";

export default function event({ setIsOpen, isOpen, momentValue }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; momentValue: moment.Moment }) {
  const form = useForm<{ name: string }>({
    defaultValues: { name: "" },
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
    form.reset();
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
          Event date: {momentValue.format("MMMM Do, YYYY")}
          <FormProvider {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <TextComponent
                form={form}
                schema={{
                  name: "name",
                  label: "Event name",
                  placeholder: "",
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
