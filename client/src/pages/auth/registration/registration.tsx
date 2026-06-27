import profile from "@/assets/profile.jpg";
import GoogleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { useFullPageScroll } from "@/hooks/use-full-page-scroll";
import { cn } from "@/lib/utils";
import PasswordStrengthField from "@/pages/auth/registration/password-strength-field";
import { startOAuthLogin } from "@/pages/auth/use-oauth-login";
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
import { TERMS_PATH } from "@/shared/utils/cache-warning";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { BadgeAlert, LoaderCircleIcon, MailIcon, ShieldCheckIcon, UserPlusIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

type RegistrationStep = "email" | "verify" | "details";

const STEPS: { key: RegistrationStep; label: string; icon: React.ElementType }[] = [
  { key: "email", label: "Email", icon: MailIcon },
  { key: "verify", label: "Verify", icon: ShieldCheckIcon },
  { key: "details", label: "Profile", icon: UserPlusIcon },
];

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
    <div className="flex items-center justify-between gap-2">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;

        return (
          <React.Fragment key={step.key}>
            <div className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border text-sm transition-colors",
                  isComplete && "border-primary bg-primary text-primary-foreground",
                  isActive && "border-primary bg-primary/10 text-primary",
                  !isActive && !isComplete && "border-muted-foreground/30 text-muted-foreground"
                )}>
                <Icon className="h-4 w-4" />
              </div>
              <span className={cn("text-xs font-medium", isActive ? "text-foreground" : "text-muted-foreground")}>{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div className={cn("mb-5 h-px flex-1", index < currentIndex ? "bg-primary" : "bg-border")} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function registration() {
  useFullPageScroll();
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
      navigate("/dashboard");
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
    email: "Enter your email to receive a verification link.",
    verify: "Check your inbox and open the link we sent you.",
    details: "Set your password and complete your profile.",
  }[step];

  const renderAuthFooter = () => (
    <>
      <div className="relative w-full my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted-foreground/40" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or register with</span>
        </div>
      </div>
      <div className="grid w-full grid-cols-2 gap-3">
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => startOAuthLogin("google")}>
          <GoogleIcon />
          Google
        </Button>
        <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => startOAuthLogin("github")}>
          <GitHubLogoIcon />
          Github
        </Button>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="underline underline-offset-4 hover:text-primary" preventScrollReset={true}>
          Log in
        </Link>
      </p>
      <p className="text-center text-xs text-muted-foreground">
        By registering, you agree to our{" "}
        <Link to={TERMS_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
          Terms & Conditions
        </Link>
        .
      </p>
    </>
  );

  return (
    <div className="min-h-screen w-full bg-muted/60 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-4 border-b pb-5">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Create an account</CardTitle>
              <CardDescription>{stepDescription}</CardDescription>
            </div>
            <StepIndicator currentStep={step} />
          </CardHeader>

          <CardContent className="py-6">
            {step === "email" && (
              <FormProvider {...emailForm}>
                <form id="registration-email-form" onSubmit={emailForm.handleSubmit(onSendVerification)} className="space-y-4">
                  <div className="grid gap-4">{emailFieldSchema.map((field) => renderField(emailForm, field))}</div>
                </form>
              </FormProvider>
            )}

            {step === "verify" && (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    We sent a verification link to{" "}
                    <span className="font-medium text-foreground">{verifiedEmail}</span>. Open it to continue — this page updates
                    automatically.
                  </p>
                </div>
                {isResendDisabled && (
                  <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                    <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Verification email sent. Waiting for confirmation…</span>
                  </div>
                )}
              </div>
            )}

            {step === "details" && (
              <FormProvider {...detailsForm}>
                <form id="registration-details-form" onSubmit={detailsForm.handleSubmit(onSubmitDetails)} className="space-y-5">
                  <div className="rounded-lg border bg-muted/40 px-3 py-2.5 text-sm">
                    Registering as <span className="font-medium text-foreground">{verifiedEmail}</span>
                  </div>

                  {detailsFieldSchema
                    .filter((field) => field.name === "photoURL")
                    .map((field) => renderField(detailsForm, field))}

                  <PasswordStrengthField form={detailsForm} />

                  <div className="grid gap-4 sm:grid-cols-2">
                    {detailsFieldSchema
                      .filter((field) => field.name === "firstName" || field.name === "lastName")
                      .map((field) => renderField(detailsForm, field))}
                  </div>
                </form>
              </FormProvider>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t px-6 py-4">
            {step === "email" && (
              <>
                <Button className="w-full" type="submit" form="registration-email-form" disabled={isSubmitting}>
                  {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                  Send verification email
                </Button>
                {renderAuthFooter()}
              </>
            )}

            {step === "verify" && (
              <>
                <Button className="w-full" type="button" onClick={onResendVerification} disabled={isResendDisabled || isSubmitting}>
                  {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend verification email"}
                </Button>
                <button
                  type="button"
                  className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                  onClick={handleChangeEmail}>
                  Change email
                </button>
                {renderAuthFooter()}
              </>
            )}

            {step === "details" && (
              <>
                <Button className="w-full" type="submit" form="registration-details-form" disabled={isSubmitting}>
                  {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                  Create account
                </Button>
                {renderAuthFooter()}
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default registration;
