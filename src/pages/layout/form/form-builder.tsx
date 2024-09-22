import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DevTool } from "@hookform/devtools";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BooleanComponent from "../../../shared/controls/boolean";
import CheckboxComponent from "../../../shared/controls/checkbox";
import DateComponent from "../../../shared/controls/date";
import DropdownComponent from "../../../shared/controls/dropdown";
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
  skills: string[];
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
    defaultValues: { username: "", email: "", status: false, date: new Date(), skills: ["angular"] },
  });
  const onSubmit = (res: FormObj) => {
    console.log(res);
    navigate("/table");
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle>Create User</CardTitle>
        <CardDescription>Please fill in your details to register.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <TextComponent form={form} />
            <DropdownComponent form={form} />
            <EmailComponent form={form} />
            <BooleanComponent form={form} />
            <DateComponent form={form} />
            <CheckboxComponent form={form} />
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter>
        <Button type="submit" className="w-full" onClick={form.handleSubmit(onSubmit)}>
          Submit
        </Button>
      </CardFooter>
      <DevTool control={form.control} />
    </Card>
  );
}

export default FormBuilder;
