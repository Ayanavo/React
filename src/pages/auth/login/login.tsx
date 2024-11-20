import GoogleIcon from "@/assets/google.svg";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import showToast from "@/hooks/toast";
import { authAnonymous } from "@/shared/services/auth";
import "@ayanavo/locusjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { useMutation } from "@tanstack/react-query";
import firebase from "firebase/compat/app";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";

// Define validation schema using Zod
const formSchema = z.object({
  username: z.string().min(2, {
    message: "Username must be at least 2 characters.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
});

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
  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  function onSubmit(data: any) {
    // Handle form submission logic here
    console.log(data);
    localStorage.setItem("user", JSON.stringify(data));
    navigate("/dashboard");
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px] ">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
        </CardHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel htmlFor="name">Username</FormLabel>
                      <FormControl>
                        <Input id="name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col space-y-1.5">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <FormControl>
                          <Input id="password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col items-center gap-2">
              <Button className="w-full" type="submit">
                Submit
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted-foreground"></div>
                </div>

                <div className="relative flex justify-center">
                  <span className="bg-background px-3 text-xs uppercase text-muted-foreground">Or continue with</span>
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
              </div>

              <p className="text-sm text-gray-500">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="text-blue-500 hover:underline" preventScrollReset={true}>
                  Sign up
                </Link>
              </p>
            </CardFooter>
          </form>
        </FormProvider>
      </Card>
    </div>
  );
}

export default login;
