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
import { LoaderCircleIcon } from "lucide-react";
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { startOAuthLogin } from "@/pages/auth/use-oauth-login";
import { TERMS_PATH } from "@/shared/utils/cache-warning";
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
    <div className="relative flex h-[100dvh] min-h-0 w-full items-center justify-center overflow-hidden p-4 md:p-6">
      <InfinityBackground />

      <div className="relative z-10 w-full max-w-[720px]">
        <Card className="login-card overflow-hidden border shadow-lg">
          <div className="grid min-h-0 items-stretch lg:grid-cols-2">
            <div className="login-form-column flex flex-col">
              <CardHeader className="space-y-4 border-b px-5 pb-4 pt-5 md:px-6 md:pt-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[calc(var(--radius)*2)] bg-primary text-primary-foreground shadow-sm">
                    <AppLogo className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-tight text-foreground">Notofy</p>
                    <p className="text-xs text-muted-foreground">Your note workspace</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <CardTitle className="text-xl font-semibold tracking-tight md:text-2xl">Welcome back</CardTitle>
                  <CardDescription>Sign in to pick up where you left off.</CardDescription>
                </div>
              </CardHeader>

              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col">
                  <CardContent className="space-y-3 px-5 py-4 md:px-6">
                    <div className="grid gap-3">{formSchemaObj.map(renderField)}</div>

                    <div className="flex justify-end">
                      <Link
                        to="/forgot-password"
                        className="text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                  </CardContent>

                  <CardFooter className="mt-auto flex-col gap-3 border-t px-5 py-4 md:px-6">
                    <Button className="w-full" type="submit" disabled={loader}>
                      {loader && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
                      Sign in
                    </Button>

                    <div className="relative w-full">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-muted-foreground/40" />
                      </div>
                      <div className="relative flex justify-center">
                        <span className="bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    <div className="grid w-full grid-cols-2 gap-3">
                      <Button type="button" variant="outline" disabled={loader} onClick={() => startOAuthLogin("google")}>
                        <GoogleIcon />
                        Google
                      </Button>
                      <Button type="button" variant="outline" disabled={loader} onClick={() => startOAuthLogin("github")}>
                        <GitHubLogoIcon />
                        Github
                      </Button>
                    </div>

                    <p className="text-center text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <Link to="/register" className="font-medium underline underline-offset-4 hover:text-primary">
                        Create one
                      </Link>
                    </p>

                    <p className="text-center text-xs text-muted-foreground">
                      By signing in, you agree to our{" "}
                      <Link to={TERMS_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
                        Terms & Conditions
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
                <p className="login-visual-panel__eyebrow">Workspace</p>
                <h2 className="login-visual-panel__headline">All your note needs in one place</h2>
              </div>
            </aside>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default login;
