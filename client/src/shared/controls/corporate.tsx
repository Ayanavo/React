import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import MonthPickerField from "@/shared/controls/month-picker";
import {
  calculateWorkExperience,
  EMPTY_COMPANY_ENTRY,
  monthYearToDate,
} from "@/shared/utils/work-experience";
import { SquarePlusIcon, TrashIcon } from "lucide-react";
import React, { useCallback, useEffect, useMemo } from "react";
import { FieldValue, useFieldArray } from "react-hook-form";

type CorporateSchema = {
  name: string;
  label: string;
  showHeader?: boolean;
  validation?: { required?: boolean };
};

function corporate({ form, schema }: { form: FieldValue<any>; schema: CorporateSchema }) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: schema.name,
  });

  const companies = form.watch(schema.name) ?? [];
  const workExperience = useMemo(() => calculateWorkExperience(companies), [companies]);
  const showHeader = schema.showHeader ?? true;
  const presentIndex = companies.findIndex((company) => company?.isPresent);

  const setPresentRow = useCallback(
    (index: number) => {
      fields.forEach((_, rowIndex) => {
        const isPresent = rowIndex === index;
        form.setValue(`${schema.name}.${rowIndex}.isPresent`, isPresent, { shouldValidate: true });

        if (isPresent) {
          form.setValue(`${schema.name}.${rowIndex}.toMonth`, "", { shouldValidate: true });
          form.setValue(`${schema.name}.${rowIndex}.toYear`, "", { shouldValidate: true });
        }
      });
    },
    [fields, form, schema.name]
  );

  useEffect(() => {
    if (!fields.length) {
      append(EMPTY_COMPANY_ENTRY);
    }
  }, [fields, append]);

  useEffect(() => {
    if (!fields.length) return;

    if (fields.length === 1) {
      if (!companies[0]?.isPresent) {
        setPresentRow(0);
      }
      return;
    }

    const presentCount = companies.filter((company) => company?.isPresent).length;

    if (presentCount === 0) {
      setPresentRow(0);
      return;
    }

    if (presentCount > 1) {
      const firstPresentIndex = companies.findIndex((company) => company?.isPresent);
      if (firstPresentIndex >= 0) {
        setPresentRow(firstPresentIndex);
      }
    }
  }, [companies, fields.length, setPresentRow]);

  return (
    <div className="space-y-4">
      {showHeader && <h2 className="text-base font-semibold">{schema.label}</h2>}

      <div className="overflow-x-auto rounded-lg border border-dashed border-border bg-white shadow-sm dark:bg-card">
        <div className="min-w-[960px]">
          <div className="grid grid-cols-[minmax(180px,2fr)_minmax(140px,1.5fr)_minmax(130px,1fr)_minmax(130px,1fr)_minmax(100px,auto)] gap-3 border-b border-dotted border-border bg-muted/20 px-4 py-2.5 text-xs font-medium text-muted-foreground dark:bg-muted/10">
            <span>Company Name</span>
            <span>Designation</span>
            <span>From</span>
            <span>To</span>
            <span className="text-center">Present</span>
          </div>

          <RadioGroup
            value={presentIndex >= 0 ? String(presentIndex) : undefined}
            onValueChange={(value) => {
              const index = Number.parseInt(value, 10);
              if (!Number.isNaN(index)) {
                setPresentRow(index);
              }
            }}
            className="contents">
            {fields.map((field, index) => {
              const isPresent = !!companies[index]?.isPresent;
              const fromDate = monthYearToDate(companies[index]?.fromMonth, companies[index]?.fromYear);
              const maxToDate = new Date();

              return (
                <div
                  key={field.id}
                  className="group grid grid-cols-[minmax(180px,2fr)_minmax(140px,1.5fr)_minmax(130px,1fr)_minmax(130px,1fr)_minmax(100px,auto)] items-start gap-3 border-b border-dotted border-border bg-white px-4 py-3 last:border-b-0 dark:bg-card">
                  <FormField
                    control={form.control}
                    name={`${schema.name}.${index}.companyName`}
                    render={({ field: companyField }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input
                            {...companyField}
                            placeholder="Company name"
                            value={companyField.value ?? ""}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`${schema.name}.${index}.designation`}
                    render={({ field: designationField }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <Input
                            {...designationField}
                            placeholder="Designation"
                            value={designationField.value ?? ""}
                            className="h-9"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <MonthPickerField
                    form={form}
                    monthName={`${schema.name}.${index}.fromMonth`}
                    yearName={`${schema.name}.${index}.fromYear`}
                    placeholder="From"
                    required
                    compact
                    maxDate={maxToDate}
                  />

                  <MonthPickerField
                    form={form}
                    monthName={`${schema.name}.${index}.toMonth`}
                    yearName={`${schema.name}.${index}.toYear`}
                    placeholder={isPresent ? "Present" : "To"}
                    required={!isPresent}
                    disabled={isPresent}
                    compact
                    minDate={fromDate ?? undefined}
                    maxDate={maxToDate}
                  />

                  <div className="flex items-center justify-center gap-2 pt-1">
                    <RadioGroupItem
                      value={String(index)}
                      aria-label={`Mark ${companies[index]?.companyName?.trim() || "company"} as present`}
                    />
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                        aria-label="Remove company">
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => append(EMPTY_COMPANY_ENTRY)}
        className="border-dashed">
        <SquarePlusIcon className="mr-2 h-4 w-4" />
        Add company
      </Button>

      <div className="rounded-lg border border-dotted border-border bg-white px-4 py-3 shadow-sm dark:bg-card">
        <p className="text-sm font-medium">Total Work Experience</p>
        <p className="mt-1 text-base font-semibold">
          {workExperience.totalMonths > 0 ?
            <>
              {workExperience.years}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                Year{workExperience.years === 1 ? "" : "s"}
              </span>
              <span className="mx-2 text-muted-foreground">·</span>
              {workExperience.months}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                Month{workExperience.months === 1 ? "" : "s"}
              </span>
            </>
          : <span className="text-sm font-normal text-muted-foreground">
              Add company timelines to calculate total experience
            </span>
          }
        </p>
      </div>
    </div>
  );
}

export default corporate;
