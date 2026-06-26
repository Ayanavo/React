import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Database,
  FileText,
  Mail,
  Scale,
  Server,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

export const SUPPORT_EMAIL = "ayanavo2057@gmail.com";

const TERMS_VERSION = "1.0";

const termsCardClass = "bg-white dark:bg-card";

type TermsSectionData = {
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
};

const SECTIONS: TermsSectionData[] = [
  {
    title: "Cache & local storage",
    icon: Database,
    paragraphs: [
      "Notofy requires your browser to allow cache and local storage. These technologies are used to keep you signed in, remember your preferences, store workspace drafts, and load application data reliably.",
      "If cache or site data is disabled, blocked by a private browsing mode, or cleared aggressively by browser extensions, parts of the application may fail to load, settings may not persist, and you may be signed out unexpectedly.",
    ],
  },
  {
    title: "Acceptable use",
    icon: Shield,
    paragraphs: [
      "You agree to use this application lawfully and only for its intended purpose. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
      "You must not attempt to interfere with the service, access data you are not permitted to view, or upload harmful or unlawful content through any workspace feature.",
    ],
  },
  {
    title: "Personal use only",
    icon: UserRound,
    paragraphs: [
      "This application is provided for personal, non-commercial use only. You may not use Notofy for any commercial purpose, including but not limited to operating a business, providing paid services to others, reselling access, or using the workspace to support commercial activities on behalf of an organization without explicit written permission.",
      "Any use of this application for commercial purposes is strictly prohibited and may result in suspension or termination of access, as well as legal action to the fullest extent permitted by applicable law.",
    ],
  },
  {
    title: "Your content",
    icon: FileText,
    paragraphs: [
      "You retain ownership of the content you create in this workspace, including notes, activities, tags, CV drafts, and related files. You grant the service permission to store and process that content so the application can provide its features to you and to other users where sharing or permissions apply.",
    ],
  },
  {
    title: "Privacy & data handling",
    icon: Shield,
    paragraphs: [
      "We process account, profile, and workspace data to operate the service. Authentication tokens and preferences may be stored locally in your browser to improve performance and keep you signed in.",
      "Do not share sensitive personal information in workspace content unless you understand who can access it through permissions, sharing, or administrative tools.",
    ],
  },
  {
    title: "Service availability",
    icon: Server,
    paragraphs: [
      "We aim to keep the service available and secure, but we do not guarantee uninterrupted access. Maintenance, updates, network issues, or third-party service outages may temporarily affect availability.",
      "Features may change or be updated without prior notice. Continued use of the application after updates constitutes acceptance of the revised terms where applicable.",
    ],
  },
  {
    title: "Limitation of liability",
    icon: Scale,
    paragraphs: [
      'The application is provided on an "as is" basis to the extent permitted by applicable law. We are not liable for indirect, incidental, or consequential losses arising from use of the service, including loss of data where reasonable backup or export options were available.',
    ],
  },
];

const POLICY_HIGHLIGHTS = [
  {
    icon: Database,
    title: "Cache required",
    description: "Browser cache and local storage must remain enabled for the app to function.",
  },
  {
    icon: UserRound,
    title: "Personal use",
    description: "Notofy is intended for individual, non-commercial workspace activity only.",
  },
  {
    icon: BriefcaseBusiness,
    title: "No commercial use",
    description: "Commercial activity may result in access termination and legal action.",
  },
] as const;

function TermsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-dashed border-border p-5 shadow-sm",
        termsCardClass
      )}>
      <div className="mb-5 flex items-start gap-3 border-b border-dotted border-border pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dotted border-border bg-muted/40 text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h2 className="min-w-0 text-base font-semibold">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function TermsAndConditions() {
  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  const openSupportEmail = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-none">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 pt-3">
          <BreadcrumbInbuild />
        </div>

        <div className="mx-4 my-2 mb-5 space-y-4">
          <div className={cn("rounded-lg border border-dashed border-border px-6 py-5 shadow-sm", termsCardClass)}>
            <h1 className="text-xl font-semibold">Terms & Conditions</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              These terms govern your access to Notofy. By signing in, you confirm that you have read,
              understood, and agree to comply with the policies outlined below.
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Version {TERMS_VERSION} · Last updated {lastUpdated}
            </p>
          </div>

          <div className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", termsCardClass)}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dotted border-border bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Important notice</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Notofy relies on browser cache and local storage. Disabling site data or using restrictive
                  privacy modes may break core functionality including authentication and saved preferences.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {POLICY_HIGHLIGHTS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.title}
                    className="rounded-md border border-dotted border-border bg-muted/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                      <p className="text-sm font-medium">{item.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {SECTIONS.map((section) => (
            <TermsSection key={section.title} title={section.title} icon={section.icon}>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
                    {paragraph}
                  </p>
                ))}
              </div>
            </TermsSection>
          ))}

          <TermsSection title="Contact & support" icon={Mail}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have questions about these terms, contact your workspace administrator or reach out to our
                support team using the button below.
              </p>
              <Button type="button" variant="outline" className="shrink-0" onClick={openSupportEmail}>
                Email support
              </Button>
            </div>
          </TermsSection>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
