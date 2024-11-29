import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useEffect, useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";

function noteeditor({ setIsOpen, isOpen }: { setIsOpen: (arg: boolean) => void; isOpen: boolean }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const form = useForm<{
    title: string;
    description: string;
  }>();

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
    setIsOpen(false);
    console.log("Form Submitted:", data);
  };

  useEffect(() => {
    form.reset();
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
            <Button type="reset" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default noteeditor;
