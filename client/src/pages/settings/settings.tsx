import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import PageBreadcrumbBar from "@/components/inbuild/page-breadcrumb-bar";
import { Button } from "@/components/ui/button";
import showToast from "@/hooks/toast";
import {
  applySessionWeekStart,
  DEFAULT_DATE_FORMAT,
  DEFAULT_TIME_FORMAT,
  DEFAULT_WEEK_START,
  type TimeFormat,
  type WeekStart,
} from "@/lib/date-format";
import { cn } from "@/lib/utils";
import DropdownComponent from "@/shared/controls/dropdown";
import ImageComponent from "@/shared/controls/image";
import { saveSettingsAPI } from "@/shared/services/auth";
import { CalendarDays, Check, ImageIcon, Palette, Type, type LucideIcon } from "lucide-react";
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

const weekStartOptions = [
  { label: "Sunday", value: "sunday" },
  { label: "Monday", value: "monday" },
  { label: "Saturday", value: "saturday" },
];

const timeFormatOptions = [
  { label: `12-hour (${moment().format("h:mm A")})`, value: "12" },
  { label: `24-hour (${moment().format("HH:mm")})`, value: "24" },
];

const getDelimiter = (dateFormat: string) => dateFormat.match(/[\/.-]/)?.[0] ?? "/";

const settingsCardClass = "bg-white dark:bg-card";

function SettingsSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", settingsCardClass)}>
      <div className="mb-5 flex items-start gap-3 border-b border-dotted border-border pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dotted border-border bg-muted/40 text-muted-foreground">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <h2 className="min-w-0 text-base font-semibold">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function settings() {
  const { theme } = useTheme();
  const { color, setColor } = useColor();
  const { font, setFont } = useFont();
  const [isSaving, setIsSaving] = React.useState(false);
  const [savedSettings, setSavedSettings] = React.useState(() => ({
    date_format: sessionStorage.getItem("date_format") ?? DEFAULT_DATE_FORMAT,
    week_start: (sessionStorage.getItem("week_start") as WeekStart | null) ?? DEFAULT_WEEK_START,
    time_format: (sessionStorage.getItem("time_format") as TimeFormat | null) ?? DEFAULT_TIME_FORMAT,
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

  const weekStartSchema = {
    name: "week_start",
    label: "Week Starts On",
    placeholder: "Select week start",
    type: "list" as "list",
    options: weekStartOptions,
    default: sessionStorage.getItem("week_start") ?? DEFAULT_WEEK_START,
    validation: {
      required: true,
    },
  };

  const timeFormatSchema = {
    name: "time_format",
    label: "Time Format",
    placeholder: "Select time format",
    type: "list" as "list",
    options: timeFormatOptions,
    default: sessionStorage.getItem("time_format") ?? DEFAULT_TIME_FORMAT,
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
    weekStartSchema,
    timeFormatSchema,
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
  const selectedWeekStart = form.watch("week_start");
  const selectedTimeFormat = form.watch("time_format");
  const selectedCurrencyCode = form.watch("currency_format");
  const selectedFontStyle = form.watch("font_style");

  React.useEffect(() => {
    if (selectedFontStyle) {
      setFont(selectedFontStyle as Parameters<typeof setFont>[0]);
    }
  }, [selectedFontStyle, setFont]);

  const hasUpdates =
    selectedDateFormat !== savedSettings.date_format ||
    selectedWeekStart !== savedSettings.week_start ||
    selectedTimeFormat !== savedSettings.time_format ||
    selectedCurrencyCode !== savedSettings.currency_format ||
    selectedFontStyle !== savedSettings.font_style;

  const saveSettings = async () => {
    try {
      setIsSaving(true);
      const response = await saveSettingsAPI({
        date_format: selectedDateFormat,
        week_start: selectedWeekStart,
        time_format: selectedTimeFormat,
        currency_format: selectedCurrencyCode,
        font_style: selectedFontStyle,
        theme,
      });

      sessionStorage.setItem("date_format", selectedDateFormat);
      sessionStorage.setItem("delimiter", getDelimiter(selectedDateFormat));
      sessionStorage.setItem("week_start", selectedWeekStart);
      sessionStorage.setItem("time_format", selectedTimeFormat);
      sessionStorage.setItem("currency_code", selectedCurrencyCode);
      sessionStorage.setItem("font_style", selectedFontStyle);
      sessionStorage.setItem("theme", theme);
      applySessionWeekStart(selectedWeekStart as WeekStart);
      setSavedSettings({
        date_format: selectedDateFormat,
        week_start: selectedWeekStart,
        time_format: selectedTimeFormat,
        currency_format: selectedCurrencyCode,
        font_style: selectedFontStyle,
        theme,
      });

      showToast({ title: response?.message || "Settings saved successfully", variant: "success" });
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

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-none">
      <div className="flex flex-col">
        <PageBreadcrumbBar>
          <BreadcrumbInbuild />
        </PageBreadcrumbBar>

        <div className="mx-4 my-2 mb-5 space-y-4">
          <div className={cn("rounded-lg border border-dashed border-border px-6 py-5 shadow-sm", settingsCardClass)}>
            <h1 className="text-xl font-semibold">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Customize regional formats, typography, appearance, and branding for your workspace.
            </p>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void saveSettings();
              }}
              className="space-y-4">
              <SettingsSection title="Regional preferences" icon={CalendarDays}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <DropdownComponent form={form} schema={dateFormatSchema} />
                  <DropdownComponent form={form} schema={weekStartSchema} />
                  <DropdownComponent form={form} schema={timeFormatSchema} />
                  <DropdownComponent form={form} schema={currencyFormatSchema} />
                </div>
              </SettingsSection>

              <SettingsSection title="Typography" icon={Type}>
                <div className="sm:max-w-md">
                  <DropdownComponent form={form} schema={fontSchema} />
                </div>
              </SettingsSection>

              <SettingsSection title="Appearance" icon={Palette}>
                <div className="flex flex-wrap items-center gap-3">
                  {colorNameConfig.map((type) => (
                    <button
                      type="button"
                      key={type.color}
                      onClick={() => setColor(type.color)}
                      className={cn(
                        "relative flex h-10 w-10 items-center justify-center rounded-xl border-2 transition-all duration-200 hover:scale-105",
                        color === type.color ? "border-primary ring-2 ring-primary/20" : "border-border"
                      )}
                      style={{ backgroundColor: type.hexcode }}>
                      {color === type.color && (
                        <Check className="h-4 w-4 text-white drop-shadow-sm" aria-hidden="true" />
                      )}
                    </button>
                  ))}

                  <button
                    type="button"
                    className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border-2 border-border transition-all duration-200 hover:scale-105"
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
              </SettingsSection>

              <SettingsSection title="Branding" icon={ImageIcon}>
                <ImageComponent form={form} schema={companyNameSchema} />
              </SettingsSection>

              <div className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", settingsCardClass)}>
                <Button type="submit" className="w-full" disabled={!hasUpdates || isSaving}>
                  {isSaving ? "Updating..." : "Update settings"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default settings;
