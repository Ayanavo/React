import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";
import { State } from "./state";

function noteeditor({ setIsOpen, isOpen }: { setIsOpen: (arg: State) => void; isOpen: State }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: isOpen?.title ?? "",
      description: isOpen?.description ?? "",
    },
  });

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const onSubmit: SubmitHandler<{
    title: string;
    description: string;
  }> = (data) => {
    setIsOpen(data);
  };

  const handleReset = () => {
    setIsOpen(null);
  };

  return (
    <Dialog open={!!isOpen} onOpenChange={handleReset}>
      <DialogTrigger asChild>
        <Button className="hidden"></Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              <input type="text" {...form.register("title")} className="w-full outline-none resize-none py-2" placeholder="Title" />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            <textarea
              {...form.register("description")}
              className="w-full min-h-[100px] rounded-md overflow-hidden outline-none resize-none"
              onChange={handleInput}
              placeholder="Take a note here..."></textarea>
          </DialogDescription>

          <DialogFooter>
            <Button type="reset" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit">Submit</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default noteeditor;
