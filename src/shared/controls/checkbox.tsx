import { FormField, FormItem, FormControl, FormLabel, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import React from "react";

function checkbox({ form }: { form: any }) {
  const items = [
    { id: "react", label: "React" },
    { id: "vue", label: "Vue" },
    { id: "angular", label: "Angular" },
    { id: "svelte", label: "Svelte" },
  ] as const;

  return (
    <FormField
      control={form.control}
      name="skills"
      render={() => (
        <FormItem>
          <div className="mb-4">
            <FormLabel className="text-base">Sidebar</FormLabel>
            <FormDescription>Select the technologies you're familiar with.</FormDescription>
          </div>

          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
            <FormControl>
              <Checkbox
                checked={form.watch("skills")?.length === items.length}
                onCheckedChange={(checked) => {
                  return checked ?
                      form.setValue(
                        "skills",
                        items.map((item) => item.id)
                      )
                    : form.setValue("skills", []);
                }}
              />
            </FormControl>
            <FormLabel className="text-sm font-normal">Select All</FormLabel>
          </FormItem>

          {items.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="skills"
              render={({ field }) => (
                <FormItem key={item.id} className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(item.id)}
                      onCheckedChange={(checked) => {
                        return checked ? field.onChange([...field.value, item.id]) : field.onChange(field.value?.filter((value: string) => value !== item.id));
                      }}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">{item.label}</FormLabel>
                </FormItem>
              )}
            />
          ))}
        </FormItem>
      )}
    />
  );
}

export default checkbox;
