"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import showToast from "@/hooks/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { componentMap } from "./field-map";
import { FormTabSchema } from "./form-schema";
import generateControl from "./validation";

type ResourceFormBuilderProps<T extends Record<string, unknown>> = {
  formJson: FormTabSchema[];
  queryKey: string;
  listPath: string;
  resourceLabel: string;
  createResource?: (data: T) => Promise<unknown>;
  updateResource?: (id: string, data: T) => Promise<unknown>;
  fetchResource?: (id: string) => Promise<T>;
};

function ResourceFormBuilder<T extends Record<string, unknown>>({ formJson, queryKey, listPath, resourceLabel, createResource, updateResource, fetchResource }: ResourceFormBuilderProps<T>) {
  const { id } = useParams<{ id: string }>();
  const [defaultTab, setDefaultTab] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const flatFields = formJson.flatMap((tab) => tab.sections.flatMap((section) => section.blocks.flatMap((block) => block.fields)));

  const form = generateControl(flatFields);

  useEffect(() => {
    console.log(formJson);

    if (formJson.length > 0) {
      setDefaultTab(formJson[0].tabId);
    }
    if (id && fetchResource) {
      fetchResource(id)
        .then((detail) => {
          Object.keys(detail).forEach((key) => {
            form.setValue(key as keyof T, detail[key as keyof T] as never);
          });
        })
        .catch((error: Error) => {
          showToast({
            title: `Failed to load ${resourceLabel}`,
            description: error.message,
            variant: "error",
          });
        });
    }
  }, [id, fetchResource, form, resourceLabel]);

  const mutation = useMutation<unknown, Error, T>({
    mutationFn: async (payload) => {
      if (id) {
        if (!updateResource) {
          throw new Error("Update handler is not configured");
        }
        return updateResource(id, payload);
      }
      if (!createResource) {
        throw new Error("Create handler is not configured");
      }
      return createResource(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKey] });
      navigate(listPath);
      showToast({
        title: id ? `${resourceLabel} updated successfully` : `${resourceLabel} created successfully`,
        variant: "success",
      });
    },
    onError: (error: Error) => {
      showToast({
        title: id ? `${resourceLabel} update failed` : `${resourceLabel} creation failed`,
        description: error.message,
        variant: "error",
      });
    },
  });

  const getColumn = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    undefined: "grid-cols-1",
  };

  const renderField = (field: FormTabSchema["sections"][number]["blocks"][number]["fields"][number]) => {
    const Component = componentMap[field.type as keyof typeof componentMap];
    return Component ? <Component key={field.name} form={form} schema={field} /> : <div key={field.name}>Unidentified field type: {field.type}</div>;
  };

  if (!defaultTab) {
    return <div className="p-6 text-sm text-muted-foreground">Loading form...</div>;
  }

  return (
    <div className="m-3">
      <Tabs className="w-full mx-auto" defaultValue={defaultTab}>
        <TabsList className={cn("grid w-full", formJson.length === 1 && "grid-cols-1", formJson.length === 2 && "grid-cols-2", formJson.length === 3 && "grid-cols-3", formJson.length >= 4 && "grid-cols-4")}>
          {formJson.map((tab) => (
            <TabsTrigger key={tab.tabId} value={tab.tabId}>
              {tab.tabLabel}
            </TabsTrigger>
          ))}
        </TabsList>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit((values) => mutation.mutate(values as T))}>
            {formJson.map((tab) => (
              <TabsContent key={tab.tabId} value={tab.tabId}>
                {tab.sections.map((section, sectionIndex) => (
                  <Card key={sectionIndex} className="mb-6 shadow-sm">
                    <CardHeader className="space-y-1">
                      <CardTitle>{section.sectionLabel}</CardTitle>
                      <CardDescription>Fill in the details below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`grid ${getColumn[(section.colType ?? 1) as keyof typeof getColumn]} gap-4`}>
                        {section.blocks.map((block, blockIndex) => (
                          <React.Fragment key={blockIndex}>{block.fields.map(renderField)}</React.Fragment>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button type="submit" className="w-full" disabled={mutation.isPending}>
                  {mutation.isPending ? "Saving..." : "Submit"}
                </Button>
              </TabsContent>
            ))}
          </form>
        </FormProvider>
      </Tabs>
    </div>
  );
}

export default ResourceFormBuilder;
