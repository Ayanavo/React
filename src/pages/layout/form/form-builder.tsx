import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DevTool } from "@hookform/devtools";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BooleanComponent from "../../../shared/controls/boolean";
import DateComponent from "../../../shared/controls/date";
import EmailComponent from "../../../shared/controls/email";
import TextComponent from "../../../shared/controls/text";

type FormObj = {
  username: string;
  // password: string;
  email: string;
  status: boolean;
  date: Date;
  // phone: string;
  // address: string;
  // website: string;
  // company: string;
  // tags: string[];
  // skills: string[];
  // hobbies: string[];
  // languages: string[];
  // interests: string[];
  // education: string[];
  // experience: string[];
  // projects: string[];
  // references: string[];
  // portfolio: string[];
};
function FormBuilder() {
  const navigate = useNavigate();
  const form = useForm<FormObj>({
    defaultValues: { username: "", email: "", status: true, date: new Date() },
  });
  const onSubmit = (res: FormObj) => {
    console.log(res);
    navigate("/table");
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <Card className="w-full">
        <CardHeader className="space-y-1">
          <CardTitle>Create User</CardTitle>
          <CardDescription>Please fill in your details to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <TextComponent form={form} />
              <EmailComponent form={form} />
              <BooleanComponent form={form} />
              <DateComponent form={form} />
              <DevTool control={form.control} />
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>
            Submit
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default FormBuilder;
