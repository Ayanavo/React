import moment from "moment";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TERMS_PATH } from "@/shared/utils/policy-paths";
import {
  AlertTriangle,
  Bot,
  Cookie,
  Database,
  Eye,
  FileText,
  Globe,
  Lock,
  Mail,
  Scale,
  Server,
  Share2,
  Shield,
  Trash2,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

export const SUPPORT_EMAIL = "ayanavo2057@gmail.com";

const PRIVACY_VERSION = "1.0";

const policyCardClass = "bg-white dark:bg-card";

type PrivacySectionData = {
  title: string;
  icon: LucideIcon;
  paragraphs: string[];
};

type ThirdPartyService = {
  name: string;
  purpose: string;
  dataShared: string[];
  retention: string;
};

const POLICY_HIGHLIGHTS = [
  {
    icon: UserRound,
    title: "Account & profile data",
    description: "We collect information you provide when registering, updating your profile, and using workspace features.",
  },
  {
    icon: Share2,
    title: "Selected third parties",
    description: "OAuth providers, email delivery, cloud hosting, database storage, and AI services process data only as needed to operate features you use.",
  },
  {
    icon: Shield,
    title: "No sale of personal data",
    description: "Notofy does not sell your personal information to advertisers or data brokers.",
  },
] as const;

const DATA_COLLECTION_SECTIONS: PrivacySectionData[] = [
  {
    title: "Account & identity information",
    icon: UserRound,
    paragraphs: [
      "When you create an account, we collect your email address, first name, last name, and password. Passwords are hashed using industry-standard one-way encryption before storage and are never stored or transmitted in plain text.",
      "You may optionally provide a profile photo URL, job title, and mobile number. If you sign in with Google or GitHub, we receive basic profile information from that provider—including your email address, name, profile picture URL, and a provider-specific user identifier—which we use to create or link your Notofy account.",
      "During email-based registration, we temporarily store your email address and a hashed verification token until registration is completed or the verification window expires.",
    ],
  },
  {
    title: "Profile, address & employment details",
    icon: FileText,
    paragraphs: [
      "If you choose to complete your profile, we may store your postal address (address lines, landmark, city, state, and pincode), employment history (company names, designations, and date ranges), and any profile image you upload or link.",
      "This information is stored on our servers so you can view and edit it within the application. You should only include personal or professional details you are comfortable storing in your workspace.",
    ],
  },
  {
    title: "Workspace & user-generated content",
    icon: Database,
    paragraphs: [
      "Notofy stores the content you create and manage in the application, which may include notes (titles, body text, colors, and attached images), activities, tags, CV builder drafts, cover letters, whiteboard or workflow data, and related metadata such as creation and update timestamps.",
      "Content is associated with your account so the service can display, search, edit, and persist your workspace. Where sharing, permissions, or administrative tools apply, authorized users may be able to access content according to those rules.",
      "You retain ownership of your content. We process and store it solely to provide the features you request.",
    ],
  },
  {
    title: "Preferences & application settings",
    icon: Eye,
    paragraphs: [
      "We store your in-app preferences, which may include date format, currency format, font style, theme selection, sidebar layout state, and menu ordering where applicable.",
      "Some preferences are mirrored in your browser (session storage or cookies) so the interface loads consistently between visits. These values are used for display and usability, not for advertising or cross-site tracking.",
    ],
  },
  {
    title: "Session, usage & technical data",
    icon: Server,
    paragraphs: [
      "When you sign in, we record session-related information such as login and logout timestamps, whether you are currently signed in, and cumulative time spent in active sessions. This helps maintain secure sessions and supports account activity visibility within the application.",
      "Our servers may automatically receive standard technical data when you use Notofy, including IP address, browser type, request timestamps, and error logs. This data is used for security monitoring, troubleshooting, and service reliability.",
      "Real-time features may use WebSocket connections tied to your authenticated session to deliver live updates (for example, login status changes) within the application.",
    ],
  },
  {
    title: "Browser storage & cookies",
    icon: Cookie,
    paragraphs: [
      "Notofy uses browser session storage to hold your access token and certain UI preferences while you use the application. Disabling session storage or clearing site data may sign you out or reset local preferences.",
      "We set an HTTP-only refresh token cookie to maintain secure, long-lived authentication without exposing the token to client-side scripts. Additional cookies may store sidebar state and language preference.",
      "The application also relies on browser cache for performance. Restrictive privacy modes or extensions that block cache or site data may cause features to fail or behave unexpectedly.",
    ],
  },
];

const THIRD_PARTY_SERVICES: ThirdPartyService[] = [
  {
    name: "Google (OAuth sign-in)",
    purpose: "Authenticate you and create or link your Notofy account when you choose “Continue with Google.”",
    dataShared: [
      "OAuth authorization flow data exchanged during sign-in",
      "Email address, name, and profile picture URL from your Google account",
      "A Google user identifier used to recognize returning sign-ins",
    ],
    retention:
      "Google processes data under its own privacy policy. We retain the account fields listed above in our database for as long as your account exists.",
  },
  {
    name: "GitHub (OAuth sign-in)",
    purpose: "Authenticate you and create or link your Notofy account when you choose “Continue with Github.”",
    dataShared: [
      "OAuth authorization flow data exchanged during sign-in",
      "Email address, name, and public profile information from your GitHub account",
      "A GitHub user identifier used to recognize returning sign-ins",
    ],
    retention:
      "GitHub processes data under its own privacy policy. We retain the account fields listed above in our database for as long as your account exists.",
  },
  {
    name: "Brevo (transactional email)",
    purpose: "Deliver registration verification emails and related account messages.",
    dataShared: [
      "Your email address as the message recipient",
      "Email content required to complete verification (including a unique verification link)",
      "Sender metadata configured for Notofy transactional mail",
    ],
    retention:
      "Verification records on our servers are removed or expire after registration is completed or the verification window ends. Brevo may retain delivery logs according to its own policies.",
  },
  {
    name: "MongoDB (database hosting)",
    purpose: "Persist account, profile, workspace, and application data so the service remains available across sessions and devices.",
    dataShared: [
      "All server-side data described in this policy that is stored for your account and workspace",
    ],
    retention:
      "Data is retained for as long as your account is active or as needed to provide the service, unless you request deletion where applicable.",
  },
  {
    name: "OpenAI (AI chat)",
    purpose: "Power AI-assisted chat features when you explicitly submit messages to the AI interface.",
    dataShared: [
      "The conversation messages you send in the chat feature, including prior messages in the same request context",
      "Model inference is performed on OpenAI infrastructure; we do not use this data for advertising",
    ],
    retention:
      "Messages are transmitted for real-time processing to generate a response. OpenAI may retain API data according to its enterprise/API data policies. Avoid submitting highly sensitive personal data in AI prompts.",
  },
  {
    name: "Google Generative AI / Gemini (summarize, CV & cover letter tools)",
    purpose: "Generate summaries, ATS-style CV analysis, and cover letter assistance when you use those features.",
    dataShared: [
      "Text, uploaded files, CV content, job descriptions, and chat context you submit to summarization or document tools",
      "Structured prompts derived from your inputs to produce the requested output",
    ],
    retention:
      "Content is sent to Google’s AI services for processing at the time of your request. Google may process and retain API data under its own terms. Only use these features with content you are willing to share with the AI provider.",
  },
  {
    name: "Cloud hosting & infrastructure",
    purpose: "Host the Notofy API, serve static assets, and route traffic securely (including production deployment behind a reverse proxy).",
    dataShared: [
      "Standard request metadata (IP address, headers, timestamps) necessary to deliver the application",
      "Encrypted data in transit between your browser and our servers",
    ],
    retention:
      "Infrastructure providers may maintain operational logs for security and reliability for a limited period defined by their policies.",
  },
];

const USAGE_AND_RIGHTS_SECTIONS: PrivacySectionData[] = [
  {
    title: "How we use your information",
    icon: Eye,
    paragraphs: [
      "We use collected data to create and manage your account, authenticate you, deliver workspace features, save your content and preferences, send transactional emails (such as verification messages), maintain security, diagnose errors, and improve reliability of the service.",
      "We do not use your workspace content or profile data for third-party advertising, and we do not sell personal information.",
      "AI features process only the inputs you choose to submit at the time you use those features; they are not used to build advertising profiles.",
    ],
  },
  {
    title: "AI-powered features",
    icon: Bot,
    paragraphs: [
      "Certain tools—including AI chat, text/file summarization, CV ATS analysis, and cover letter generation—send user-provided content to external AI providers (OpenAI and Google Generative AI) to generate responses.",
      "These transfers occur only when you initiate the feature. The providers act as processors to deliver the functionality you requested. Outputs are returned to you in the application and are not published publicly unless you explicitly save or share them within your workspace.",
      "Because AI providers may log or retain API traffic under their own policies, you should avoid entering passwords, government identifiers, financial account numbers, or other highly sensitive information into AI prompts or uploads.",
    ],
  },
  {
    title: "Legal bases & legitimate uses",
    icon: Scale,
    paragraphs: [
      "We process personal data as necessary to perform our contract with you (providing the Notofy service), to comply with legal obligations where applicable, and based on our legitimate interest in securing and operating the platform—provided those interests are not overridden by your rights.",
      "Where consent is required (for example, initiating OAuth with a third-party identity provider or using optional AI tools), you provide that consent by taking the corresponding action in the application.",
    ],
  },
  {
    title: "Data retention & deletion",
    icon: Trash2,
    paragraphs: [
      "Account and workspace data is kept for as long as your account remains active so you can access your content. Temporary registration verification records are deleted or expire after verification completes or the allowed registration window ends.",
      "Session tokens and refresh cookies expire according to configured authentication lifetimes. You may request account deletion or correction of profile information by contacting support; some logs may be retained for a limited period where required for security or legal compliance.",
      "If you delete content within the application, it is removed from active workspace storage subject to routine backup retention windows on our infrastructure.",
    ],
  },
  {
    title: "Your choices & privacy rights",
    icon: Shield,
    paragraphs: [
      "You can review and update much of your profile data directly in the application. You may sign out at any time, clear browser storage, or revoke OAuth access through your Google or GitHub account settings.",
      "Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data, or to object to certain processing. To exercise these rights, contact us using the details below.",
      "We will respond to verified requests within a reasonable timeframe and may need to confirm your identity before making changes to account data.",
    ],
  },
  {
    title: "Security measures",
    icon: Lock,
    paragraphs: [
      "We protect account credentials with hashed passwords, issue short-lived access tokens, and store refresh tokens in HTTP-only cookies where supported. API requests require authentication for protected resources.",
      "Data is transmitted over HTTPS in production environments. Despite these measures, no online service can guarantee absolute security; please use a strong, unique password and keep your sign-in credentials confidential.",
    ],
  },
  {
    title: "International data transfers",
    icon: Globe,
    paragraphs: [
      "Notofy and its third-party providers may process data in countries other than your own, including where our database, email, AI, or cloud hosting services operate.",
      "When data is transferred internationally, we rely on appropriate safeguards such as contractual protections and the service providers' compliance programs, to the extent required by applicable law.",
    ],
  },
  {
    title: "Children's privacy",
    icon: UserRound,
    paragraphs: [
      "Notofy is not directed at children under the age of 13 (or the minimum age required in your jurisdiction). We do not knowingly collect personal information from children.",
      "If you believe a child has provided personal data through the service, contact us and we will take steps to delete that information where appropriate.",
    ],
  },
  {
    title: "Changes to this policy",
    icon: FileText,
    paragraphs: [
      "We may update this Privacy Policy from time to time to reflect changes in features, legal requirements, or third-party services. The version and last updated date at the top of this page indicate the current revision.",
      "Continued use of Notofy after an update constitutes acceptance of the revised policy where permitted by law. Material changes may also be communicated through the application or by email when appropriate.",
    ],
  },
];

function PrivacySection({
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
        policyCardClass
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

function ThirdPartyCard({ service }: { service: ThirdPartyService }) {
  return (
    <div className="rounded-md border border-dotted border-border bg-muted/20 p-4">
      <h3 className="text-sm font-semibold text-foreground">{service.name}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Purpose: </span>
        {service.purpose}
      </p>
      <div className="mt-3">
        <p className="text-sm font-medium text-foreground">Data shared</p>
        <ul className="mt-1.5 list-inside list-disc space-y-1">
          {service.dataShared.map((item) => (
            <li key={item.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
              {item}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Retention: </span>
        {service.retention}
      </p>
    </div>
  );
}

function PrivacyPolicy() {
  const lastUpdated = useMemo(() => moment().format("MMMM D, YYYY"), []);

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
          <div className={cn("rounded-lg border border-dashed border-border px-6 py-5 shadow-sm", policyCardClass)}>
            <h1 className="text-xl font-semibold">Privacy Policy</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              This policy explains what information Notofy collects, how we use it, and which third-party services
              may process your data when you use the application. By creating an account or continuing to use Notofy,
              you acknowledge this policy alongside our{" "}
              <Link to={TERMS_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
                Terms & Conditions
              </Link>
              .
            </p>
            <p className="mt-2 text-xs text-muted-foreground">
              Version {PRIVACY_VERSION} · Last updated {lastUpdated}
            </p>
          </div>

          <div className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", policyCardClass)}>
            <div className="mb-4 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dotted border-border bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base font-semibold">Important notice</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  AI features and OAuth sign-in involve sharing selected data with external providers. Review the
                  sections below before using summarization, CV analysis, cover letter tools, AI chat, or third-party
                  login options.
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

          <PrivacySection title="Information we collect" icon={Database}>
            <div className="space-y-6">
              {DATA_COLLECTION_SECTIONS.map((section) => (
                <div key={section.title}>
                  <h3 className="text-sm font-semibold text-foreground">{section.title}</h3>
                  <div className="mt-2 space-y-3">
                    {section.paragraphs.map((paragraph) => (
                      <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </PrivacySection>

          <PrivacySection title="Third-party services & data sharing" icon={Share2}>
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Notofy uses trusted third-party services to operate core functionality. We do not sell your personal
                information. The table below describes each category of third party, why data is shared, and what is
                typically involved.
              </p>
              {THIRD_PARTY_SERVICES.map((service) => (
                <ThirdPartyCard key={service.name} service={service} />
              ))}
              <p className="text-sm leading-relaxed text-muted-foreground">
                Each provider maintains its own privacy policy governing how it handles data on its systems. We
                encourage you to review the privacy policies of Google, GitHub, Brevo, OpenAI, and MongoDB Atlas (or
                your database host) for additional detail on their processing practices.
              </p>
            </div>
          </PrivacySection>

          {USAGE_AND_RIGHTS_SECTIONS.map((section) => (
            <PrivacySection key={section.title} title={section.title} icon={section.icon}>
              <div className="space-y-3">
                {section.paragraphs.map((paragraph, index) => {
                  if (section.title === "Changes to this policy" && index === section.paragraphs.length - 1) {
                    return (
                      <p key="policy-changes-link" className="text-sm leading-relaxed text-muted-foreground">
                        For related usage rules, see our{" "}
                        <Link to={TERMS_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
                          Terms & Conditions
                        </Link>
                        .
                      </p>
                    );
                  }

                  return (
                    <p key={paragraph.slice(0, 48)} className="text-sm leading-relaxed text-muted-foreground">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </PrivacySection>
          ))}

          <PrivacySection title="Contact & privacy requests" icon={Mail}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-muted-foreground">
                If you have questions about this Privacy Policy, want to request access or deletion of your data, or
                need to report a privacy concern, contact our support team using the button below.
              </p>
              <Button type="button" variant="outline" className="shrink-0" onClick={openSupportEmail}>
                Email support
              </Button>
            </div>
          </PrivacySection>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;