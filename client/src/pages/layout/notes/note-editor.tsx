import IconsComponent from "@/common/icons";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import imageFile from "@/hooks/image-file";
import { formatAppDate } from "@/lib/date-format";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import "./note.scss";
import { State } from "./state";
import { CustomPopover } from "@/hooks/popover-content";
import { ColorPickerPanel, getNoteThemeStyle, hasExplicitNoteBackground, useColorPicker } from "@/shared/color-picker";
import showToast from "@/hooks/toast";
import { useConfirmDialog } from "@/shared/confirmation";
import { createNote, deleteNote, updateNote } from "@/shared/services/note";
import { getTags } from "@/shared/services/tag";
import { useQuery } from "@tanstack/react-query";
import { note_actions } from "./note-action-config";
import { mapStateToNotePayload } from "./note-mapper";

function noteeditor({
  setIsOpen,
  isOpen,
  formData,
  onSave,
  onDelete,
  existingNoteCount = 0,
}: {
  setIsOpen: (arg: boolean) => void;
  isOpen: boolean;
  formData?: State;
  onSave: () => void;
  onDelete: () => void;
  existingNoteCount?: number;
}) {
  const { image, renderInputField, activateInput, clearImage, setImage } = imageFile();
  const { confirm } = useConfirmDialog();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const voiceTargetRef = useRef<"title" | "description">("description");
  const popoverRef = useRef<{ open: () => void; close: () => void }>(null);
  const tagPopoverRef = useRef<{ open: () => void; close: () => void }>(null);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const tagButtonRef = useRef<HTMLButtonElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceHoverRef = useRef(false);
  const voiceRestartTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const voiceStopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [listening, setListening] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const { color: noteColor, onHexChange: setNoteColor } = useColorPicker(formData?.backgroundColor);
  const hasCustomBackground = hasExplicitNoteBackground(noteColor);
  const noteThemeStyle = getNoteThemeStyle(noteColor);
  const modifiedDate = formatAppDate(formData?.updatedAt, true);
  const form = useForm<{
    title: string;
    description: string;
    tag: string;
  }>({
    defaultValues: {
      title: formData?.title ?? "",
      description: formData?.description ?? "",
      tag: formData?.tag ?? "",
    },
  });

  const { reset, register, handleSubmit, setValue, getValues, watch } = form;
  const selectedTag = watch("tag");

  const { data: tags = [], isFetching: isTagsFetching } = useQuery({
    queryKey: ["tags"],
    queryFn: getTags,
  });

  const applyVoiceText = (target: "title" | "description", text: string) => {
    setValue(target, text);
    if (target === "description" && textareaRef.current) {
      textareaRef.current.value = text;
      resizeDescriptionField();
    } else if (target === "title" && titleInputRef.current) {
      titleInputRef.current.value = text;
    }
  };

  const clearVoiceRestart = () => {
    if (!voiceRestartTimeoutRef.current) return;
    clearTimeout(voiceRestartTimeoutRef.current);
    voiceRestartTimeoutRef.current = null;
  };

  const clearVoiceStop = () => {
    if (!voiceStopTimeoutRef.current) return;
    clearTimeout(voiceStopTimeoutRef.current);
    voiceStopTimeoutRef.current = null;
  };

  useEffect(() => {
    if (!isOpen) return;

    reset({
      title: formData?.title ?? "",
      description: formData?.description ?? "",
      tag: formData?.tag ?? "",
    });
    setNoteColor(formData?.backgroundColor);

    if (formData?.image?.[0]) {
      setImage(formData.image[0]);
    } else {
      clearImage();
    }

    requestAnimationFrame(() => {
      resizeDescriptionField();
    });
  }, [formData, isOpen, reset, setNoteColor, setImage, clearImage]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    if (isMaximized) {
      textarea.style.height = "";
      textarea.style.overflowY = "";
      return;
    }

    requestAnimationFrame(() => {
      resizeDescriptionField();
    });
  }, [isMaximized]);

  useEffect(() => {
    if (isOpen) return;

    setIsMaximized(false);
    voiceHoverRef.current = false;
    clearVoiceRestart();
    clearVoiceStop();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, [isOpen]);

  useEffect(() => {
    return () => {
      voiceHoverRef.current = false;
      clearVoiceRestart();
      clearVoiceStop();
      recognitionRef.current?.stop();
    };
  }, []);

  const resizeDescriptionField = () => {
    const textarea = textareaRef.current;
    if (!textarea || isMaximized) return;

    textarea.style.height = "auto";
    textarea.style.overflowY = "hidden";
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleInput = () => {
    resizeDescriptionField();
  };

  const onSubmit: SubmitHandler<{
    title: string;
    description: string;
    tag: string;
  }> = async (data) => {
    const isNewNote = !formData?._id;
    const trimmedTitle = data.title.trim();
    const title = trimmedTitle || (isNewNote ? `Note #${existingNoteCount + 1}` : "");

    const payload = mapStateToNotePayload(
      { title, description: data.description, backgroundColor: noteColor, tag: data.tag },
      image
    );

    try {
      setIsSaving(true);
      const response =
        formData?._id ? await updateNote(formData._id, payload) : await createNote(payload);
      onSave();
      showToast({
        title: response?.message || (formData?._id ? "Note updated successfully" : "Note created successfully"),
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
      const response = await deleteNote(formData._id);
      showToast({ title: response?.message || "Note deleted successfully", variant: "success" });
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
      case "tag":
        tagPopoverRef.current?.open();
        break;
      case "image":
        activateInput();
        break;
      case "voice":
        break;
      case "delete":
        handleDelete();
        break;
      default:
        break;
    }
  }

  const stopVoiceImmediate = () => {
    clearVoiceRestart();
    clearVoiceStop();
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  };

  const handleVoicePointerEnter = () => {
    clearVoiceStop();
    voiceHoverRef.current = true;
    startVoice();
  };

  const handleVoicePointerLeave = () => {
    voiceHoverRef.current = false;
    clearVoiceStop();
    voiceStopTimeoutRef.current = setTimeout(() => {
      voiceStopTimeoutRef.current = null;
      if (!voiceHoverRef.current) {
        stopVoiceImmediate();
      }
    }, 200);
  };

  const startVoice = () => {
    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (recognitionRef.current || voiceRestartTimeoutRef.current) return;

    clearVoiceRestart();

    const target = voiceTargetRef.current;
    const baseline = getValues(target)?.trim() ?? "";
    const recog = new SpeechRecognition();
    recog.lang = sessionStorage.getItem("language") ?? "en-US";
    recog.continuous = true;
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
      recognitionRef.current = null;
      if (!voiceHoverRef.current) {
        setListening(false);
        return;
      }

      voiceRestartTimeoutRef.current = setTimeout(() => {
        voiceRestartTimeoutRef.current = null;
        if (voiceHoverRef.current) {
          startVoice();
        } else {
          setListening(false);
        }
      }, 100);
    };

    recog.onerror = (err: any) => {
      console.error("Speech recognition error", err);
      if (err.error === "aborted") return;
      if (voiceHoverRef.current) {
        recognitionRef.current = null;
        voiceRestartTimeoutRef.current = setTimeout(() => {
          voiceRestartTimeoutRef.current = null;
          if (voiceHoverRef.current) startVoice();
        }, 250);
      }
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
      <DialogContent
        className={cn(
          "note-box note-editor-dialog transition-colors flex min-w-0 flex-col gap-0 overflow-hidden border",
          !isMaximized && "note-editor-dialog--minimized",
          isMaximized && "note-editor-dialog--maximized max-w-none",
          hasCustomBackground && "note-box--themed"
        )}
        style={noteThemeStyle}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className={cn(
                "absolute right-11 top-3 z-10 h-7 w-7 sm:right-12 sm:top-4 sm:h-8 sm:w-8",
                hasCustomBackground && "note-action-btn"
              )}
              onClick={() => setIsMaximized((value) => !value)}
              aria-label={isMaximized ? "Minimize note" : "Maximize note"}>
              {isMaximized ?
                <Minimize2 className="h-4 w-4" />
              : <Maximize2 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">{isMaximized ? "Minimize" : "Maximize"}</TooltipContent>
        </Tooltip>
        {image && (
          <div className="mb-2 shrink-0">
            <div className="relative w-16 h-16">
              <img alt="Attachment" className="w-16 h-16 rounded object-cover border shadow-sm" src={image} />
              <Button
                type="button"
                variant="secondary"
                size="icon"
                className="absolute -top-1.5 -right-1.5 h-5 w-5 rounded-full shadow-sm"
                onClick={clearImage}
                aria-label="Remove image">
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        )}
        {modifiedDate && (
          <p className={cn("mb-1 text-xs", hasCustomBackground ? "note-muted" : "text-muted-foreground/70")}>
            Modified {modifiedDate}
          </p>
        )}
        <form className={cn("min-w-0 flex flex-col", isMaximized && "min-h-0 flex-1")} onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="p-0 text-left">
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
                    className="note-field note-title"
                    placeholder="Title"
                  />
                );
              })()}
            </DialogTitle>
          </DialogHeader>
          <div className={cn("mt-1", isMaximized && "flex min-h-0 flex-1 flex-col")}>
            {(() => {
              const descriptionReg = register("description");
              return (
                <textarea
                  {...descriptionReg}
                  ref={(e) => {
                    descriptionReg.ref(e);
                    (textareaRef as any).current = e as HTMLTextAreaElement;
                  }}
                  className={cn("note-field note-description", isMaximized && "note-description--expanded flex-1 min-h-0")}
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
          </div>

          <DialogFooter className="note-editor-footer shrink-0 !flex-row flex-nowrap items-center justify-between gap-2 overflow-x-auto">
            <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
              {note_actions
                .filter((it) => it.name !== "delete" || !!formData)
                .map((item) => {
                  if (!item.active) return null;

                  if (item.name === "voice") {
                    return (
                      <div
                        key={item.name}
                        className="inline-flex"
                        onPointerEnter={handleVoicePointerEnter}
                        onPointerLeave={handleVoicePointerLeave}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              type="button"
                              className={cn(hasCustomBackground && "note-action-btn", listening && "border-primary text-primary")}
                              onClick={(event) => event.preventDefault()}>
                              <IconsComponent customClass="cursor-pointer" icon={item.icon} />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="bottom">{item.label}</TooltipContent>
                        </Tooltip>
                      </div>
                    );
                  }

                  return (
                    <Tooltip key={item.name}>
                      <TooltipTrigger asChild>
                        <Button
                          ref={
                            item.name === "color" ? colorButtonRef
                            : item.name === "tag" ? tagButtonRef
                            : undefined
                          }
                          variant="outline"
                          size="icon"
                          type="button"
                          className={cn(
                            hasCustomBackground && "note-action-btn",
                            item.name === "tag" && selectedTag && "border-primary text-primary"
                          )}
                          disabled={item.name === "delete" && isDeleting}
                          onClick={() => activateAction(item.name)}>
                          <IconsComponent customClass="cursor-pointer" icon={item.icon} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                })}
            </div>
            <div className="flex shrink-0 items-center gap-2">
            <Button type="reset" variant="outline" size="sm" className={cn("h-9 px-3 sm:h-10 sm:px-4", hasCustomBackground && "note-action-btn")} onClick={handleReset}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="h-9 px-3 sm:h-10 sm:px-4" disabled={isSaving}>
              {isSaving ? "Saving..." : "Submit"}
            </Button>
            </div>
          </DialogFooter>
        </form>

        <CustomPopover
          controlRef={popoverRef}
          anchorRef={colorButtonRef}
          className="w-auto p-0 pointer-events-auto"
          content={<ColorPickerPanel color={noteColor} onChange={setNoteColor} />}
        />
        <CustomPopover
          controlRef={tagPopoverRef}
          anchorRef={tagButtonRef}
          className="w-56 p-3 pointer-events-auto"
          content={
            <div className="space-y-2">
              <p className="text-sm font-medium">Tag</p>
              <Select
                value={selectedTag || "none"}
                onValueChange={(value) => setValue("tag", value === "none" ? "" : value, { shouldDirty: true })}
                disabled={isTagsFetching || tags.length === 0}>
                <SelectTrigger className="h-9 w-full [&>span]:flex [&>span]:items-center">
                  <SelectValue placeholder={isTagsFetching ? "Loading tags..." : "Select tag"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tag</SelectItem>
                  {tags.map((tagItem) => (
                    <SelectItem key={tagItem._id} value={tagItem._id}>
                      <ColoredSelectLabel color={tagItem.color} label={tagItem.name} />
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!isTagsFetching && tags.length === 0 ?
                <p className="text-xs text-muted-foreground">Create tags from the Tags page first.</p>
              : null}
            </div>
          }
        />
      </DialogContent>
      {renderInputField()}
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

export default noteeditor;
