import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { useFullPageScroll } from "@/hooks/use-full-page-scroll";
import { componentMap } from "@/pages/layout/grid/form/field-map";
import generateControl from "@/pages/layout/grid/form/validation";
import { forgotPasswordAPI, resendPasswordResetAPI } from "@/shared/services/auth.ts";
import { LOGIN_PATH } from "@/shared/utils/auth-paths";
import { BadgeAlert, LoaderCircleIcon } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useSearchParams } from "react-router-dom";

const emailFieldSchema = [
  {
    name: "email",
    label: "Email",
    type: "emailsingle",
    default: "",
    validation: { required: true, email: true },
  },
];

function ForgotPassword() {
  useFullPageScroll();
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
    <div className="min-h-screen w-full bg-muted/60 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-lg">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 border-b pb-5">
            <CardTitle className="text-2xl">Forgot password</CardTitle>
            <CardDescription>
              {emailSent
                ? "Check your inbox for a password reset link."
                : "Enter your account email and we will send you a reset link."}
            </CardDescription>
          </CardHeader>

          <CardContent className="py-6">
            {!emailSent ? (
              <FormProvider {...emailForm}>
                <form id="forgot-password-form" onSubmit={emailForm.handleSubmit(onSubmit)} className="space-y-4">
                  {emailFieldSchema.map((field) =>
                    Component ? <Component key={field.name} form={emailForm} schema={field} /> : null
                  )}
                </form>
              </FormProvider>
            ) : (
              <div className="space-y-4">
                <div className="rounded-lg border bg-muted/40 p-4">
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    If an account exists for{" "}
                    <span className="font-medium text-foreground">{submittedEmail}</span>, a password reset link has
                    been sent. Open the link to set a new password.
                  </p>
                </div>
                {isResendDisabled && (
                  <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
                    <BadgeAlert className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>Reset email sent. The link expires after a short time.</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t px-6 py-4">
            {!emailSent ? (
              <Button className="w-full" type="submit" form="forgot-password-form" disabled={isSubmitting}>
                {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                Send reset link
              </Button>
            ) : (
              <Button className="w-full" type="button" onClick={onResend} disabled={isResendDisabled || isSubmitting}>
                {isResendDisabled ? `Resend in ${resendTimer}s` : "Resend reset link"}
              </Button>
            )}
            <p className="text-center text-sm text-muted-foreground">
              <Link to={LOGIN_PATH} className="underline underline-offset-4 hover:text-primary">
                Back to login
              </Link>
            </p>
            {emailSent && (
              <button
                type="button"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
                onClick={() => {
                  setEmailSent(false);
                  setSubmittedEmail("");
                }}>
                Use a different email
              </button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ForgotPassword;
