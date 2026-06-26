import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
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
  checkAtsScore,
  fetchCVBuilderById,
  submitCV,
  updateCV,
  type AtsCheckResponse,
  type CVSubmitPayload,
  type CVTemplateRecord,
} from "@/shared/services/cvbuilder";
import { ApiMessageResponse } from "@/shared/types/api";
import { getTags, type TagRecord } from "@/shared/services/tag";
import { useConfirmDialog } from "@/shared/confirmation";
import { consumeJobSummaryContext } from "@/shared/utils/job-summary-context";
import {
  mapProfileUserToContactInfo,
  seedEmptyCvWithProfile,
} from "@/shared/utils/profile-contact";
import { getCurrentUserAPI } from "@/shared/services/auth";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FilePlus, LayoutTemplate, Loader2, Save, ScanSearch } from "lucide-react";
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../cv-builder/canvas";
import { CvCanvasOverlayProvider } from "./cv-canvas-overlay";
import Pallet from "../cv-builder/pallet";
import AtsDialog from "./ats-dialog";
import CvTemplateDialog from "./cv-template-dialog";
import { atsBadgeClassName, atsRecordToResponse, formatAtsBadgeLabel, toAtsAnalysisRecord } from "./ats-utils";
import { extractCVContent } from "./cv-extractor";
import { hasMeaningfulCvContent, regenerateElementIds } from "./cv-template-utils";

type CVTag = string;

const findCVName = (elements: CVElement[]) => {
  const queue = [...elements];

  while (queue.length) {
    const element = queue.shift();
    if (!element) continue;

    if (element.type === "text" && typeof element.content === "string" && element.content.trim()) {
      return element.content.trim();
    }

    if (element.children?.length) {
      queue.push(...element.children);
    }
  }

  return "Untitled CV";
};

const CVBuilderContent = () => {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const queryClient = useQueryClient();
  const { confirm } = useConfirmDialog();
  const { elements, pageProperties, commitEdits, loadCVState, setCvName, setOnRequestSave } = useCV();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAtsDialogOpen, setIsAtsDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [tag, setTag] = useState<CVTag>("");
  const [atsResult, setAtsResult] = useState<AtsCheckResponse | null>(null);
  const [isAtsChecking, setIsAtsChecking] = useState(false);
  const autoAtsAttemptedRef = useRef<string | null>(null);
  const profileSeededRef = useRef(false);

  const { data: currentUser, isLoading: isProfileLoading } = useQuery({
    queryKey: ["current-user-profile"],
    queryFn: getCurrentUserAPI,
    staleTime: 1000 * 60 * 5,
  });

  const { data: cvBuilder, isFetching } = useQuery({
    queryKey: ["cv-builder", id],
    queryFn: () => fetchCVBuilderById(id as string),
    enabled: Boolean(id),
  });

  const { data: tags = [], isFetching: isTagsFetching } = useQuery<TagRecord[]>({
    queryKey: ["tags"],
    queryFn: getTags,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (cvBuilder?.elements) {
      loadCVState(cvBuilder.elements, cvBuilder.pageProperties);
      setName(cvBuilder.name || "");
      setCvName(cvBuilder.name || "");
      setJob(cvBuilder.job || "");

      const requestedTag = cvBuilder.tag || "";
      const selectedTag =
        tags.find((tagItem) => tagItem._id === requestedTag) ?? tags.find((tagItem) => tagItem.name === requestedTag);
      setTag((selectedTag?._id ?? requestedTag) as CVTag);

      if (cvBuilder.atsAnalysis) {
        setAtsResult(atsRecordToResponse(cvBuilder.atsAnalysis));
      } else if (typeof cvBuilder.atsScore === "number") {
        setAtsResult({
          score: cvBuilder.atsScore,
          ranking: "Saved",
          summary: "",
          strengths: [],
          gaps: [],
          recommendations: [],
          model: "gemini-2.5-flash",
        });
      } else {
        setAtsResult(null);
      }
    }
  }, [cvBuilder, loadCVState, setCvName, tags]);

  useEffect(() => {
    if (isEditMode) return;

    const jobContext = consumeJobSummaryContext();
    if (!jobContext) return;

    const jobText = jobContext.summary?.trim() || jobContext.sourceText?.trim() || "";
    if (jobText) {
      setJob(jobText);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode || profileSeededRef.current || isProfileLoading || isFetching) return;
    if (!currentUser?.user) return;
    if (!hasMeaningfulCvContent(elements)) {
      const contactInfo = mapProfileUserToContactInfo(currentUser.user);
      const seeded = seedEmptyCvWithProfile(elements, contactInfo);
      loadCVState(seeded, pageProperties);
      if (contactInfo.fullName) {
        const suggestedName = `${contactInfo.fullName} CV`;
        setName(suggestedName);
        setCvName(suggestedName);
      }
      profileSeededRef.current = true;
    }
  }, [
    isEditMode,
    isProfileLoading,
    isFetching,
    currentUser,
    elements,
    pageProperties,
    loadCVState,
    setCvName,
  ]);

  const buildSubmitPayload = useCallback(
    (ats: AtsCheckResponse | null): CVSubmitPayload => ({
      name: name.trim() || cvBuilder?.name || findCVName(elements),
      job: job.trim() || cvBuilder?.job || "",
      tag: tag || cvBuilder?.tag || "",
      elements,
      pageProperties,
      atsScore: ats?.score ?? null,
      atsAnalysis: ats ? toAtsAnalysisRecord(ats) : null,
    }),
    [name, job, tag, elements, pageProperties, cvBuilder]
  );

  const persistAtsScore = useCallback(
    async (result: AtsCheckResponse, payloadOverride?: CVSubmitPayload) => {
      if (!id) return;

      try {
        const payload = payloadOverride ?? buildSubmitPayload(result);
        await updateCV(id, payload);
        await queryClient.invalidateQueries({ queryKey: ["cv-builder", id] });
        await queryClient.invalidateQueries({ queryKey: ["cv-builder-list"] });
      } catch {
        // ATS persistence is best-effort; the score remains visible in the editor.
      }
    },
    [id, buildSubmitPayload, queryClient]
  );

  useEffect(() => {
    if (!id || !cvBuilder || isFetching) return;
    if (autoAtsAttemptedRef.current === id) return;

    if (cvBuilder.atsAnalysis || typeof cvBuilder.atsScore === "number") {
      autoAtsAttemptedRef.current = id;
      return;
    }

    const jobDescription = cvBuilder.job?.trim();
    if (!jobDescription) {
      autoAtsAttemptedRef.current = id;
      return;
    }

    const extracted = extractCVContent(cvBuilder.elements, cvBuilder.pageProperties ?? {});
    if (!extracted.text.trim()) {
      autoAtsAttemptedRef.current = id;
      return;
    }

    autoAtsAttemptedRef.current = id;
    setIsAtsChecking(true);

    checkAtsScore({
      cvText: extracted.text,
      jobDescription,
      colors: extracted.colors,
      pageProperties: extracted.pageProperties,
    })
      .then((result) => {
        setAtsResult(result);
        void persistAtsScore(result, {
          name: cvBuilder.name || "",
          job: cvBuilder.job || "",
          tag: cvBuilder.tag || "",
          elements: cvBuilder.elements,
          pageProperties: cvBuilder.pageProperties ?? {},
          atsScore: result.score,
          atsAnalysis: toAtsAnalysisRecord(result),
        });
      })
      .catch(() => {
        // Background ATS check is best-effort on load.
      })
      .finally(() => {
        setIsAtsChecking(false);
      });
  }, [id, cvBuilder, isFetching, persistAtsScore]);

  // Keep a ref to the pending download callback so we can invoke it after mutation succeeds.
  const pendingSaveCallbackRef = useRef<((savedName: string) => void) | null>(null);

  const mutation = useMutation<ApiMessageResponse, Error, CVSubmitPayload>({
    mutationFn: (payload) => (id ? updateCV(id, payload) : submitCV(payload)),
    onSuccess: (data) => {
      const savedName = name.trim();

      showToast({
        title: data?.message || (isEditMode ? "CV updated successfully" : "CV submitted successfully"),
        variant: "success",
      });
      setIsSubmitDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["cv-builder-list"] });
      if (id) {
        void queryClient.invalidateQueries({ queryKey: ["cv-builder", id] });
      }

      // If there's a pending download callback, invoke it now that the save is complete
      if (pendingSaveCallbackRef.current) {
        const pendingSaveCallback = pendingSaveCallbackRef.current;
        pendingSaveCallbackRef.current = null;
        window.setTimeout(() => pendingSaveCallback(savedName), 0);
      }
    },
    onError: (error: Error) => {
      showToast({
        title: isEditMode ? "CV update failed" : "CV submission failed",
        description: error.message,
        variant: "error",
      });
      pendingSaveCallbackRef.current = null;
    },
  });

  const openSubmitDialog = useCallback(
    (downloadCallback?: (savedName: string) => void) => {
      commitEdits();
      setName((current) => current || findCVName(elements));
      setTag((current) => current || tags[0]?._id || "");
      if (downloadCallback) {
        pendingSaveCallbackRef.current = downloadCallback;
      }
      setIsSubmitDialogOpen(true);
    },
    [commitEdits, elements, tags]
  );

  // Register openSubmitDialog so Canvas can trigger save-before-download.
  useEffect(() => {
    setOnRequestSave(openSubmitDialog);
    return () => setOnRequestSave(null);
  }, [openSubmitDialog, setOnRequestSave]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Sync the name to the context so Canvas can use it for PDF filename
    setCvName(name.trim());
    mutation.mutate(buildSubmitPayload(atsResult));
  };

  const handleTemplateSelect = async (template: CVTemplateRecord) => {
    commitEdits();

    if (hasMeaningfulCvContent(elements)) {
      const accepted = await confirm({
        title: "Replace CV content?",
        message: "Applying a template will replace your current canvas content. This cannot be undone unless you save first.",
        confirmText: "Apply template",
        cancelText: "Cancel",
      });

      if (!accepted) return;
    }

    const nextName = `${template.name} CV`;
    loadCVState(regenerateElementIds(template.elements), template.pageProperties);
    setName(nextName);
    setCvName(nextName);
    setAtsResult(null);
    setIsTemplateDialogOpen(false);

    showToast({
      title: "Template applied",
      description: `${template.name} layout loaded onto the canvas.`,
      variant: "success",
    });
  };

  return (
    <div className="flex h-[90vh] flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <BreadcrumbInbuild isEditMode={isEditMode} />

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsTemplateDialogOpen(true)}
            disabled={isFetching}
            className="gap-2">
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAtsDialogOpen(true)}
            disabled={isFetching || isAtsChecking}
            className="gap-2">
            {isAtsChecking ?
              <Loader2 className="h-4 w-4 animate-spin" />
            : <ScanSearch className="h-4 w-4" />}
            Check ATS
            {atsResult && !isAtsChecking ?
              <Badge className={atsBadgeClassName(atsResult.score)}>{formatAtsBadgeLabel(atsResult.score)}</Badge>
            : null}
          </Button>
          <Button type="button" onClick={() => openSubmitDialog()} disabled={mutation.isPending || isFetching}>
            {mutation.isPending ?
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditMode ? "Updating..." : "Submitting..."}
              </>
            : isEditMode ?
              <>
                <Save className="mr-2 h-4 w-4" />
                Update CV
              </>
            : <>
                <FilePlus className="mr-2 h-4 w-4" />
                Submit CV
              </>
            }
          </Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Pallet />
        <Canvas />
      </div>

      <CvTemplateDialog
        open={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        onSelect={handleTemplateSelect}
      />

      <AtsDialog
        open={isAtsDialogOpen}
        onOpenChange={setIsAtsDialogOpen}
        elements={elements}
        pageProperties={pageProperties}
        defaultJobDescription={job}
        initialResult={atsResult}
        onBeforeAnalyze={commitEdits}
        onResultChange={setAtsResult}
        onAnalysisComplete={persistAtsScore}
      />

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Update CV" : "Submit CV"}</DialogTitle>
              <DialogDescription>Add the CV details before saving.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="cv-name">Name</Label>
              <Input
                id="cv-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter CV name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-job">Job Description</Label>
              <Textarea
                id="cv-job"
                value={job}
                onChange={(event) => setJob(event.target.value)}
                placeholder="Enter job description"
                className="min-h-28"
              />
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={tag} onValueChange={(value) => setTag(value as CVTag)} disabled={tags.length == 0}>
                <SelectTrigger>
                  <SelectValue placeholder={isTagsFetching ? "Loading tags..." : "Select tag"} />
                </SelectTrigger>
                <SelectContent>
                  {tags.map((tagItem) => (
                    <SelectItem key={tagItem._id} value={tagItem._id} className="pl-0">
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
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                : isEditMode ?
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Update
                  </>
                : <>
                    <FilePlus className="mr-2 h-4 w-4" />
                    Submit
                  </>
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CVBuilder = () => {
  return (
    <CVProvider>
      <CvCanvasOverlayProvider>
        <CVBuilderContent />
      </CvCanvasOverlayProvider>
    </CVProvider>
  );
};

export default CVBuilder;
