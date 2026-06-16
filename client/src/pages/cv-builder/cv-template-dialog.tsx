import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import showToast from "@/hooks/toast";
import type { CVTemplateRecord } from "@/shared/services/cvbuilder";
import { fetchCVTemplates } from "@/shared/services/cvbuilder";
import { useQuery } from "@tanstack/react-query";
import {
  Briefcase,
  Code2,
  GraduationCap,
  LayoutTemplate,
  Megaphone,
  Palette,
  Server,
  type LucideIcon,
} from "lucide-react";
import React from "react";
import { getTemplateSectionPreview } from "./cv-template-utils";

const TEMPLATE_ICONS: Record<string, LucideIcon> = {
  "software-developer": Code2,
  "devops-engineer": Server,
  "graphic-designer": Palette,
  "academic-researcher": GraduationCap,
  "sales-marketing": Megaphone,
  "project-manager": Briefcase,
};

type CvTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: CVTemplateRecord) => void;
};

const CvTemplateDialog = ({ open, onOpenChange, onSelect }: CvTemplateDialogProps) => {
  const { data: templates = [], isLoading, isError } = useQuery({
    queryKey: ["cv-templates"],
    queryFn: fetchCVTemplates,
    enabled: open,
    staleTime: 0,
    refetchOnMount: "always",
  });

  React.useEffect(() => {
    if (isError) {
      showToast({ title: "Failed to load templates", variant: "error" });
    }
  }, [isError]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LayoutTemplate className="h-5 w-5" />
            Choose a CV Template
          </DialogTitle>
          <DialogDescription>
            Select a prebuilt layout to populate your canvas. You can customize every section after applying.
          </DialogDescription>
        </DialogHeader>

        {isLoading ?
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-xl" />
            ))}
          </div>
        : <div className="grid gap-3 sm:grid-cols-2">
            {templates.map((template) => {
              const Icon = TEMPLATE_ICONS[template.id] ?? LayoutTemplate;
              const sections = getTemplateSectionPreview(template.elements);

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => onSelect(template)}
                  className="flex flex-col gap-2 rounded-xl border bg-card p-4 text-left shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground">{template.name}</p>
                      {template.category ?
                        <p className="text-xs font-medium text-primary">{template.category}</p>
                      : null}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                  {sections.length > 0 ?
                    <p className="text-xs text-muted-foreground">
                      Sections: {sections.slice(0, 4).join(" · ")}
                      {sections.length > 4 ? " · …" : ""}
                    </p>
                  : null}
                </button>
              );
            })}
          </div>
        }
      </DialogContent>
    </Dialog>
  );
};

export default CvTemplateDialog;
