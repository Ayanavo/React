import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "./theme";
import ColorComponent from "@/shared/controls/color";
import ImageComponent from "@/shared/controls/image";
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/logs/form/validation";

function settings() {
  const colorSchema = {
    name: "themecolor",
    type: "color" as "color",
    validation: {
      required: false,
    },
  };
  const { theme, setTheme } = useTheme();
  const [selectedView, setSelectedView] = useState("default");
  const form = generateControl([colorSchema]);

  function onSubmit() {
    console.log(window.matchMedia("(prefers-color-scheme: dark)").matches); // true for dark
    console.log(form.getValues());
  }

  const brandColors = ["#000000", "#2563eb", "#4f46e5", "#0ea5e9", "#14b8a6", "#22c55e"];
  return (
    <div className="flex flex-col min-h-screen">
      <div className="px-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* Company Logo Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company logo</Label>
                  <p className="text-sm text-muted-foreground">Upload your company logo.</p>
                </div>
                <ImageComponent />
              </div>

              {/* Brand Color Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Brand color</Label>
                  <p className="text-sm text-muted-foreground">Select or customize your brand color.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {brandColors.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-lg border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none transition-colors"
                        style={{ backgroundColor: color }}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Custom color:</Label>
                    <div className="w-40">
                      <ColorComponent form={form.control} schema={colorSchema} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Interface Theme Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Interface theme</Label>
                  <p className="text-sm text-muted-foreground">Select your preferred interface theme.</p>
                </div>
                <div className="grid grid-cols-5 gap-4">
                  {["system", "light", "dark"].map((type) => (
                    <Card
                      key={type}
                      className={`relative cursor-pointer p-1 } ${theme === type ? "border-2 border-primary" : ""}`}
                      onClick={() => setTheme(type as "system" | "light" | "dark")}>
                      <div className="aspect-[4/3] rounded-sm bg-muted" />
                      <p className="mt-2 text-center text-sm capitalize">{type} Mode</p>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Sidebar Feature Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Sidebar feature</Label>
                  <p className="text-sm text-muted-foreground">What shows in the desktop sidebar.</p>
                </div>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select feature" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Recent changes</SelectItem>
                    <SelectItem value="favorites">Favorites</SelectItem>
                    <SelectItem value="most-used">Most used</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tables View Section */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tables view</Label>
                  <p className="text-sm text-muted-foreground">How are tables displayed in the app.</p>
                </div>
                <div className="grid grid-cols-5 gap-4 ">
                  {["default", "compact"].map((view) => (
                    <Card key={view} className={`relative cursor-pointer p-1 ${selectedView === view ? "border-2 border-primary" : ""}`} onClick={() => setSelectedView(view)}>
                      <div className="aspect-[4/3] rounded-sm bg-muted" />
                      <p className="mt-2 text-center text-sm capitalize">{view}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-4">
              <Button type="reset" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save changes</Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default settings;
