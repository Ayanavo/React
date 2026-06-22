import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  BriefcaseBusiness,
  Database,
  FileText,
  Mail,
  Scale,
  ScrollText,
  Server,
  Shield,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export const SUPPORT_EMAIL = "ayanavo2057@gmail.com";

const CONTACT_SECTION_ID = "contact-support";
const SCROLL_OFFSET = 96;

const TERMS_VERSION = "1.0";

type TermsSection = {
  id: string;
  number: string;
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
};

const SECTIONS: TermsSection[] = [
  {
    id: "cache-storage",
    number: "01",
    title: "Cache & local storage",
    icon: Database,
    paragraphs: [
      "Epsilon requires your browser to allow cache and local storage. These technologies are used to keep you signed in, remember your preferences, store workspace drafts, and load application data reliably.",
      "If cache or site data is disabled, blocked by a private browsing mode, or cleared aggressively by browser extensions, parts of the application may fail to load, settings may not persist, and you may be signed out unexpectedly.",
    ],
  },
  {
    id: "acceptable-use",
    number: "02",
    title: "Acceptable use",
    icon: Shield,
    paragraphs: [
      "You agree to use this application lawfully and only for its intended purpose. You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.",
      "You must not attempt to interfere with the service, access data you are not permitted to view, or upload harmful or unlawful content through any workspace feature.",
    ],
  },
  {
    id: "personal-use",
    number: "03",
    title: "Personal use only",
    icon: UserRound,
    paragraphs: [
      "This application is provided for personal, non-commercial use only. You may not use Epsilon for any commercial purpose, including but not limited to operating a business, providing paid services to others, reselling access, or using the workspace to support commercial activities on behalf of an organization without explicit written permission.",
      "Any use of this application for commercial purposes is strictly prohibited and may result in suspension or termination of access, as well as legal action to the fullest extent permitted by applicable law.",
    ],
  },
  {
    id: "your-content",
    number: "04",
    title: "Your content",
    icon: FileText,
    paragraphs: [
      "You retain ownership of the content you create in this workspace, including notes, activities, tags, CV drafts, and related files. You grant the service permission to store and process that content so the application can provide its features to you and to other users where sharing or permissions apply.",
    ],
  },
  {
    id: "privacy",
    number: "05",
    title: "Privacy & data handling",
    icon: Shield,
    paragraphs: [
      "We process account, profile, and workspace data to operate the service. Authentication tokens and preferences may be stored locally in your browser to improve performance and keep you signed in.",
      "Do not share sensitive personal information in workspace content unless you understand who can access it through permissions, sharing, or administrative tools.",
    ],
  },
  {
    id: "availability",
    number: "06",
    title: "Service availability",
    icon: Server,
    paragraphs: [
      "We aim to keep the service available and secure, but we do not guarantee uninterrupted access. Maintenance, updates, network issues, or third-party service outages may temporarily affect availability.",
      "Features may change or be updated without prior notice. Continued use of the application after updates constitutes acceptance of the revised terms where applicable.",
    ],
  },
  {
    id: "liability",
    number: "07",
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
    description: "Epsilon is intended for individual, non-commercial workspace activity only.",
  },
  {
    icon: BriefcaseBusiness,
    title: "No commercial use",
    description: "Commercial activity may result in access termination and legal action.",
  },
] as const;

function TermsTableOfContents({
  sections,
  activeSectionId,
  onSectionClick,
}: {
  sections: TermsSection[];
  activeSectionId: string;
  onSectionClick: (sectionId: string) => void;
}) {
  const itemClassName = (sectionId: string) =>
    cn(
      "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-muted-foreground",
      activeSectionId === sectionId && "font-bold"
    );

  return (
    <nav aria-label="Terms table of contents" className="space-y-1">
      <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        On this page
      </p>
      {sections.map((section) => (
        <button
          key={section.id}
          type="button"
          aria-current={activeSectionId === section.id ? "location" : undefined}
          className={itemClassName(section.id)}
          onClick={() => onSectionClick(section.id)}>
          <span className="w-6 shrink-0 font-mono text-xs">{section.number}</span>
          <span className="truncate">{section.title}</span>
        </button>
      ))}
      <button
        type="button"
        aria-current={activeSectionId === CONTACT_SECTION_ID ? "location" : undefined}
        className={itemClassName(CONTACT_SECTION_ID)}
        onClick={() => onSectionClick(CONTACT_SECTION_ID)}>
        <span className="w-6 shrink-0 font-mono text-xs">08</span>
        <span className="truncate">Contact & support</span>
      </button>
    </nav>
  );
}

function TermsSectionBlock({ section }: { section: TermsSection }) {
  const Icon = section.icon;

  return (
    <section id={section.id} className="scroll-mt-24">
      <div className="flex items-start gap-4">
        <div className="hidden shrink-0 sm:flex sm:h-11 sm:w-11 sm:items-center sm:justify-center sm:rounded-xl sm:border sm:bg-muted/40 sm:text-muted-foreground">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <p className="font-mono text-xs font-medium tracking-widest text-primary/80">Section {section.number}</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{section.title}</h2>
          </div>
          <div className="space-y-4">
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 48)} className="text-[15px] leading-7 text-muted-foreground">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TermsAndConditions() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeSectionId, setActiveSectionId] = useState(SECTIONS[0]?.id ?? CONTACT_SECTION_ID);

  const navSectionIds = useMemo(
    () => [...SECTIONS.map((section) => section.id), CONTACT_SECTION_ID],
    []
  );

  const lastUpdated = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    []
  );

  useEffect(() => {
    const scrollRoot = scrollRef.current;
    if (!scrollRoot) return;

    const updateActiveSection = () => {
      const activationLine = scrollRoot.getBoundingClientRect().top + 140;
      let nextActiveId = navSectionIds[0];

      for (const sectionId of navSectionIds) {
        const element = document.getElementById(sectionId);
        if (!element) continue;

        if (element.getBoundingClientRect().top <= activationLine) {
          nextActiveId = sectionId;
        }
      }

      setActiveSectionId(nextActiveId);
    };

    updateActiveSection();
    scrollRoot.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);

    return () => {
      scrollRoot.removeEventListener("scroll", updateActiveSection);
      window.removeEventListener("resize", updateActiveSection);
    };
  }, [navSectionIds]);

  const scrollToSection = useCallback((sectionId: string) => {
    const scrollRoot = scrollRef.current;
    const element = document.getElementById(sectionId);
    if (!scrollRoot || !element) return;

    const top =
      element.getBoundingClientRect().top -
      scrollRoot.getBoundingClientRect().top +
      scrollRoot.scrollTop -
      SCROLL_OFFSET;

    scrollRoot.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    setActiveSectionId(sectionId);
  }, []);

  const openSupportEmail = () => {
    window.location.href = `mailto:${SUPPORT_EMAIL}`;
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-muted/20">
      <div className="shrink-0 border-b bg-background/80 px-6 py-3 backdrop-blur-sm">
        <BreadcrumbInbuild />
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto scrollbar-none">
        <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-8 lg:py-10">
          <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-8 rounded-xl border bg-card/90 p-4 shadow-sm backdrop-blur-sm">
                <TermsTableOfContents
                  sections={SECTIONS}
                  activeSectionId={activeSectionId}
                  onSectionClick={scrollToSection}
                />
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              <header className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                <div className="border-b bg-gradient-to-br from-primary/10 via-background to-background px-6 py-8 md:px-10 md:py-10">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="gap-1.5 rounded-md px-2.5 py-1 font-medium">
                      <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
                      Legal
                    </Badge>
                    <Badge variant="outline" className="rounded-md font-mono text-xs">
                      v{TERMS_VERSION}
                    </Badge>
                    <Badge variant="outline" className="rounded-md text-xs">
                      Updated {lastUpdated}
                    </Badge>
                  </div>

                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
                    Terms & Conditions
                  </h1>
                  <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground md:text-[15px] md:leading-7">
                    These terms govern your access to Epsilon. By signing in, you confirm that you have read,
                    understood, and agree to comply with the policies outlined below.
                  </p>
                </div>

                <div className="grid gap-px bg-border md:grid-cols-3">
                  {POLICY_HIGHLIGHTS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.title} className="flex gap-3 bg-card px-5 py-4 md:px-6 md:py-5">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-semibold text-foreground">{item.title}</p>
                          <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </header>

              <Card className="border-amber-500/25 bg-amber-500/5 shadow-none">
                <CardContent className="flex gap-3 p-4 md:p-5">
                  <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">Important notice</p>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Epsilon relies on browser cache and local storage. Disabling site data or using restrictive
                      privacy modes may break core functionality including authentication and saved preferences.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="border-b bg-muted/20 pb-4">
                  <CardTitle className="text-lg">Policy documentation</CardTitle>
                  <CardDescription>
                    Review each section for usage requirements, data handling, and your responsibilities as a user.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-10 px-6 py-8 md:px-8 md:py-10">
                  {SECTIONS.map((section, index) => (
                    <React.Fragment key={section.id}>
                      <TermsSectionBlock section={section} />
                      {index < SECTIONS.length - 1 && <Separator className="bg-border/70" />}
                    </React.Fragment>
                  ))}
                </CardContent>
              </Card>

              <Card id={CONTACT_SECTION_ID} className="scroll-mt-24 border-primary/15 shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Mail className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Contact & support</CardTitle>
                      <CardDescription>Questions about these terms or your account</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    If you have questions about these terms, contact your workspace administrator or reach out to our
                    support team using the button below.
                  </p>
                  <Button type="button" variant="outline" className="shrink-0" onClick={openSupportEmail}>
                    Email support
                  </Button>
                </CardContent>
              </Card>

              <footer className="flex flex-col gap-2 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <p>Epsilon Terms & Conditions · Version {TERMS_VERSION}</p>
                <p>Last updated {lastUpdated}</p>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
