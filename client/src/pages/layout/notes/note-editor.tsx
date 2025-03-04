import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import imageFile from "@/hooks/image-file";
import React, { useRef } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";
import { State } from "./state";
import { CustomPopover } from "@/hooks/popover-content";

function noteeditor({ setIsOpen, isOpen, formData }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; formData?: State }) {
  const { image, renderInputField, activateInput } = imageFile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<{ open: () => void; close: () => void }>(null);
  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: formData?.title ?? "",
      description: formData?.description ?? "",
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
  }> = () => {
    setIsOpen(true);
  };

  const handleReset = () => {
    setIsOpen(false);
  };

  function activateAction(action: string): void {
    switch (action) {
      case "color":
        popoverRef.current?.open();
        break;
      case "image":
        activateInput();
        break;
      default:
        break;
    }
  }

  return (
    <Dialog open={!!isOpen} onOpenChange={handleReset}>
      <DialogTrigger asChild>
        <Button className="hidden"></Button>
      </DialogTrigger>
      <DialogOverlay className="DialogOverlay">
        <DialogContent>
          {image && <img width={64} height={64} alt="Attachment" className="w-full rounded" src={image} />}
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>
                <input type="text" {...form.register("title")} className="w-full outline-none resize-none py-2 shad-background shad-color shad-border" placeholder="Title" />
              </DialogTitle>
            </DialogHeader>
            <DialogDescription>
              <textarea
                {...form.register("description")}
                className="w-full min-h-[100px] rounded-md overflow-hidden outline-none resize-none shad-background shad-color shad-border"
                onChange={handleInput}
                placeholder="Description"></textarea>
            </DialogDescription>

            <DialogFooter>
              <div className="flex items-center space-x-2">
                {[
                  { name: "color", label: "Background Color", icon: "PaletteIcon" },
                  {
                    name: "image",
                    label: "Add Image",
                    icon: "ImageIcon",
                  },
                  {
                    name: "archive",
                    label: "Archive",
                    icon: "ArchiveIcon",
                  },
                  {
                    name: "delete",
                    label: "Delete",
                    icon: "TrashIcon",
                  },
                ].map((item) => (
                  <Tooltip key={item.name}>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" type="button" onClick={() => activateAction(item.name)}>
                        <IconsComponent customClass="cursor-pointer" icon={item.icon} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">{item.label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <Button type="reset" variant="outline" onClick={handleReset}>
                Cancel
              </Button>
              <Button type="submit">Submit</Button>
            </DialogFooter>
          </form>

          <CustomPopover
            controlRef={popoverRef}
            content={
              <div className="w-fit">
                Color
                <div className="flex space-x-2">
                  <Button className="flex-1" onClick={() => popoverRef.current?.close()}>
                    Close from Within
                  </Button>
                  <Button className="flex-1" variant="outline" onClick={() => popoverRef.current?.close()}>
                    Close from Outside
                  </Button>
                </div>
              </div>
            }
          />
        </DialogContent>
      </DialogOverlay>
      {renderInputField()}
    </Dialog>
  );
}

export default noteeditor;
