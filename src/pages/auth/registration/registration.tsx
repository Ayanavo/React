import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import z from "zod";

const formSchema = z.object({
  username: z
    .string()
    .min(1, {
      message: "Username is required",
    })
    .min(2, {
      message: "Username must be at least 2 characters.",
    }),
  email: z.string().min(1, { message: "Email is required" }).email({
    message: "Email pattern is invalid.",
  }),
});
function registration() {
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(formSchema),
  });
  function onSubmit(data: any) {
    // Handle form submission logic here
    console.log(data);
    navigate("/login");
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px] ">
        <CardHeader>
          <CardTitle>Create an Account</CardTitle>
          <CardDescription>Create an account and get started!</CardDescription>
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
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input id="email" type="email" {...field} />
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
              </div>

              <p className="text-sm text-gray-500">
                Already have an account?{" "}
                <Link to="/login" className="text-blue-500 hover:underline" preventScrollReset={true}>
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
