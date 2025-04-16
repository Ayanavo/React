import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import ImageComponent from "@/shared/controls/image";
import React, { useState } from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/grid/form/validation";
import { useColor, useTheme } from "./theme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function settings() {
  const settingsSchema: [
    {
      name: string;
      label: string;
      type: "color";
      placeholder?: string;
      validation: { required: boolean };
    },
    {
      name: string;
      label: string;
      type: "image";
      placeholder?: string;
      validation: { required: boolean };
    },
  ] = [
    {
      name: "themecolor",
      label: "",
      type: "color" as "color",
      validation: {
        required: false,
      },
    },
    {
      name: "company_name",
      label: "",
      placeholder: "CP",
      type: "image" as "image",
      validation: {
        required: false,
      },
    },
  ];
  const { theme, setTheme } = useTheme();
  const { color, setColor } = useColor();
  // const { setState } = usePersistedState("vite-ui-sidebar", "left");
  const [selectedView, setSelectedView] = useState("default");
  const [selectedFont, setSelectedFont] = useState("system");
  const form = generateControl(settingsSchema);
  const colorNameConfig = [
    { color: "zinc", hexcode: "#2F2F31" },
    { color: "violet", hexcode: "#7C3AED" },
    { color: "blue", hexcode: "#2563EB" },
    { color: "emerald", hexcode: "#0ea5e9" },
    { color: "teal", hexcode: "#14b8a6" },
    { color: "green", hexcode: "#22c55e" },
    { color: "red", hexcode: "#FF2D55" },
    { color: "orange", hexcode: "#F97316" },
    { color: "yellow", hexcode: "#FFC107" },
  ];

  return (
    <div className="flex flex-col h-[9vh]">
      <div className="px-6">
        <FormProvider {...form}>
          <div className="space-y-6">
            {/* Company Logo Section */}

            <ImageComponent form={form} schema={settingsSchema[1]} />

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Theme color</Label>
                <p className="text-sm text-muted-foreground">Select a theme.</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  {colorNameConfig.map((type) => (
                    <button
                      onClick={() => setColor(type.color)}
                      key={type.color}
                      className={`w-8 h-8 rounded-lg border-2 transition-colors ${color === type.color ? "border-primary" : "border-transparent"}`}
                      style={{ backgroundColor: type.hexcode }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Interface Theme Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Dark/Light Mode</Label>
                <p className="text-sm text-muted-foreground">Select your preferred mode.</p>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {["system", "light", "dark"].map((type) => (
                  <Card
                    key={type}
                    className={`relative cursor-pointer p-1 ${theme === type ? "border-2 border-primary" : ""}`}
                    onClick={() => setTheme(type as "system" | "light" | "dark")}>
                    <div className="aspect-[4/3] rounded-sm bg-muted" />
                    <p className="mt-2 text-center text-sm capitalize">{type} Mode</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar Feature Section */}
            {/* <div className="space-y-4">
              <div className="space-y-2">
                <Label>Sidebar feature</Label>
                <p className="text-sm text-muted-foreground">Which side is your desktop sidebar.</p>
              </div>
              <Select defaultValue="left" onValueChange={setState}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                </SelectContent>
              </Select>
            </div> */}

            {/* Tables View Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Layout Theme</Label>
                <p className="text-sm text-muted-foreground">Select your preferred layout theme.</p>
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

            {/* Fonts Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fonts</Label>
                <p className="text-sm text-muted-foreground">Which side is your desktop sidebar.</p>
              </div>
              <Select defaultValue={selectedFont} onValueChange={setSelectedFont}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select feature" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inter">Inter</SelectItem>
                  <SelectItem value="manrepo">Manrope</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Action Buttons */}
        </FormProvider>
      </div>
    </div>
  );
}

export default settings;
