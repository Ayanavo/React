import GoogleIcon from "@/assets/google.svg";
import profile from "@/assets/profile.jpg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/firebase.setup";
import showToast from "@/hooks/toast";
import { componentMap } from "@/pages/layout/logs/form/field-map";
import generateControl from "@/pages/layout/logs/form/validation";
import { registerAPI } from "@/shared/services/auth.ts";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { FirebaseError } from "firebase/app";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import React from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

const formSchemaObj = [
  {
    name: "photoURL",
    label: "Profile",
    type: "image",
    profileDefaultLink: profile,
    validation: {
      required: true,
    },
  },
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
    validation: { minLength: 6 },
  },
  {
    name: "title",
    type: "dropdown",
    label: "Title",
    options: [
      { label: "Mr.", value: "Mr." },
      { label: "Mrs.", value: "Mrs." },
      { label: "Ms.", value: "Ms." },
      { label: "Dr.", value: "Dr." },
      { label: "Prof.", value: "Prof." },
    ],
    validation: { required: true },
  },
  {
    name: "fname",
    label: "First Name",
    type: "text",
    validation: { required: true },
  },
  {
    name: "lname",
    label: "Last Name",
    type: "text",
    validation: { required: true },
  },
];

function registration() {
  const navigate = useNavigate();
  const form = generateControl(formSchemaObj);

  function renderField(field: {
    type: string | number | boolean | React.ReactElement<any, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined;
    name: React.Key | null | undefined;
  }) {
    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ? <Component key={field.name} form={form} schema={field} /> : <div key={field.name}>Unidentified field type: {field.type}</div>;
  }
  const onSubmit = (data: any) => {
    registerAPI(data.email, data.password, data.fname, data.lname, data.title)
      .then(() => {
        showToast({
          title: "Successfully signed in",
          variant: "success",
        });
        // Handle form submission logic here
        navigate("/login");
      })
      .catch((error: FirebaseError) => {
        showToast({
          title: error.message,
          variant: "error",
        });
      });
  };

  function handleLoginProvider(typeofProvider: string): void {
    let singinProvider;

    switch (typeofProvider) {
      case "google":
        singinProvider = new GoogleAuthProvider();
        break;
      case "github":
        singinProvider = new GithubAuthProvider();
        break;
      default:
        console.error(`Invalid sign-in provider: ${typeofProvider}`);
        return;
    }
    signInWithPopup(auth, singinProvider)
      .then((userCredential) => {
        const user = userCredential.user;
        // Handle form submission logic here
        localStorage.setItem("user", JSON.stringify(user));
        showToast({
          title: "Successfully logged in",
          variant: "success",
        });

        navigate("/dashboard");
      })
      .catch((error: FirebaseError) => {
        showToast({
          title: error.message,
          variant: "error",
        });
      });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 md:p-8">
      <Card className="w-[700px] max-w-4xl overflow-hidden">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Create an account and get started!</CardDescription>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid w-full items-center gap-4">{formSchemaObj.map(renderField)}</div>
            </CardContent>

            <CardFooter className="flex flex-col items-center gap-2">
              <Button className="w-full" type="submit">
                Submit
              </Button>
              <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground"></div>
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or register with</span>
                </div>
              </div>

              <div className="grid w-full grid-cols-2 gap-4">
                <Button type="button" variant="outline" onClick={() => handleLoginProvider("google")}>
                  <GoogleIcon />
                  Google
                </Button>
                <Button type="button" variant="outline" onClick={() => handleLoginProvider("github")}>
                  <GitHubLogoIcon />
                  Github
                </Button>
              </div>

              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="underline underline-offset-4 hover:text-primary" preventScrollReset={true}>
                  Log in
                </Link>
              </p>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}

export default registration;
