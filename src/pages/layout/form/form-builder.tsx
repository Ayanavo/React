"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DevTool } from "@hookform/devtools";
import React, { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BooleanComponent from "../../../shared/controls/boolean";
import CheckboxComponent from "../../../shared/controls/checkbox";
import DateComponent from "../../../shared/controls/date";
import DropdownComponent from "../../../shared/controls/dropdown";
import EditorComponent from "../../../shared/controls/editor";
import EmailComponent from "../../../shared/controls/email";
import FileComponent from "../../../shared/controls/file";
import PasswordComponent from "../../../shared/controls/password";
import PhoneComponent from "../../../shared/controls/phone";
import RadioComponent from "../../../shared/controls/radio";
import TextComponent from "../../../shared/controls/text";
import TextareaComponent from "../../../shared/controls/textarea";
import ColorComponent from "../../../shared/controls/color";
import RatingComponent from "../../../shared/controls/rating";
import NumberComponent from "../../../shared/controls/number";
import formJson from "./form.json";
import moment from "moment";

type FormObj = {
  [key: string]: string | boolean | Date | number | string[];
};

const componentMap: Record<string, React.ComponentType<any>> = {
  text: TextComponent,
  textarea: TextareaComponent,
  boolean: BooleanComponent,
  dropdown: DropdownComponent,
  email: EmailComponent,
  radio: RadioComponent,
  checkbox: CheckboxComponent,
  password: PasswordComponent,
  file: FileComponent,
  date: DateComponent,
  html: EditorComponent,
  tel: PhoneComponent,
  color: ColorComponent,
  rating: RatingComponent,
  number: NumberComponent,
};

function FormBuilder() {
  const [defaultTab, setDefaultTab] = useState<string | null>(null);
  useEffect(() => {
    formJson.length > 0 && setDefaultTab(formJson[0].tabId);
  }, []);
  const navigate = useNavigate();
  const form = useForm<FormObj>({
    defaultValues: { username: "", email: "", ifce: 0, status: false, expiryDate: new Date(moment("15.11.1999", "DD.MM.YYYY").format()), skills: ["angular"] },
  });
  const onSubmit = (res: FormObj) => {
    console.log(res);
    navigate("/table");
  };

  const getColumn = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    undefined: "grid-cols-1",
  };

  const renderField = (field: any) => {
    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ? <Component key={field.name} form={form} schema={field} /> : <div key={field.name}>Unidentified field type: {field.type}</div>;
  };

  if (!defaultTab) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs className="w-full max-w-6xl mx-auto" defaultValue={defaultTab}>
      <TabsList className={`grid w-full grid-cols-4`}>
        {formJson.map((tab) => (
          <TabsTrigger key={tab.tabId} value={tab.tabId}>
            {tab.tabLabel}
          </TabsTrigger>
        ))}
      </TabsList>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {formJson.map((tab) => (
            <TabsContent key={tab.tabId} value={tab.tabId}>
              {tab.sections.map((section, blockIndex) => (
                <Card key={blockIndex} className="mb-6">
                  <CardHeader className="space-y-1">
                    <CardTitle>{section.sectionLabel}</CardTitle>
                    <CardDescription>Please fill in your details for this section.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className={`grid ${getColumn[section.colType as keyof typeof getColumn]} gap-4`}>{section.blocks?.map((block) => block.fields.map(renderField))}</div>
                  </CardContent>
                </Card>
              ))}
              <Button type="submit" className="w-full">
                Submit
              </Button>
            </TabsContent>
          ))}
        </form>
      </FormProvider>
      <DevTool control={form.control} />
    </Tabs>
  );
}

export default FormBuilder;
