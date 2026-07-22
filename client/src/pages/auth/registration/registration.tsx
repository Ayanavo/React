import profile from "@/assets/profile.jpg";
import imgUrl from "@/assets/Notebook.jpeg";
import GoogleIcon from "@/assets/google.svg";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { cn } from "@/lib/utils";
import PasswordStrengthField from "@/pages/auth/registration/password-strength-field";
import { startOAuthLogin } from "@/pages/auth/use-oauth-login";
import InfinityBackground from "@/pages/auth/login/infinity-background";
import { componentMap } from "@/pages/layout/grid/form/field-map";
import generateControl from "@/pages/layout/grid/form/validation";
import {
  getVerificationStatusAPI,
  registerAPI,
  RegisterPayload,
  resendVerificationEmailAPI,
  sendVerificationEmailAPI,
} from "@/shared/services/auth.ts";
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from "@/shared/utils/password-strength";
import { LOGIN_PATH, ACCEPT_TERMS_PATH } from "@/shared/utils/auth-paths";
import { PRIVACY_PATH, TERMS_PATH } from "@/shared/utils/policy-paths";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import {
  BadgeAlert,
  CheckIcon,
  LoaderCircleIcon,
  MailIcon,
  ShieldCheckIcon,
  UserCheckIcon,
  UserPlusIcon,
  ZapIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import "./registration.scss";

type RegistrationStep = "email" | "verify" | "details";

const STEPS: { key: RegistrationStep; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", icon: MailIcon },
  { key: "verify", label: "Verify", icon: ShieldCheckIcon },
  { key: "details", label: "Profile", icon: UserPlusIcon },
];

const BENEFITS = [
  {
    icon: ShieldCheckIcon,
    title: "Verified onboarding",
    description: "Secure email verification before account creation.",
  },
  {
    icon: UserCheckIcon,
    title: "Personalized profile",
    description: "Set up your workspace with a complete profile.",
  },
  {
    icon: ZapIcon,
    title: "Ready in minutes",
    description: "Start collaborating as soon as you sign up.",
  },
] as const;

const emailFieldSchema = [
  {
    name: "email",
    label: "Email",
    type: "emailsingle",
    default: "",
    validation: { required: true, email: true },
  },
];

const detailsFieldSchema = [
  {
    name: "photoURL",
    label: "Profile",
    type: "image",
    profileDefaultLink: profile,
    validation: { required: true },
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    default: "",
    validation: {
      required: true,
      minLength: PASSWORD_MIN_LENGTH,
      pattern: PASSWORD_PATTERN,
      patternMessage: "Password must include uppercase, lowercase, number, and special character",
    },
  },
  {
    name: "firstName",
    label: "First Name",
    type: "text",
    validation: { required: true },
  },
  {
    name: "lastName",
    label: "Last Name",
    type: "text",
    validation: { required: true },
  },
];

function StepIndicator({ currentStep }: { currentStep: RegistrationStep }) {
  const currentIndex = STEPS.findIndex((step) => step.key === currentStep);

  return (
    <div className="registration-steps">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div
              className={cn(
                "registration-step",
                isActive && "registration-step--active",
                isComplete && "registration-step--complete"
              )}>
              <div className="registration-step__indicator">
                {isComplete ?
                  <CheckIcon className="h-3.5 w-3.5" aria-hidden="true" />
                : <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
              </div>
              <span className="registration-step__label">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn("registration-step__connector", index < currentIndex && "registration-step__connector--complete")}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function registration() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [step, setStep] = useState<RegistrationStep>("email");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const emailForm = generateControl(emailFieldSchema);
  const detailsForm = generateControl(detailsFieldSchema);

  const startResendCooldown = useCallback((seconds: number) => {
    if (resendTimerRef.current) {
      clearInterval(resendTimerRef.current);
    }

    setIsResendDisabled(true);
    setResendTimer(seconds);

    resendTimerRef.current = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          if (resendTimerRef.current) {
            clearInterval(resendTimerRef.current);
          }
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const checkVerificationStatus = useCallback(
    async (email: string) => {
      try {
        const status = await getVerificationStatusAPI(email);
        if (status.canRegister) {
          setVerifiedEmail(email);
          setStep("details");
          setSearchParams({ step: "details", email });
          return true;
        }
      } catch {
        // Ignore polling errors
      }
      return false;
    },
    [setSearchParams]
  );

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const urlStep = searchParams.get("step");
    const urlEmail = searchParams.get("email");
    const urlError = searchParams.get("error");

    if (urlError) {
      const errorMessages: Record<string, string> = {
        "invalid-link": "This verification link is invalid.",
        "expired-link": "This verification link has expired. Please request a new one.",
        "verification-failed": "Email verification failed. Please try again.",
      };
      showToast({
        title: errorMessages[urlError] || "Verification failed",
        variant: "error",
      });

      if (urlEmail) {
        setVerifiedEmail(urlEmail);
        setStep("verify");
        emailForm.setValue("email", urlEmail);
      }

      setSearchParams({});
      return;
    }

    if (urlStep === "details" && urlEmail) {
      setVerifiedEmail(urlEmail);
      setStep("details");

      void checkVerificationStatus(urlEmail).then((verified) => {
        if (!verified) {
          setStep("verify");
          emailForm.setValue("email", urlEmail);
          showToast({
            title: "Registration window expired or email not verified. Please verify again.",
            variant: "error",
          });
        }
      });
      return;
    }

    if (urlStep === "verify" && urlEmail) {
      setVerifiedEmail(urlEmail);
      setStep("verify");
      emailForm.setValue("email", urlEmail);
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (step !== "verify" || !verifiedEmail) return;

    const poll = setInterval(() => {
      void checkVerificationStatus(verifiedEmail);
    }, 4000);

    return () => clearInterval(poll);
  }, [checkVerificationStatus, step, verifiedEmail]);

  function renderField(
    form: ReturnType<typeof generateControl>,
    field: {
      type: string;
      name: React.Key | null | undefined;
    }
  ) {
    if (field.type === "password") return null;

    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ?
        <Component key={field.name} form={form} schema={field} />
      : <div key={field.name}>Unidentified field type: {field.type}</div>;
  }

  const onSendVerification = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      const response = await sendVerificationEmailAPI(data.email);
      setVerifiedEmail(data.email.trim().toLowerCase());

      if (response.alreadyVerified) {
        setStep("details");
        setSearchParams({ step: "details", email: data.email.trim().toLowerCase() });
        showToast({ title: response.message, variant: "success" });
        return;
      }

      setStep("verify");
      showToast({ title: response.message || "Verification email sent", variant: "success" });
      startResendCooldown(response.resendAvailableIn ?? 60);
    } catch (error: any) {
      const suggestion = error.response?.data?.suggestion;
      const message = error.response?.data?.message || "Failed to send verification email";
      showToast({ title: message, variant: "error" });

      if (suggestion) {
        emailForm.setValue("email", suggestion);
      }

      if (error.response?.status === 409) {
        showToast({ title: "This email is already registered. Please log in.", variant: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResendVerification = async () => {
    if (!verifiedEmail || isResendDisabled) return;

    setIsSubmitting(true);
    try {
      const response = await resendVerificationEmailAPI(verifiedEmail);

      if (response.alreadyVerified) {
        setStep("details");
        setSearchParams({ step: "details", email: verifiedEmail });
        showToast({ title: response.message, variant: "success" });
        return;
      }

      showToast({ title: response.message || "Verification email resent", variant: "success" });
      startResendCooldown(response.resendAvailableIn ?? 60);
    } catch (error: any) {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      const message = error.response?.data?.message || "Failed to resend verification email";
      showToast({ title: message, variant: "error" });

      if (error.response?.status === 429 && retryAfterSeconds) {
        startResendCooldown(retryAfterSeconds);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitDetails = async (data: Record<string, string>) => {
    if (!verifiedEmail) {
      showToast({ title: "Please verify your email first", variant: "error" });
      setStep("email");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: RegisterPayload = {
        photoURL: data.photoURL,
        email: verifiedEmail,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const response = await registerAPI(payload);
      showToast({ title: response?.message || "Account created successfully", variant: "success" });
      navigate(ACCEPT_TERMS_PATH);
    } catch (error: any) {
      const message = error.response?.data?.message || "Registration failed";
      showToast({ title: message, variant: "error" });

      if (message.toLowerCase().includes("expired") || message.toLowerCase().includes("not verified")) {
        setStep("email");
        setVerifiedEmail("");
        setSearchParams({});
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangeEmail = () => {
    setStep("email");
    setVerifiedEmail("");
    setSearchParams({});
  };

  const stepDescription = {
    email: "Enter your work email to begin secure onboarding.",
    verify: "Check your inbox and open the link we sent you.",
    details: "Set your password and complete your profile.",
  }[step];

  const renderAuthFooter = () => (
    <>
      <div className="login-divider w-full">
        <span>Or register with</span>
      </div>
      <div className="grid w-full grid-cols-2 gap-2.5">
        <Button
          type="button"
          variant="outline"
          className="login-oauth-btn"
          disabled={isSubmitting}
          onClick={() => startOAuthLogin("google")}>
          <GoogleIcon />
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="login-oauth-btn"
          disabled={isSubmitting}
          onClick={() => startOAuthLogin("github")}>
          <GitHubLogoIcon />
          GitHub
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Already have an account?{" "}
        <Link
          to={LOGIN_PATH}
          className="font-medium text-foreground underline-offset-4 transition-colors hover:underline"
          preventScrollReset={true}>
          Log in
        </Link>
      </p>
      <p className="text-center text-[0.625rem] leading-snug text-muted-foreground">
        By registering, you agree to our{" "}
        <Link to={TERMS_PATH} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link to={PRIVACY_PATH} className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </>
  );

  return (
    <div className="relative flex h-[100dvh] min-h-0 w-full items-center justify-center overflow-hidden p-3 sm:p-4">
      <InfinityBackground />

      <div className="relative z-10 w-full max-w-[780px]">
        <Card className="login-card">
          <div className="login-card__grid grid min-h-0 items-stretch lg:grid-cols-2">
            <div className="login-form-column flex flex-col">
              <CardHeader className="login-form-header space-y-3 px-5 pb-3.5 pt-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="login-brand-mark">
                      <AppLogo className="h-3.5 w-3.5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold tracking-tight text-foreground">Notofy</p>
                      <p className="text-[0.6875rem] text-muted-foreground">Enterprise workspace</p>
                    </div>
                  </div>
                  <span className="login-trust-badge">
                    <ShieldCheckIcon className="h-3 w-3" aria-hidden="true" />
                    Secure signup
                  </span>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight">Create an account</CardTitle>
                  <CardDescription className="text-sm">{stepDescription}</CardDescription>
                </div>

                <StepIndicator currentStep={step} />
              </CardHeader>

              <CardContent className="space-y-3 px-5 py-3.5">
                {step === "email" && (
                  <FormProvider {...emailForm}>
                    <form
                      id="registration-email-form"
                      onSubmit={emailForm.handleSubmit(onSendVerification)}
                      className="space-y-3">
                      <div className="grid gap-3">{emailFieldSchema.map((field) => renderField(emailForm, field))}</div>
                    </form>
                  </FormProvider>
                )}

                {step === "verify" && (
                  <div className="space-y-3">
                    <div className="registration-info">
                      We sent a verification link to{" "}
                      <span className="font-semibold text-foreground">{verifiedEmail}</span>. Open it to continue —
                      this page updates automatically.
                    </div>
                    {isResendDisabled && (
                      <div className="registration-status">
                        <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>Verification email sent. Waiting for confirmation…</span>
                      </div>
                    )}
                  </div>
                )}

                {step === "details" && (
                  <FormProvider {...detailsForm}>
                    <form
                      id="registration-details-form"
                      onSubmit={detailsForm.handleSubmit(onSubmitDetails)}
                      className="space-y-3.5">
                      <div className="registration-info">
                        Registering as <span className="font-semibold text-foreground">{verifiedEmail}</span>
                      </div>

                      {detailsFieldSchema
                        .filter((field) => field.name === "photoURL")
                        .map((field) => renderField(detailsForm, field))}

                      <PasswordStrengthField form={detailsForm} />

                      <div className="grid gap-3 sm:grid-cols-2">
                        {detailsFieldSchema
                          .filter((field) => field.name === "firstName" || field.name === "lastName")
                          .map((field) => renderField(detailsForm, field))}
                      </div>
                    </form>
                  </FormProvider>
                )}
              </CardContent>

              <CardFooter className="mt-auto flex-col gap-2.5 px-5 pb-5 pt-0">
                {step === "email" && (
                  <>
                    <Button
                      className="h-9 w-full text-sm font-medium"
                      type="submit"
                      form="registration-email-form"
                      disabled={isSubmitting}>
                      {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                      Send verification email
                    </Button>
                    {renderAuthFooter()}
                  </>
                )}

                {step === "verify" && (
                  <>
                    <Button
                      className="h-9 w-full text-sm font-medium"
                      type="button"
                      onClick={onResendVerification}
                      disabled={isResendDisabled || isSubmitting}>
                      {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend verification email"}
                    </Button>
                    <button
                      type="button"
                      className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                      onClick={handleChangeEmail}>
                      Change email
                    </button>
                    {renderAuthFooter()}
                  </>
                )}

                {step === "details" && (
                  <>
                    <Button
                      className="h-9 w-full text-sm font-medium"
                      type="submit"
                      form="registration-details-form"
                      disabled={isSubmitting}>
                      {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                      Create account
                    </Button>
                    {renderAuthFooter()}
                  </>
                )}
              </CardFooter>
            </div>

            <aside className="login-visual-panel hidden lg:block">
              <img
                src={`${imgUrl}?height=640&width=360`}
                alt="Notebook workspace preview"
                className="login-visual-panel__image"
              />
              <div className="login-visual-panel__overlay" aria-hidden="true" />

              <div className="login-visual-panel__content">
                <div className="login-visual-panel__intro">
                  <p className="login-visual-panel__eyebrow">
                    <span className="login-visual-panel__eyebrow-dot" />
                    Onboarding
                  </p>
                  <h2 className="login-visual-panel__headline">Join your team workspace</h2>
                  <p className="login-visual-panel__subline">
                    A streamlined signup built for professionals and growing teams.
                  </p>
                </div>

                <ul className="login-visual-panel__features">
                  {BENEFITS.map(({ icon: Icon, title, description }) => (
                    <li key={title} className="login-visual-panel__feature">
                      <span className="login-visual-panel__feature-icon">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="login-visual-panel__feature-text">
                        <span className="login-visual-panel__feature-title">{title}</span>
                        <span className="login-visual-panel__feature-desc">{description}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default registration;
