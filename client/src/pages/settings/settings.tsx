import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import showToast from "@/hooks/toast";
import { DEFAULT_DATE_FORMAT } from "@/lib/date-format";
import DropdownComponent from "@/shared/controls/dropdown";
import ImageComponent from "@/shared/controls/image";
import { saveSettingsAPI } from "@/shared/services/auth";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import moment from "moment";
import React from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/grid/form/validation";
import { useColor, useFont, useTheme } from "./theme";

const currencyOptions = [
  { label: "Indian Rupees - ₹", value: "INR" },
  { label: "US Dollar - $", value: "USD" },
  { label: "Euro - €", value: "EUR" },
  { label: "British Pound - £", value: "GBP" },
  { label: "Japanese Yen - ¥", value: "JPY" },
  { label: "Australian Dollar - A$", value: "AUD" },
  { label: "Canadian Dollar - C$", value: "CAD" },
  { label: "Singapore Dollar - S$", value: "SGD" },
  { label: "Swiss Franc - CHF", value: "CHF" },
  { label: "Chinese Yuan - ¥", value: "CNY" },
  { label: "UAE Dirham - د.إ", value: "AED" },
  { label: "Saudi Riyal - ﷼", value: "SAR" },
  { label: "New Zealand Dollar - NZ$", value: "NZD" },
  { label: "South African Rand - R", value: "ZAR" },
  { label: "Hong Kong Dollar - HK$", value: "HKD" },
  { label: "Swedish Krona - kr", value: "SEK" },
];

const dateFormatOptions = ["/", "-", "."].flatMap((delimiter) =>
  ["MM", "MMM", "MMMM"].flatMap((month) =>
    [
      ["DD", month, "YYYY"],
      ["DD", "YYYY", month],
      [month, "DD", "YYYY"],
      [month, "YYYY", "DD"],
      ["YYYY", "DD", month],
      ["YYYY", month, "DD"],
    ].map((parts) => {
      const value = parts.join(delimiter);
      return { label: moment().format(value), value };
    })
  )
);

const getDelimiter = (dateFormat: string) => dateFormat.match(/[\/.-]/)?.[0] ?? "/";

function settings() {
  const { theme, setTheme } = useTheme();
  const { color, setColor } = useColor();
  const { font, setFont } = useFont();
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSettings, setSavedSettings] = React.useState(() => ({
    date_format: sessionStorage.getItem("date_format") ?? DEFAULT_DATE_FORMAT,
    currency_format: sessionStorage.getItem("currency_code") ?? "INR",
    font_style: sessionStorage.getItem("font_style") ?? font,
    theme: sessionStorage.getItem("theme") ?? theme,
  }));

  const dateFormatSchema = {
    name: "date_format",
    label: "Date Format",
    placeholder: "Select date format",
    type: "list" as "list",
    options: dateFormatOptions,
    default: sessionStorage.getItem("date_format") ?? DEFAULT_DATE_FORMAT,
    validation: {
      required: true,
    },
  };

  const currencyFormatSchema = {
    name: "currency_format",
    label: "Currency Format",
    placeholder: "Select currency format",
    type: "list" as "list",
    options: currencyOptions,
    default: sessionStorage.getItem("currency_code") ?? "INR",
    validation: {
      required: true,
    },
  };

  const companyNameSchema = {
    name: "company_name",
    label: "",
    placeholder: "CP",
    type: "image" as "image",
    validation: {
      required: false,
    },
  };

  const fontSchema = {
    name: "font_style",
    label: "Font Style",
    placeholder: "Select font style",
    type: "list" as "list",
    options: [
      { label: "System", value: "system" },
      { label: "Poppins", value: "poppins" },
      { label: "Paprika", value: "paprika" },
      { label: "Inter", value: "inter" },
      { label: "Roboto", value: "roboto" },
      { label: "Oswald", value: "oswald" },
      { label: "Fig Tree", value: "fig-tree" },
    ],
    default: font,
    validation: {
      required: true,
    },
  };

  const settingsSchema = [
    dateFormatSchema,
    currencyFormatSchema,
    fontSchema,
    {
      name: "themecolor",
      label: "",
      type: "color" as "color",
      validation: {
        required: false,
      },
    },
    companyNameSchema,
  ];

  const form = generateControl(settingsSchema);
  const selectedDateFormat = form.watch("date_format");
  const selectedCurrencyCode = form.watch("currency_format");
  const selectedFontStyle = form.watch("font_style");

  React.useEffect(() => {
    if (selectedFontStyle) {
      setFont(selectedFontStyle as Parameters<typeof setFont>[0]);
    }
  }, [selectedFontStyle, setFont]);

  const hasUpdates =
    selectedDateFormat !== savedSettings.date_format ||
    selectedCurrencyCode !== savedSettings.currency_format ||
    selectedFontStyle !== savedSettings.font_style ||
    theme !== savedSettings.theme;

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      await saveSettingsAPI({
        date_format: selectedDateFormat,
        currency_format: selectedCurrencyCode,
        font_style: selectedFontStyle,
        theme,
      });

      sessionStorage.setItem("date_format", selectedDateFormat);
      sessionStorage.setItem("delimiter", getDelimiter(selectedDateFormat));
      sessionStorage.setItem("currency_code", selectedCurrencyCode);
      sessionStorage.setItem("font_style", selectedFontStyle);
      sessionStorage.setItem("theme", theme);
      setSavedSettings({
        date_format: selectedDateFormat,
        currency_format: selectedCurrencyCode,
        font_style: selectedFontStyle,
        theme,
      });

      showToast({ title: "Settings saved successfully", variant: "success" });
    } catch (error) {
      showToast({
        title: "Settings save failed",
        description: error instanceof Error ? error.message : "Unable to save settings",
        variant: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

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
            <div className="space-y-4 max-w-sm">
              <DropdownComponent form={form} schema={dateFormatSchema} />
            </div>

            <div className="space-y-4 max-w-sm">
              <DropdownComponent form={form} schema={currencyFormatSchema} />
            </div>

            {/* Fonts */}
            <div className="space-y-4 max-w-sm">
              <DropdownComponent form={form} schema={fontSchema} />
            </div>

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
                <button
                  type="button"
                  className="relative flex items-center justify-center w-10 h-10 rounded-xl border-2 border-border hover:scale-105 transition-all duration-200 hover:scale-105 overflow-hidden"
                  title="Custom Color Picker">
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "conic-gradient(from 180deg at 50% 50%, #ff4d4d, #ff9900, #ffd500, #00d084, #00c2ff, #3b82f6, #8b5cf6, #ff4d9d, #ff4d4d)",
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

            {/* Logo Upload */}
            <ImageComponent form={form} schema={companyNameSchema} />

            <Button type="button" className="w-full" onClick={saveSettings} disabled={!hasUpdates || isSaving}>
              {isSaving ? "Updating..." : "Update Settings"}
            </Button>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

export default settings;
