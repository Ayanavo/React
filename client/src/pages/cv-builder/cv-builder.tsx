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
} from "@/shared/services/cvbuilder";
import { getTags, type TagRecord } from "@/shared/services/tag";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FilePlus, Loader2, Save, ScanSearch } from "lucide-react";
import React, { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Canvas from "../cv-builder/canvas";
import Pallet from "../cv-builder/pallet";
import AtsDialog from "./ats-dialog";
import { atsBadgeClassName, atsRecordToResponse, formatAtsBadgeLabel, toAtsAnalysisRecord } from "./ats-utils";
import { extractCVContent } from "./cv-extractor";

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
  const { elements, pageProperties, commitEdits, loadCVState, setCvName, setOnRequestSave } = useCV();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [isAtsDialogOpen, setIsAtsDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [tag, setTag] = useState<CVTag>("");
  const [atsResult, setAtsResult] = useState<AtsCheckResponse | null>(null);
  const [isAtsChecking, setIsAtsChecking] = useState(false);
  const autoAtsAttemptedRef = useRef<string | null>(null);

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
      })
      .catch(() => {
        // Background ATS check is best-effort on load.
      })
      .finally(() => {
        setIsAtsChecking(false);
      });
  }, [id, cvBuilder, isFetching]);

  // Keep a ref to the pending download callback so we can invoke it after mutation succeeds.
  const pendingSaveCallbackRef = useRef<((savedName: string) => void) | null>(null);

  const mutation = useMutation<unknown, Error, CVSubmitPayload>({
    mutationFn: (payload) => (id ? updateCV(id, payload) : submitCV(payload)),
    onSuccess: () => {
      const savedName = name.trim();

      showToast({
        title: isEditMode ? "CV updated successfully" : "CV submitted successfully",
        variant: "success",
      });
      setIsSubmitDialogOpen(false);

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

  // Register the openSubmitDialog as the onRequestSave callback so Canvas can trigger it
  useEffect(() => {
    setOnRequestSave(() => openSubmitDialog);
    return () => setOnRequestSave(null);
  }, [openSubmitDialog, setOnRequestSave]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Sync the name to the context so Canvas can use it for PDF filename
    setCvName(name.trim());
    mutation.mutate({
      name: name.trim(),
      job: job.trim(),
      tag,
      elements,
      pageProperties,
      atsScore: atsResult?.score ?? null,
      atsAnalysis: atsResult ? toAtsAnalysisRecord(atsResult) : null,
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

      <AtsDialog
        open={isAtsDialogOpen}
        onOpenChange={setIsAtsDialogOpen}
        elements={elements}
        pageProperties={pageProperties}
        defaultJobDescription={job}
        initialResult={atsResult}
        onBeforeAnalyze={commitEdits}
        onResultChange={setAtsResult}
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
      <CVBuilderContent />
    </CVProvider>
  );
};

export default CVBuilder;
