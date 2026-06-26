import AddressComponent from "@/shared/controls/address";
import CorporateComponent from "@/shared/controls/corporate";
import ImageComponent from "@/shared/controls/image";
import PhoneComponent from "@/shared/controls/phone";
import TextComponent from "@/shared/controls/text";
import React, { useMemo, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useZodForm } from "../layout/grid/form/validationBuilder";
import { createProfileSchemaWithValidation } from "@/shared/validation/schema";
import { updateProfileAPI, validatePincodeAPI } from "@/shared/services/profile";
import { Button } from "@/components/ui/button";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import { getCurrentUserAPI } from "@/shared/services/auth";
import showToast from "@/hooks/toast";
import axios from "axios";
import { getAxiosErrorMessage } from "@/shared/interceptors/auth-interceptor";
import { Link } from "react-router-dom";
import { TERMS_PATH } from "@/shared/utils/cache-warning";
import { EMPTY_COMPANY_ENTRY, normalizeCompanies } from "@/shared/utils/work-experience";
import { BriefcaseBusiness, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";

  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();

  return "N/A";
};

const profileCardClass = "bg-white dark:bg-card";

function ProfileSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon: LucideIcon;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-lg border border-dashed border-border p-5 shadow-sm",
        profileCardClass,
        className
      )}>
      <div className="mb-5 flex items-start gap-3 border-b border-dotted border-border pb-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-dotted border-border bg-muted/40 text-muted-foreground">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="min-w-0 text-base font-semibold">{title}</h2>
      </div>

      {children}
    </section>
  );
}

function profile() {
  const isMobileSingle = true;
  const schema = useMemo(() => {
    return createProfileSchemaWithValidation(isMobileSingle);
  }, [isMobileSingle]);

  const form = useZodForm(schema, {
    profile_image: "",
    firstName: "",
    lastName: "",
    mobile: isMobileSingle ? "" : [{ phone: "", isPrimary: true }],
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    companies: [EMPTY_COMPANY_ENTRY],
  });

  const profileImageValue = form.watch("profile_image");
  const firstNameValue = form.watch("firstName");
  const lastNameValue = form.watch("lastName");
  const stateValue = form.watch("state");
  const pincodeValue = form.watch("pincode");

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUserAPI();
        if (!isMounted || !response.user) return;

        form.reset({
          profile_image: response.user.photoURL ?? "",
          firstName: response.user.firstName ?? "",
          lastName: response.user.lastName ?? "",
          mobile:
            isMobileSingle ? (response.user.mobile ?? "")
            : response.user.mobile ? [{ phone: response.user.mobile, isPrimary: true }]
            : [{ phone: "", isPrimary: true }],
          addressLine1: response.user.address?.addressLine1 ?? "",
          addressLine2: response.user.address?.addressLine2 ?? "",
          landmark: response.user.address?.landmark ?? "",
          city: response.user.address?.city ?? "",
          state: response.user.address?.state ?? "",
          pincode: response.user.address?.pincode ?? "",
          companies:
            response.user.companies?.length ?
              normalizeCompanies(response.user.companies)
            : [EMPTY_COMPANY_ENTRY],
        });
      } catch (error) {
        if (axios.isAxiosError(error)) {
          showToast({ title: "Error", description: error.message, variant: "error" });
        } else if (error instanceof Error) {
          showToast({ title: "Error", description: error.message, variant: "error" });
        } else {
          showToast({ title: "Error", description: "Failed to load user data", variant: "error" });
        }
      }
    };

    if (document.readyState === "complete") {
      loadCurrentUser();
    } else {
      window.addEventListener("load", loadCurrentUser, { once: true });
    }

    return () => {
      isMounted = false;
      window.removeEventListener("load", loadCurrentUser);
    };
  }, [form, isMobileSingle]);

  useEffect(() => {
    const validatePincode = async () => {
      if (!pincodeValue || !stateValue) {
        form.clearErrors("pincode");
        return;
      }

      try {
        const response = await validatePincodeAPI({ pincode: pincodeValue, state: stateValue });
        const result = response ?? [];

        if (Array.isArray(result) && result.length === 0) {
          form.setError("pincode", {
            type: "manual",
            message: "Pincode is not valid for the selected state",
          });
        } else {
          form.clearErrors("pincode");
        }
      } catch (error) {
        console.error("Manual pincode validation error:", error);
        form.setError("pincode", {
          type: "manual",
          message: getAxiosErrorMessage(error),
        });
      }
    };

    const timeoutId = setTimeout(validatePincode, 500);
    return () => clearTimeout(timeoutId);
  }, [stateValue, pincodeValue, form]);

  const onSubmit = async (values: any) => {
    try {
      const mobile =
        typeof values.mobile === "string" ?
          values.mobile
        : values.mobile?.find((item: { phone: string; isPrimary: boolean }) => item.isPrimary)?.phone ||
          values.mobile?.[0]?.phone ||
          "";

      const companies = normalizeCompanies(
        values.companies?.filter((company: { companyName?: string }) => company.companyName?.trim()) ?? []
      ).map((company) => ({
        companyName: company.companyName ?? "",
        designation: company.designation ?? "",
        fromMonth: company.fromMonth ?? "",
        fromYear: company.fromYear ?? "",
        toMonth: company.isPresent ? "" : (company.toMonth ?? ""),
        toYear: company.isPresent ? "" : (company.toYear ?? ""),
        isPresent: Boolean(company.isPresent),
      }));

      const response = await updateProfileAPI({
        photoURL: values.profile_image,
        firstName: values.firstName,
        lastName: values.lastName,
        mobile,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        landmark: values.landmark,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        companies,
      });

      showToast({ title: response?.message || "Profile updated successfully", variant: "success" });
    } catch (error) {
      console.error("Update profile error:", error);
      showToast({
        title: "Profile update failed",
        description: error instanceof Error ? error.message : "Unable to update profile",
        variant: "error",
      });
    }
  };

  return (
    <div className="h-full min-h-0 overflow-y-auto scrollbar-none">
      <div className="flex flex-col">
        <div className="flex items-center justify-between px-6 pt-3">
          <BreadcrumbInbuild />
        </div>

        <div className="mx-4 my-2 mb-5 space-y-4">
          <div className={cn("rounded-lg border border-dashed border-border px-6 py-5 shadow-sm", profileCardClass)}>
            <h1 className="text-xl font-semibold">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Update your personal, address, and corporate details.
            </p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <ProfileSection title="Personal Information" icon={UserRound}>
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
                    <div className={cn("mx-auto shrink-0 rounded-lg border border-dotted border-border p-3 shadow-sm lg:mx-0", profileCardClass)}>
                      <ImageComponent
                        form={form}
                        schema={{
                          name: "profile_image",
                          label: "Profile Image",
                          placeholder: profileImageValue ? undefined : getInitials(firstNameValue, lastNameValue),
                          profileDefaultLink: profileImageValue || undefined,
                          type: "image",
                          validation: {
                            required: false,
                          },
                        }}
                      />
                    </div>

                    <div className="grid flex-1 gap-4 sm:grid-cols-2">
                      <TextComponent
                        form={form}
                        schema={{
                          name: "firstName",
                          label: "First Name",
                          placeholder: "First name",
                          type: "text",
                          validation: { required: true },
                        }}
                      />
                      <TextComponent
                        form={form}
                        schema={{
                          name: "lastName",
                          label: "Last Name",
                          placeholder: "Last name",
                          type: "text",
                          validation: { required: true },
                        }}
                      />
                      <div className="sm:col-span-2">
                        <PhoneComponent
                          form={form}
                          schema={{
                            name: "mobile",
                            label: "Mobile number",
                            placeholder: "Mobile number",
                            type: "tel",
                            single: isMobileSingle,
                            validation: { required: true },
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </ProfileSection>

                <ProfileSection title="Address" icon={MapPin}>
                  <AddressComponent
                    form={form}
                    schema={{
                      name: "address",
                      label: "Address",
                      showHeader: false,
                      validation: { required: false },
                    }}
                  />
                </ProfileSection>

                <ProfileSection title="Corporate Information" icon={BriefcaseBusiness}>
                  <CorporateComponent
                    form={form}
                    schema={{
                      name: "companies",
                      label: "Corporate Information",
                      showHeader: false,
                      validation: { required: false },
                    }}
                  />
                </ProfileSection>

                <div className={cn("space-y-2 rounded-lg border border-dashed border-border p-5 shadow-sm", profileCardClass)}>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={!form.formState.isDirty || form.formState.isSubmitting || !form.formState.isValid}>
                    {form.formState.isSubmitting ? "Updating..." : "Update profile"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground">
                    <Link to={TERMS_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
                      Terms & Conditions
                    </Link>
                  </p>
                </div>
              </form>
            </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default profile;
