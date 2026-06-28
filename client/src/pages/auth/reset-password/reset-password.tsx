import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { useFullPageScroll } from "@/hooks/use-full-page-scroll";
import PasswordStrengthField from "@/pages/auth/registration/password-strength-field";
import generateControl from "@/pages/layout/grid/form/validation";
import { getPasswordResetStatusAPI, resetPasswordAPI } from "@/shared/services/auth.ts";
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from "@/shared/utils/auth-paths";
import { PASSWORD_MIN_LENGTH, PASSWORD_PATTERN } from "@/shared/utils/password-strength";
import { LoaderCircleIcon, ShieldCheckIcon } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const passwordFieldSchema = [
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
];

function ResetPassword() {
  useFullPageScroll();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isValidLink, setIsValidLink] = useState(false);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkChecked, setLinkChecked] = useState(false);

  const passwordForm = generateControl(passwordFieldSchema);

  const checkResetLink = useCallback(async (resetEmail: string, resetToken: string) => {
    try {
      const status = await getPasswordResetStatusAPI(resetEmail, resetToken);
      if (!status.valid) {
        setIsValidLink(false);
        const errorMessages: Record<string, string> = {
          "invalid-link": "This password reset link is invalid.",
          "expired-link": "This password reset link has expired. Please request a new one.",
        };
        showToast({
          title: errorMessages[status.reason || ""] || "Invalid reset link",
          variant: "error",
        });
        return false;
      }

      setIsValidLink(true);
      return true;
    } catch {
      setIsValidLink(false);
      showToast({ title: "Failed to validate reset link", variant: "error" });
      return false;
    } finally {
      setLinkChecked(true);
    }
  }, []);

  useEffect(() => {
    const urlStep = searchParams.get("step");
    const urlEmail = searchParams.get("email");
    const urlToken = searchParams.get("token");
    const urlError = searchParams.get("error");

    if (urlError) {
      const errorMessages: Record<string, string> = {
        "invalid-link": "This password reset link is invalid.",
        "expired-link": "This password reset link has expired. Please request a new one.",
        "reset-failed": "Password reset failed. Please try again.",
      };
      showToast({
        title: errorMessages[urlError] || "Password reset failed",
        variant: "error",
      });

      if (urlEmail) {
        setEmail(urlEmail.trim().toLowerCase());
      }

      setSearchParams({});
      setLinkChecked(true);
      return;
    }

    const hasResetParams = Boolean(urlEmail && urlToken && (urlStep === "reset" || !urlStep));

    if (hasResetParams && urlEmail && urlToken) {
      const normalizedEmail = urlEmail.trim().toLowerCase();
      setEmail(normalizedEmail);
      setToken(urlToken);
      setIsValidLink(true);
      setSearchParams({});

      void checkResetLink(normalizedEmail, urlToken).then((valid) => {
        if (!valid) {
          setIsValidLink(false);
        }
      });
      return;
    }

    setLinkChecked(true);
  }, [checkResetLink, searchParams, setSearchParams]);

  const onSubmit = async (data: Record<string, string>) => {
    if (!email || !token) return;

    setIsSubmitting(true);
    try {
      const response = await resetPasswordAPI({
        email,
        token,
        password: data.password,
      });
      showToast({ title: response.message, variant: "success" });
      navigate(LOGIN_PATH, { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to reset password";
      showToast({ title: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!linkChecked) {
    return null;
  }

  if (!isValidLink || !email || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/60 px-4 py-6">
        <Card className="w-full max-w-lg border shadow-lg">
          <CardHeader>
            <CardTitle>Reset link unavailable</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Request a new link to continue.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex-col gap-2 border-t px-6 py-4">
            <Button className="w-full" asChild>
              <Link to={email ? `${FORGOT_PASSWORD_PATH}?email=${encodeURIComponent(email)}` : FORGOT_PASSWORD_PATH}>
                Request new reset link
              </Link>
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to={LOGIN_PATH} className="underline underline-offset-4 hover:text-primary">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-muted/60 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-lg">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-4 border-b pb-5">
            <div className="space-y-1">
              <CardTitle className="text-2xl">Set a new password</CardTitle>
              <CardDescription>
                Your reset link is valid. Choose a new password for your Notofy account.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 rounded-lg border bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
              <ShieldCheckIcon className="h-4 w-4 shrink-0" />
              <span>
                Resetting password for <span className="font-medium">{email}</span>
              </span>
            </div>
          </CardHeader>

          <CardContent className="py-6">
            <FormProvider {...passwordForm}>
              <form id="reset-password-form" onSubmit={passwordForm.handleSubmit(onSubmit)} className="space-y-5">
                <PasswordStrengthField form={passwordForm} />
              </form>
            </FormProvider>
          </CardContent>

          <CardFooter className="flex-col gap-2 border-t px-6 py-4">
            <Button className="w-full" type="submit" form="reset-password-form" disabled={isSubmitting}>
              {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
              Update password
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              <Link to={LOGIN_PATH} className="underline underline-offset-4 hover:text-primary">
                Back to login
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default ResetPassword;
