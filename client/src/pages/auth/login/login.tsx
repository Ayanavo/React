import imgUrl from "@/assets/Notebook.jpeg";
import GoogleIcon from "@/assets/google.svg";
import { AppLogo } from "@/components/app-logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { componentMap } from "@/pages/layout/grid/form/field-map";
import generateControl from "@/pages/layout/grid/form/validation";
import { loginAPI } from "@/shared/services/auth.ts";
import { showCacheUseWarning } from "@/shared/utils/cache-warning";
import "@ayanavo/locusjs";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { LayoutDashboardIcon, LoaderCircleIcon, LockIcon, ShieldCheckIcon, StickyNoteIcon } from "lucide-react";
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { startOAuthLogin } from "@/pages/auth/use-oauth-login";
import { FORGOT_PASSWORD_PATH, REGISTER_PATH } from "@/shared/utils/auth-paths";
import { PRIVACY_PATH, TERMS_PATH } from "@/shared/utils/policy-paths";
import InfinityBackground from "./infinity-background";
import "./login.scss";

const formSchemaObj = [
  {
    name: "email",
    label: "Email",
    type: "emailsingle",
    default: "",
    validation: { required: true, email: true },
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    default: "",
    validation: { required: true, minLength: 6 },
  },
];

const FEATURES = [
  {
    icon: StickyNoteIcon,
    title: "Unified notes",
    description: "Ideas, tasks, and documents in one place.",
  },
  {
    icon: LayoutDashboardIcon,
    title: "Smart dashboards",
    description: "Track activity and progress at a glance.",
  },
  {
    icon: LockIcon,
    title: "Enterprise security",
    description: "Encrypted sessions and secure auth.",
  },
] as const;

function login() {
  const navigate = useNavigate();
  const [loader, setLoader] = useState(false);
  const form = generateControl(formSchemaObj);

  function renderField(field: {
    type:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | null
      | undefined;
    name: React.Key | null | undefined;
  }) {
    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ?
        <Component key={field.name} form={form} schema={field} />
      : <div key={field.name}>Unidentified field type: {field.type}</div>;
  }

  async function onSubmit(data: any) {
    setLoader(true);
    try {
      const rememberMe = Boolean(data.RememberMe);
      const userCredential = await loginAPI({
        ...data,
        rememberMe,
      });

      showToast({ title: userCredential.message || "Successfully logged in", variant: "success" });
      showCacheUseWarning();

      navigate("/dashboard");
    } catch (error: any) {
      showToast({
        title: error.response?.data?.message || "Login failed",
        variant: "error",
      });
    } finally {
      setLoader(false);
    }
  }

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
                    Secure sign-in
                  </span>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight">Welcome back</CardTitle>
                  <CardDescription className="text-sm">Sign in to your account to continue.</CardDescription>
                </div>
              </CardHeader>

              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
                  <CardContent className="space-y-2.5 px-5 py-3.5">
                    <div className="grid gap-3">{formSchemaObj.map(renderField)}</div>

                    <div className="flex justify-end">
                      <Link
                        to={FORGOT_PASSWORD_PATH}
                        className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                        Forgot password?
                      </Link>
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto flex-col gap-2.5 px-5 pb-5 pt-0">
                    <Button className="h-9 w-full text-sm font-medium" type="submit" disabled={loader}>
                      {loader && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                      Sign in
                    </Button>

                    <div className="login-divider w-full">
                      <span>Or continue with</span>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-2.5">
                      <Button
                        type="button"
                        variant="outline"
                        className="login-oauth-btn"
                        disabled={loader}
                        onClick={() => startOAuthLogin("google")}>
                        <GoogleIcon />
                        Google
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        className="login-oauth-btn"
                        disabled={loader}
                        onClick={() => startOAuthLogin("github")}>
                        <GitHubLogoIcon />
                        GitHub
                      </Button>
                    </div>

                    <p className="text-center text-xs text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link
                        to={REGISTER_PATH}
                        className="font-medium text-foreground underline-offset-4 transition-colors hover:underline">
                        Create one
                      </Link>
                    </p>

                    <p className="text-center text-[0.625rem] leading-snug text-muted-foreground">
                      By signing in, you agree to our{" "}
                      <Link
                        to={TERMS_PATH}
                        className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        to={PRIVACY_PATH}
                        className="underline-offset-4 transition-colors hover:text-foreground hover:underline">
                        Privacy Policy
                      </Link>
                      .
                    </p>
                  </CardFooter>
                </form>
              </FormProvider>
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
                    Workspace
                  </p>
                  <h2 className="login-visual-panel__headline">Built for focused teams</h2>
                  <p className="login-visual-panel__subline">Notes, activities, and collaboration in one platform.</p>
                </div>

                <ul className="login-visual-panel__features">
                  {FEATURES.map(({ icon: Icon, title, description }) => (
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

export default login;
