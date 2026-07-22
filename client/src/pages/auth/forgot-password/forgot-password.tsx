import imgUrl from "@/assets/Notebook.jpeg";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import InfinityBackground from "@/pages/auth/login/infinity-background";
import { componentMap } from "@/pages/layout/grid/form/field-map";
import generateControl from "@/pages/layout/grid/form/validation";
import { forgotPasswordAPI, resendPasswordResetAPI } from "@/shared/services/auth.ts";
import { LOGIN_PATH } from "@/shared/utils/auth-paths";
import { BadgeAlert, ClockIcon, KeyRoundIcon, LoaderCircleIcon, ShieldCheckIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";
import "../registration/registration.scss";

const emailFieldSchema = [
  {
    name: "email",
    label: "Email",
    type: "emailsingle",
    default: "",
    validation: { required: true, email: true },
  },
];

const SECURITY_POINTS = [
  {
    icon: KeyRoundIcon,
    title: "Secure reset",
    description: "Password recovery via encrypted email link.",
  },
  {
    icon: ClockIcon,
    title: "Time-limited access",
    description: "Reset links expire to protect your account.",
  },
  {
    icon: ShieldCheckIcon,
    title: "Verified recovery",
    description: "Only the account owner can request a reset.",
  },
] as const;

function ForgotPassword() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  const emailForm = generateControl(emailFieldSchema);

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

  useEffect(() => {
    const urlEmail = searchParams.get("email");
    if (urlEmail) {
      emailForm.setValue("email", urlEmail);
      setSubmittedEmail(urlEmail.trim().toLowerCase());
      setSearchParams({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, []);

  const onSubmit = async (data: Record<string, string>) => {
    setIsSubmitting(true);
    try {
      const response = await forgotPasswordAPI(data.email);
      const email = data.email.trim().toLowerCase();
      setSubmittedEmail(email);
      setEmailSent(true);
      showToast({ title: response.message, variant: "success" });
      startResendCooldown(response.resendAvailableIn ?? 60);
    } catch (error: any) {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      const message = error.response?.data?.message || "Failed to send password reset email";
      showToast({ title: message, variant: "error" });

      if (error.response?.status === 429 && retryAfterSeconds) {
        setSubmittedEmail(data.email.trim().toLowerCase());
        setEmailSent(true);
        startResendCooldown(retryAfterSeconds);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const onResend = async () => {
    if (!submittedEmail || isResendDisabled) return;

    setIsSubmitting(true);
    try {
      const response = await resendPasswordResetAPI(submittedEmail);
      showToast({ title: response.message, variant: "success" });
      startResendCooldown(response.resendAvailableIn ?? 60);
    } catch (error: any) {
      const retryAfterSeconds = error.response?.data?.retryAfterSeconds;
      const message = error.response?.data?.message || "Failed to resend password reset email";
      showToast({ title: message, variant: "error" });

      if (error.response?.status === 429 && retryAfterSeconds) {
        startResendCooldown(retryAfterSeconds);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const Component = componentMap.emailsingle;

  return (
    <div className="relative flex h-[100dvh] min-h-0 w-full items-center justify-center overflow-hidden p-3 sm:p-4">
      <InfinityBackground />

      <div className="relative z-10 w-full max-w-[720px]">
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
                    Secure recovery
                  </span>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight">Forgot password</CardTitle>
                  <CardDescription className="text-sm">
                    {emailSent ?
                      "Check your inbox for a password reset link."
                    : "Enter your account email and we'll send you a secure reset link."}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 px-5 py-3.5">
                {!emailSent ?
                  <FormProvider {...emailForm}>
                    <form id="forgot-password-form" onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-3">
                      {emailFieldSchema.map((field) =>
                        Component ? <Component key={field.name} form={emailForm} schema={field} /> : null
                      )}
                    </form>
                  </FormProvider>
                : <div className="space-y-3">
                    <div className="registration-info">
                      If an account exists for{" "}
                      <span className="font-semibold text-foreground">{submittedEmail}</span>, a password reset link
                      has been sent. Open the link to set a new password.
                    </div>
                    {isResendDisabled && (
                      <div className="registration-status">
                        <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                        <span>Reset email sent. The link expires after a short time.</span>
                      </div>
                    )}
                  </div>
                }
              </CardContent>

              <CardFooter className="mt-auto flex-col gap-2.5 px-5 pb-5 pt-0">
                {!emailSent ?
                  <Button
                    className="h-9 w-full text-sm font-medium"
                    type="submit"
                    form="forgot-password-form"
                    disabled={isSubmitting}>
                    {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                    Send reset link
                  </Button>
                : <Button
                    className="h-9 w-full text-sm font-medium"
                    type="button"
                    onClick={onResend}
                    disabled={isResendDisabled || isSubmitting}>
                    {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend reset link"}
                  </Button>
                }

                <p className="text-center text-xs text-muted-foreground">
                  <Link
                    to={LOGIN_PATH}
                    className="font-medium text-foreground underline-offset-4 transition-colors hover:underline">
                    Back to login
                  </Link>
                </p>

                {emailSent && (
                  <button
                    type="button"
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    onClick={() => {
                      setEmailSent(false);
                      setSubmittedEmail("");
                    }}>
                    Use a different email
                  </button>
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
                    Account security
                  </p>
                  <h2 className="login-visual-panel__headline">Recover access safely</h2>
                  <p className="login-visual-panel__subline">
                    Enterprise-grade password recovery designed to keep your account protected.
                  </p>
                </div>

                <ul className="login-visual-panel__features">
                  {SECURITY_POINTS.map(({ icon: Icon, title, description }) => (
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

export default ForgotPassword;
