import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { componentMap } from "@/pages/layout/logs/form/field-map";
import generateControl from "@/pages/layout/logs/form/validation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React from "react";
import { FormProvider } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../../firebase.setup";
import showToast from "@/hooks/toast";
import { FirebaseError } from "firebase/app";

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
    createUserWithEmailAndPassword(auth, data.email, data.password)
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4 md:p-8">
      <Card className="w-[350px] ">
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
              {/* <div className="relative w-full my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground"></div>
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-card px-2 text-xs uppercase text-muted-foreground">Or register with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-10">
                <Button type="button" variant="outline" onClick={() => mutation.mutate("google")}>
                  <span className="mr-2 h-4 w-4">
                    <GoogleIcon />
                  </span>
                  Google
                </Button>
                <Button type="button" variant="outline" onClick={() => mutation.mutate("github")}>
                  <GitHubLogoIcon className="mr-2 h-4 w-4" />
                  Github
                </Button>
              </div> */}

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
