import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ImageComponent from "@/shared/controls/image";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import React from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/grid/form/validation";
import { useColor, useFont, useTheme } from "./theme";

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
  const { font, setFont } = useFont();

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

  const FontNameConfig = [
    { font: "system", name: "System" },
    { font: "poppins", name: "Poppins" },
    { font: "paprika", name: "Paprika" },
    { font: "inter", name: "Inter" },
    { font: "roboto", name: "Roboto" },
    { font: "oswald", name: "Oswald" },
    { font: "fig-tree", name: "Fig Tree" },
  ];

  const themeModes = [
    {
      type: "system",
      label: "System Mode",
      icon: Monitor,
    },
    {
      type: "light",
      label: "Light Mode",
      icon: Sun,
    },
    {
      type: "dark",
      label: "Dark Mode",
      icon: Moon,
    },
  ];

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 pt-3">
        <BreadcrumbInbuild />
      </div>

      <div className="px-6 py-5 my-2 mx-4 border rounded-md shadow-custom mb-5 bg-background">
        <FormProvider {...form}>
          <div className="space-y-8">
            {/* Logo Upload */}
            <ImageComponent form={form} schema={settingsSchema[1]} />

            {/* Theme Colors */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Theme color</Label>
                <p className="text-sm text-muted-foreground">Select a theme accent color.</p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                {colorNameConfig.map((type) => (
                  <button
                    type="button"
                    key={type.color}
                    onClick={() => setColor(type.color)}
                    className={`relative flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${color === type.color ? "border-primary ring-2 ring-primary/20" : "border-border"}`}
                    style={{ backgroundColor: type.hexcode }}>
                    {color === type.color && <Check className="w-4 h-4 text-white drop-shadow-sm" />}
                  </button>
                ))}

                {/* Custom Multi Color Picker */}
                <button type="button" className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-border hover:scale-105 transition-all duration-200 hover:scale-105 overflow-hidden" title="Custom Color Picker">
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "conic-gradient(from 180deg at 50% 50%, #ff4d4d, #ff9900, #ffd500, #00d084, #00c2ff, #3b82f6, #8b5cf6, #ff4d9d, #ff4d4d)",
                    }}
                  />
                </button>
              </div>
            </div>

            {/* Theme Mode */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Dark/Light Mode</Label>
                <p className="text-sm text-muted-foreground">Select your preferred appearance.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-fit">
                {themeModes.map((mode) => {
                  const Icon = mode.icon;

                  return (
                    <Card
                      key={mode.type}
                      onClick={() => setTheme(mode.type as "system" | "light" | "dark")}
                      className={`relative w-36 cursor-pointer rounded-2xl p-3 transition-all duration-200 hover:shadow-md ${theme === mode.type ? "border-2 border-primary shadow-sm" : "border"}`}>
                      <div className="flex items-center justify-center h-20 rounded-xl bg-muted">
                        <Icon className="w-8 h-8 text-foreground" />
                      </div>

                      <p className="mt-3 text-sm font-medium text-center">{mode.label}</p>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Fonts */}
            <div className="space-y-4">
              <div className="space-y-1">
                <Label className="text-base font-semibold">Fonts</Label>
                <p className="text-sm text-muted-foreground">Select your preferred application font.</p>
              </div>

              <Select defaultValue={font} onValueChange={setFont}>
                <SelectTrigger className="w-[240px] rounded-xl">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>

                <SelectContent>
                  {FontNameConfig.map((font) => (
                    <SelectItem key={font.font} value={font.font}>
                      {font.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

export default settings;
