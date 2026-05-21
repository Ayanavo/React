import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import imageFile from "@/hooks/image-file";
import { formatAppDate } from "@/lib/date-format";
import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";
import { State } from "./state";
import { CustomPopover } from "@/hooks/popover-content";
import { ColorPickerPanel, useColorPicker } from "@/shared/color-picker";
import showToast from "@/hooks/toast";
import { useConfirmDialog } from "@/shared/confirmation";
import { createNote, deleteNote, updateNote } from "@/shared/services/note";
import { note_actions } from "./note-action-config";
import { mapStateToNotePayload } from "./note-mapper";

function noteeditor({ setIsOpen, isOpen, formData, onSave, onDelete }: { setIsOpen: (arg: boolean) => void; isOpen: boolean; formData?: State; onSave: () => void; onDelete: () => void }) {
  const { image, renderInputField, activateInput, clearImage, setImage } = imageFile();
  const { confirm } = useConfirmDialog();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const voiceTargetRef = useRef<"title" | "description">("description");
  const popoverRef = useRef<{ open: () => void; close: () => void }>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<any>(null);
  const [listening, setListening] = useState(false);
  const { color: noteColor, onHexChange: setNoteColor } = useColorPicker(formData?.backgroundColor);
  const modifiedDate = formatAppDate(formData?.updatedAt);
  const form = useForm<{
    title: string;
    description: string;
  }>({
    defaultValues: {
      title: formData?.title ?? "",
      description: formData?.description ?? "",
    },
  });

  const { reset, register, handleSubmit, setValue, getValues } = form;

  const applyVoiceText = (target: "title" | "description", text: string) => {
    setValue(target, text);
    if (target === "description" && textareaRef.current) {
      textareaRef.current.value = text;
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    } else if (target === "title" && titleInputRef.current) {
      titleInputRef.current.value = text;
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    reset({
      title: formData?.title ?? "",
      description: formData?.description ?? "",
    });
    setNoteColor(formData?.backgroundColor);

    if (formData?.image?.[0]) {
      setImage(formData.image[0]);
    } else {
      clearImage();
    }
  }, [formData, isOpen, reset, setNoteColor, setImage, clearImage]);

  const handleInput = () => {
    if ((textareaRef as any).current) {
      (textareaRef as any).current.style.height = "auto";
      (textareaRef as any).current.style.height = `${(textareaRef as any).current.scrollHeight}px`;
    }
  };

  const onSubmit: SubmitHandler<{
    title: string;
    description: string;
  }> = async (data) => {
    const payload = mapStateToNotePayload({ title: data.title, description: data.description, backgroundColor: noteColor }, image);

    try {
      setIsSaving(true);
      formData?._id ? await updateNote(formData._id, payload) : await createNote(payload);
      onSave();
      showToast({
        title: formData?._id ? "Note updated successfully" : "Note created successfully",
        variant: "success",
      });
    } catch (error) {
      showToast({
        title: formData?._id ? "Note update failed" : "Note creation failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setIsOpen(false);
  };

  const handleDelete = async () => {
    if (!formData?._id) return;

    const accepted = await confirm({
      title: "Delete Note",
      message: "Are you sure you want to delete this note? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
    });

    if (!accepted) return;

    try {
      setIsDeleting(true);
      await deleteNote(formData._id);
      showToast({
        title: "Note deleted successfully",
        variant: "success",
      });
      onDelete();
    } catch (error) {
      showToast({
        title: "Note deletion failed",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "error",
      });
    } finally {
      setIsDeleting(false);
    }
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
      case "delete":
        handleDelete();
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

    const target = voiceTargetRef.current;
    const baseline = getValues(target)?.trim() ?? "";
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
      const spoken = `${finalTranscript} ${interimTranscript}`.trim();
      const combined = [baseline, spoken].filter(Boolean).join(" ").trim();
      applyVoiceText(target, combined);
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
      <DialogContent className="note-box transition-colors flex flex-col gap-0" style={{ backgroundColor: noteColor }}>
        {image && (
          <div className="mb-2 shrink-0">
            <div className="relative w-16 h-16">
              <img alt="Attachment" className="w-16 h-16 rounded object-cover border shadow-sm" src={image} />
              <Button type="button" variant="secondary" size="icon" className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full shadow-sm" onClick={clearImage} aria-label="Remove image">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {modifiedDate && <p className="mb-1 text-xs text-muted-foreground/70">Modified {modifiedDate}</p>}
        <form className="min-w-0 flex-1" onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {(() => {
                const titleReg = register("title");
                return (
                  <input
                    type="text"
                    {...titleReg}
                    ref={(e) => {
                      titleReg.ref(e);
                      (titleInputRef as React.MutableRefObject<HTMLInputElement | null>).current = e;
                    }}
                    onFocus={() => {
                      voiceTargetRef.current = "title";
                    }}
                    className="w-full outline-none resize-none py-2 shad-background shad-color shad-border"
                    placeholder="Title"
                  />
                );
              })()}
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
                  className="w-full min-h-[100px] overflow-hidden outline-none resize-none shad-background shad-color shad-border"
                  onFocus={() => {
                    voiceTargetRef.current = "description";
                  }}
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
              {note_actions
                .filter((it) => it.name !== "delete" || !!formData)
                .map(
                  (item) =>
                    item.active && (
                      <Tooltip key={item.name}>
                        <TooltipTrigger asChild>
                          <Button ref={item.name === "color" ? colorButtonRef : undefined} variant="outline" size="icon" type="button" disabled={item.name === "delete" && isDeleting} onClick={() => activateAction(item.name)}>
                            <IconsComponent customClass="cursor-pointer" icon={item.icon} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">{item.name === "voice" && listening ? "Stop Voice" : item.label}</TooltipContent>
                      </Tooltip>
                    )
                )}
            </div>
            <Button type="reset" variant="outline" onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Submit"}
            </Button>
          </DialogFooter>
        </form>

        <CustomPopover controlRef={popoverRef} anchorRef={colorButtonRef} className="w-auto p-0 pointer-events-auto" content={<ColorPickerPanel color={noteColor} onChange={setNoteColor} />} />
      </DialogContent>
      {renderInputField()}
    </Dialog>
  );
}

export default noteeditor;
