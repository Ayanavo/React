import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import showToast from "@/hooks/toast";
import { CVElement, CVProvider, useCV } from "@/lib/useCV";
import { fetchCVBuilderById, submitCV, updateCV, type CVSubmitPayload } from "@/shared/services/cvbuilder";
import { useMutation, useQuery } from "@tanstack/react-query";
import React, { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Canvas from "../cv-builder/canvas";
import Pallet from "../cv-builder/pallet";

type CVTag = "Latest" | "Important" | "Draft";

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
  const { elements, pageProperties, commitEdits, loadCVState } = useCV();
  const navigate = useNavigate();
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [job, setJob] = useState("");
  const [tag, setTag] = useState<CVTag>("Draft");

  const { data: cvBuilder, isFetching } = useQuery({
    queryKey: ["cv-builder", id],
    queryFn: () => fetchCVBuilderById(id as string),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (cvBuilder?.elements) {
      loadCVState(cvBuilder.elements, cvBuilder.pageProperties);
      setName(cvBuilder.name || "");
      setJob(cvBuilder.job || "");
      setTag((cvBuilder.tag as CVTag) || "Draft");
    }
  }, [cvBuilder, loadCVState]);

  const mutation = useMutation<unknown, Error, CVSubmitPayload>({
    mutationFn: (payload) => (id ? updateCV(id, payload) : submitCV(payload)),
    onSuccess: () => {
      showToast({
        title: isEditMode ? "CV updated successfully" : "CV submitted successfully",
        variant: "success",
      });
      navigate("/cv-builder");
    },
    onError: (error: Error) => {
      showToast({
        title: isEditMode ? "CV update failed" : "CV submission failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const openSubmitDialog = () => {
    commitEdits();
    setName((current) => current || findCVName(elements));
    setIsSubmitDialogOpen(true);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({
      name: name.trim(),
      job: job.trim(),
      tag,
      elements,
      pageProperties,
    });
  };

  return (
    <div className="flex h-[90vh] flex-col overflow-hidden bg-background">
      <div className="flex items-center justify-between px-6 py-3">
        <BreadcrumbInbuild isEditMode={isEditMode} />

        <Button type="button" onClick={openSubmitDialog} disabled={mutation.isPending || isFetching}>
          {mutation.isPending ?
            isEditMode ?
              "Updating..."
            : "Submitting..."
          : isEditMode ?
            "Update CV"
          : "Submit CV"}
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <Pallet />
        <Canvas />
      </div>

      <Dialog open={isSubmitDialogOpen} onOpenChange={setIsSubmitDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle>{isEditMode ? "Update CV" : "Submit CV"}</DialogTitle>
              <DialogDescription>Add the CV details before saving.</DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="cv-name">Name</Label>
              <Input id="cv-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter CV name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cv-job">Job Description</Label>
              <Textarea id="cv-job" value={job} onChange={(event) => setJob(event.target.value)} placeholder="Enter job description" className="min-h-28" />
            </div>

            <div className="space-y-2">
              <Label>Tag</Label>
              <Select value={tag} onValueChange={(value) => setTag(value as CVTag)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tag" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="Important">Important</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsSubmitDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending || !name.trim()}>
                {mutation.isPending ?
                  isEditMode ?
                    "Updating..."
                  : "Submitting..."
                : isEditMode ?
                  "Update"
                : "Submit"}
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
