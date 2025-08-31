"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import showToast from "@/hooks/toast";
import { createActivity, fetchActivityDetail, updateActivity } from "@/shared/services/activity";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { User } from "../table/user.model";
import { componentMap } from "./field-map";
import formJson from "./form_new";
import generateControl from "./validation";

function FormBuilder() {
  const { id } = useParams<{ id: string }>();
  const [defaultTab, setDefaultTab] = useState<string | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    formJson.length > 0 && setDefaultTab(formJson[0].tabId);
    id && fetchDetails();
  }, []);
  const navigate = useNavigate();
  const form = generateControl(
    formJson.map((tab) => tab.sections.map((json) => json.blocks.map((block) => block.fields))).flat(Infinity) as Array<{
      validation: any;
      name: string;
      label: string;
      type: string;
    }>
  );

  const mutation = useMutation<unknown, Error, { activity: User }>({
    mutationFn: async ({ activity }) => {
      if (id) {
        return await updateActivity(id, activity);
      } else {
        return await createActivity(activity);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      navigate("/table");
      showToast({
        title: id ? "Activity updated successfully" : "Activity created successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: id ? "Activity update failed" : "Activity creation failed",
        description: error.message,
        variant: "error",
      });
    },
  });

  const fetchDetails = () => {
    fetchActivityDetail(id as string)
      .then((activityDetail) => {
        if (activityDetail && typeof activityDetail === "object") {
          Object.keys(activityDetail).forEach((key) => {
            form.setValue(key as keyof User, (activityDetail as any)[key]);
          });
        }
      })
      .catch((error: Error) => {
        showToast({
          title: "Activity creation failed",
          description: error.message,
          variant: "error",
        });
      });
  };

  const onSubmit = (res: { [index: string]: any }) => {
    mutation.mutate({ activity: res as User });
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
    <div className="m-3">
      <Tabs className="w-full 134 mx-auto" defaultValue={defaultTab}>
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
      </Tabs>
    </div>
  );
}

export default FormBuilder;
