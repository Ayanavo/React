import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import showToast from "@/hooks/toast";
import { CVElement, CVProvider, useCV } from "@/lib/useCV";
import {
  fetchCoverLetterById,
  generateCoverLetterDraft,
  submitCoverLetter,
  updateCoverLetter,
  type CoverLetterSubmitPayload,
} from "@/shared/services/cover-letter";
import type { GeminiModelId } from "@/shared/services/summarize";
import { getTags, type TagRecord } from "@/shared/services/tag";
import { ApiMessageResponse } from "@/shared/types/api";
import { consumeJobSummaryContext } from "@/shared/utils/job-summary-context";
import {
  mapProfileUserToContactInfo,
  type UserContactInfo,
} from "@/shared/utils/profile-contact";
import { getCurrentUserAPI } from "@/shared/services/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus, Loader2, Save } from "lucide-react";
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../cv-builder/canvas";
import { CvCanvasOverlayProvider } from "../cv-builder/cv-canvas-overlay";
import BuilderWorkspace from "../cv-builder/builder-workspace";
import CoverLetterPallet from "./cover-letter-pallet";
import { applyDraftToTemplate, createCoverLetterTemplate } from "./cover-letter-template";
import "./cover-letter.scss";

type CoverLetterTag = string;

const COVER_LETTER_STORAGE_KEY = "cover-letter-editor-session";
const COVER_LETTER_PAGE_PROPERTIES_KEY = "cover-letter-page-properties";

const findCoverLetterName = (elements: CVElement[]) => {
  const queue = [...elements];

  while (queue.length) {
    const element = queue.shift();
    if (!element) continue;

    if (element.type === "header") {
      const headerContent = element.properties?.headerStyle?.content;
      if (typeof headerContent === "string" && headerContent.trim()) {
        return headerContent.split("\n")[0]?.trim() || "Untitled Cover Letter";
      }
    }

    if (element.type === "text" && typeof element.content === "string" && element.content.trim()) {
      return "Cover Letter";
    }

    if (element.children?.length) {
      queue.push(...element.children);
    }
  }

  return "Untitled Cover Letter";
};

const CoverLetterBuilderContent = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const { elements, pageProperties, commitEdits, loadCVState, setCvName, setOnRequestSave } = useCV();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [tag, setTag] = useState<CoverLetterTag>("");
  const draftInitializedRef = useRef(false);

  const { data: currentUser, isLoading: isProfileLoading } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: getCurrentUserAPI,
    staleTime: 1000 * 60 * 5,
  });

  const contactInfo: UserContactInfo | null = currentUser?.user ?
    mapProfileUserToContactInfo(currentUser.user)
  : null;

  const { data: coverLetter, isFetching } = useQuery({
    queryKey: ["cover-letter", id],
    queryFn: () => fetchCoverLetterById(id as string),
    enabled: Boolean(id),
  });

  const { data: tags = [], isFetching: isTagsFetching } = useQuery<TagRecord[]>({
    queryKey: ["tags"],
    queryFn: getTags,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (coverLetter?.elements) {
      loadCVState(coverLetter.elements, coverLetter.pageProperties);
      setName(coverLetter.name || "");
      setCvName(coverLetter.name || "");
      setJob(coverLetter.job || "");

      const requestedTag = coverLetter.tag || "";
      const selectedTag =
        tags.find((tagItem) => tagItem._id === requestedTag) ?? tags.find((tagItem) => tagItem.name === requestedTag);
      setTag((selectedTag?._id ?? requestedTag) as CoverLetterTag);
    }
  }, [coverLetter, loadCVState, setCvName, tags]);

  useEffect(() => {
    if (isEditMode || draftInitializedRef.current || isProfileLoading) return;
    draftInitializedRef.current = true;

    const jobContext = consumeJobSummaryContext();
    const template = createCoverLetterTemplate(contactInfo);
    const defaultName =
      contactInfo?.fullName ? `${contactInfo.fullName} Cover Letter` : "Cover Letter Draft";

    if (!jobContext) {
      loadCVState(template.elements, template.pageProperties);
      setName(defaultName);
      setCvName(defaultName);
      return;
    }

    const jobText = jobContext.summary?.trim() || jobContext.sourceText?.trim() || "";
    if (jobText) {
      setJob(jobText);
    }

    setIsGeneratingDraft(true);

    generateCoverLetterDraft({
      jobSummary: jobContext.summary,
      sourceText: jobContext.sourceText,
      model: jobContext.model as GeminiModelId | undefined,
    })
      .then((draft) => {
        const seeded = applyDraftToTemplate(template.elements, draft.sections, contactInfo);
        loadCVState(seeded, template.pageProperties);
        setName(defaultName);
        setCvName(defaultName);
      })
      .catch((error) => {
        loadCVState(template.elements, template.pageProperties);
        setName(defaultName);
        setCvName(defaultName);
        showToast({
          title: "Draft generation failed",
          description: error instanceof Error ? error.message : "Loaded blank template instead.",
          variant: "warning",
        });
      })
      .finally(() => {
        setIsGeneratingDraft(false);
      });
  }, [isEditMode, isProfileLoading, contactInfo, loadCVState, setCvName]);

  const buildSubmitPayload = useCallback(
    (): CoverLetterSubmitPayload => ({
      name: name.trim() || coverLetter?.name || findCoverLetterName(elements),
      job: job.trim() || coverLetter?.job || "",
      tag: tag || coverLetter?.tag || "",
      elements,
      pageProperties,
    }),
    [name, job, tag, elements, pageProperties, coverLetter]
  );

  const mutation = useMutation<ApiMessageResponse, Error, CoverLetterSubmitPayload>({
    mutationFn: (payload) => (id ? updateCoverLetter(id, payload) : submitCoverLetter(payload)),
    onSuccess: (data) => {
      showToast({
        title: data?.message || (isEditMode ? "Cover letter updated" : "Cover letter saved"),
        variant: "success",
      });
      setIsSubmitDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["cover-letter-list"] });
      if (id) {
        void queryClient.invalidateQueries({ queryKey: ["cover-letter", id] });
      }
    },
    onError: (error: Error) => {
      showToast({
        title: isEditMode ? "Update failed" : "Save failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const openSubmitDialog = useCallback(() => {
    commitEdits();
    setName((current) => current || findCoverLetterName(elements));
    setTag((current) => current || tags[0]?._id || "");
    setIsSubmitDialogOpen(true);
  }, [commitEdits, elements, tags]);

  useEffect(() => {
    setOnRequestSave(openSubmitDialog);
    return () => setOnRequestSave(null);
  }, [openSubmitDialog, setOnRequestSave]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCvName(name.trim());
    mutation.mutate(buildSubmitPayload());
  };

  return (
    <div className="cover-letter-builder flex h-full min-h-0 flex-col overflow-hidden bg-background">
      <div className="flex flex-none flex-col gap-2 border-b border-border/60 px-4 py-3 md:flex-row md:items-center md:justify-between md:px-6">
        <BreadcrumbInbuild isEditMode={isEditMode} className="w-full min-w-0" />
        <Button
          type="button"
          onClick={openSubmitDialog}
          disabled={mutation.isPending || isFetching || isGeneratingDraft}
          className="ml-auto h-9 shrink-0 gap-2 self-end px-2.5 md:self-auto md:px-4">
          {mutation.isPending || isGeneratingDraft ?
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="hidden md:inline">
                {isGeneratingDraft ? "Generating draft..." : isEditMode ? "Updating..." : "Saving..."}
              </span>
            </>
          : isEditMode ?
            <>
              <Save className="h-4 w-4" />
              <span className="hidden md:inline">Update Cover Letter</span>
            </>
          : <>
              <FilePlus className="h-4 w-4" />
              <span className="hidden md:inline">Save Cover Letter</span>
            </>
          }
        </Button>
      </div>

      {isGeneratingDraft && (
        <div className="flex flex-none items-center gap-2 px-4 pb-2 text-sm text-muted-foreground md:px-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating cover letter draft from job summary...
        </div>
      )}

      <BuilderWorkspace pallet={<CoverLetterPallet />} />

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Update Cover Letter" : "Save Cover Letter"}</DialogTitle>
              <DialogDescription>Add details before saving your cover letter.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="cover-letter-name">Name</Label>
              <Input
                id="cover-letter-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter cover letter name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cover-letter-job">Job Summary</Label>
              <Textarea
                id="cover-letter-job"
                value={job}
                onChange={(event) => setJob(event.target.value)}
                placeholder="Job summary or description"
                className="min-h-28"
              />
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={tag} onValueChange={(value) => setTag(value as CoverLetterTag)} disabled={tags.length === 0}>
                <SelectTrigger>
                  <SelectValue placeholder={isTagsFetching ? "Loading tags..." : "Select tag"} />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tagItem) => (
                    <SelectItem key={tagItem._id} value={tagItem._id}>
                      <span
                        className="mr-2 inline-flex h-2.5 w-2.5 shrink-0 rounded-full border border-border"
                        style={{ backgroundColor: tagItem.color }}
                      />
                      <span>{tagItem.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending || !name.trim()}>
                {mutation.isPending ?
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CoverLetterBuilder = () => {
  return (
    <CVProvider storageKey={COVER_LETTER_STORAGE_KEY} pagePropertiesKey={COVER_LETTER_PAGE_PROPERTIES_KEY}>
      <CvCanvasOverlayProvider>
        <CoverLetterBuilderContent />
      </CvCanvasOverlayProvider>
    </CVProvider>
  );
};

export default CoverLetterBuilder;
