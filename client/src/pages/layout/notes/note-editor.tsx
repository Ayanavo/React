import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import imageFile from "@/hooks/image-file";
import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";
import { State } from "./state";
import { CustomPopover } from "@/hooks/popover-content";

function noteeditor({ setIsOpen, isOpen, formData, onSave }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; formData?: State; onSave: (note: State) => void }) {
  const { image, renderInputField, activateInput } = imageFile();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<{ open: () => void; close: () => void }>(null);
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: formData?.title ?? "",
      description: formData?.description ?? "",
    },
  });

  const { reset, register, handleSubmit, setValue } = form;

  useEffect(() => {
    reset({
      title: formData?.title ?? "",
      description: formData?.description ?? "",
    });
  }, [formData, isOpen, reset]);

  const handleInput = () => {
    if ((textareaRef as any).current) {
      (textareaRef as any).current.style.height = "auto";
      (textareaRef as any).current.style.height = `${(textareaRef as any).current.scrollHeight}px`;
    }
  };

  const onSubmit: SubmitHandler<{
    title: string;
    description: string;
  }> = (data) => {
    const newNote = { title: data.title, description: data.description } as State;
    onSave(newNote);
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
      case "voice":
        toggleVoice();
        break;
      default:
        break;
    }
  }

  const toggleVoice = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = sessionStorage.getItem("language") ?? "en-US";
    recog.interimResults = true;
    recog.maxAlternatives = 1;

    let interimTranscript = "";
    let finalTranscript = "";

    recog.onresult = (event: any) => {
      interimTranscript = "";
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const res = event.results[i];
        if (res.isFinal) {
          finalTranscript += res[0].transcript;
        } else {
          interimTranscript += res[0].transcript;
        }
      }
      const combined = `${finalTranscript} ${interimTranscript}`.trim();
      setValue("description", combined);
      if ((textareaRef as any).current) {
        (textareaRef as any).current.value = combined;
        (textareaRef as any).current.style.height = "auto";
        (textareaRef as any).current.style.height = `${(textareaRef as any).current.scrollHeight}px`;
      }
    };

    recog.onend = () => {
      setListening(false);
    };

    recog.onerror = (err: any) => {
      console.error("Speech recognition error", err);
      setListening(false);
    };

    recognitionRef.current = recog;
    recog.start();
    setListening(true);
  };

  return (
    <Dialog open={!!isOpen} onOpenChange={handleReset}>
      <DialogTrigger asChild>
        <Button className="hidden"></Button>
      </DialogTrigger>
      <DialogContent className="relative">
        {image && <img alt="Attachment" className="w-16 h-16 rounded absolute top-4 left-4 object-cover" src={image} />}
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              <input type="text" {...register("title")} className="w-full outline-none resize-none py-2 shad-background shad-color shad-border" placeholder="Title" />
            </DialogTitle>
          </DialogHeader>
          <DialogDescription>
            {/** capture register object so we can attach a ref and still update via form.setValue */}
            {(() => {
              const descriptionReg = register("description");
              return (
                <textarea
                  {...descriptionReg}
                  ref={(e) => {
                    descriptionReg.ref(e);
                    (textareaRef as any).current = e as HTMLTextAreaElement;
                  }}
                  className="w-full min-h-[100px] rounded-md overflow-hidden outline-none resize-none shad-background shad-color shad-border"
                  onChange={(ev) => {
                    descriptionReg.onChange(ev as any);
                    handleInput();
                  }}
                  placeholder="Description"
                />
              );
            })()}
          </DialogDescription>

          <DialogFooter>
            <div className="flex items-center space-x-2">
              {[
                { name: "color", label: "Background Color", icon: "PaletteIcon" },
                { name: "image", label: "Add Image", icon: "ImageIcon" },
                { name: "voice", label: listening ? "Stop Voice" : "Voice Input", icon: "Mic" },
                { name: "archive", label: "Archive", icon: "ArchiveIcon" },
                { name: "delete", label: "Delete", icon: "TrashIcon" },
              ]
                .filter((it) => it.name !== "delete" || !!formData)
                .map((item) => (
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
      {renderInputField()}
    </Dialog>
  );
}

export default noteeditor;
