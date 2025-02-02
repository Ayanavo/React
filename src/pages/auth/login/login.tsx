import GoogleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import showToast from "@/hooks/toast";
import { componentMap } from "@/pages/layout/logs/form/field-map";
import generateControl from "@/pages/layout/logs/form/validation";
import { authAnonymous } from "@/shared/services/auth";
import "@ayanavo/locusjs";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import firebase from "firebase/compat/app";
import React from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import imgUrl from "/src/assets/3d-render-secure-login-password-illustration.jpg";

const formSchemaObj = [
  {
    name: "email",
    label: "Email",
    type: "email",
    default: [],
    validation: { required: true, email: true },
    field_prop: {
      single: true,
    },
  },
  {
    name: "password",
    label: "Password",
    type: "password",
    default: "",
    validation: { required: true },
  },
];

function login() {
  const mutation = useMutation<firebase.auth.UserCredential, Error, string>({
    mutationFn: authAnonymous,
    onSuccess: (res) => {
      localStorage.setItem("access_token", (res.credential?.toJSON() as { accessToken: string })["accessToken"]);
      navigate("/dashboard");
      showToast({
        description: "Successfully logged in",
      });
    },
    onError: (error) => {
      console.error("Submission failed:", error);
    },
  });

  //form builder function
  const navigate = useNavigate();
  const form = generateControl(formSchemaObj);
  function renderField(field: {
    type: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined;
    name: React.Key | null | undefined;
  }) {
    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ? <Component key={field.name} form={form} schema={field} /> : <div key={field.name}>Unidentified field type: {field.type}</div>;
  }
  function onSubmit(data: any) {
    // Handle form submission logic here
    localStorage.setItem("user", JSON.stringify(data));
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 md:p-8">
      <Card className="w-[700px] max-w-4xl overflow-hidden">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/2 p-6 md:p-8">
            <CardHeader className="p-0 mb-6">
              <CardTitle>Login</CardTitle>
              <CardDescription>Enter your credentials to access your account.</CardDescription>
            </CardHeader>
            <FormProvider {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent className="p-0">
                  <div className="grid w-full items-center gap-4">{formSchemaObj.map(renderField)}</div>
                </CardContent>
                <CardFooter className="flex flex-col items-center gap-2 p-0 mt-6">
                  <Button className="w-full" type="submit">
                    Submit
                  </Button>
                  <div className="relative w-full my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-muted-foreground"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or continue with</span>
                    </div>
                  </div>
                  <div className="grid w-full grid-cols-2 gap-4">
                    <Button type="button" variant="outline" onClick={() => mutation.mutate("google")}>
                      <GoogleIcon />
                      Google
                    </Button>
                    <Button type="button" variant="outline" onClick={() => mutation.mutate("github")}>
                      <GitHubLogoIcon />
                      Github
                    </Button>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Don&apos;t have an account?{" "}
                    <Link to="/register" className="underline underline-offset-4 hover:text-primary">
                      Sign up
                    </Link>
                  </p>
                </CardFooter>
              </form>
            </FormProvider>
          </div>
          <div className="hidden md:block md:w-1/2">
            <div className="relative h-full">
              <img src={`${imgUrl}?height=600&width=400" alt="Login visual`} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="absolute inset-0 flex items-center justify-center p-6">
                <h2 className="text-3xl font-bold text-white text-center">Welcome to Our Platform</h2>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default login;
