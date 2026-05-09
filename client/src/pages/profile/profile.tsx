import AddressComponent from "@/shared/controls/address";
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

const getInitials = (firstName?: string, lastName?: string) => {
  const first = firstName?.trim() ?? "";
  const last = lastName?.trim() ?? "";

  if (first && last) return `${first[0]}${last[0]}`.toUpperCase();
  if (first) return first.slice(0, 2).toUpperCase();
  if (last) return last.slice(0, 2).toUpperCase();

  return "N/A";
};

function profile() {
  const isMobileSingle = true; // set true for single phone, false for multiple
  const schema = useMemo(() => {
    return createProfileSchemaWithValidation(isMobileSingle);
  }, [isMobileSingle]);

  // Use the form with async validation
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
  });

  // Watch for state and pincode changes to trigger validation
  const profileImageValue = form.watch("profile_image");
  const firstNameValue = form.watch("firstName");
  const lastNameValue = form.watch("lastName");
  const stateValue = form.watch("state");
  const pincodeValue = form.watch("pincode");

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUserAPI();
        if (!isMounted || !user) return;

        form.reset({
          profile_image: user.photoURL ?? "",
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
          mobile:
            isMobileSingle ? (user.mobile ?? "")
            : user.mobile ? [{ phone: user.mobile, isPrimary: true }]
            : [{ phone: "", isPrimary: true }],
          addressLine1: user.address?.addressLine1 ?? "",
          addressLine2: user.address?.addressLine2 ?? "",
          landmark: user.address?.landmark ?? "",
          city: user.address?.city ?? "",
          state: user.address?.state ?? "",
          pincode: user.address?.pincode ?? "",
        });
      } catch (error) {
        console.error("Get current user error:", error);
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

  // Manual pincode validation when state or pincode changes
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
          message: (error as { data?: { message: string } })?.data?.message,
        });
      }
    };

    // Debounce validation to avoid too many API calls
    const timeoutId = setTimeout(validatePincode, 500);
    return () => clearTimeout(timeoutId);
  }, [stateValue, pincodeValue, form]);

  const onSubmit = async (values: any) => {
    try {
      const mobile = typeof values.mobile === "string" ? values.mobile : values.mobile?.find((item: { phone: string; isPrimary: boolean }) => item.isPrimary)?.phone || values.mobile?.[0]?.phone || "";

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
      });

      console.log("Update profile response:", response);
      showToast({ title: "Profile updated successfully", variant: "success" });
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
    <div className="flex flex-col h-[9vh]">
      <div className="flex items-center justify-between px-2 pt-3">
        <BreadcrumbInbuild />
      </div>
      <div className="px-6 py-2 my-2 border-2 rounded-md">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ImageComponent
              form={form}
              schema={{
                name: "profile_image",
                label: "Profile Image",
                placeholder: profileImageValue ? undefined : getInitials(firstNameValue, lastNameValue),
                profileDefaultLink: profileImageValue || undefined,
                type: "image",
                validation: {
                  required: true,
                },
              }}
            />

            <TextComponent
              form={form}
              schema={{
                name: "firstName",
                label: "First Name",
                placeholder: "",
                type: "text",
                validation: {
                  required: true,
                },
              }}
            />

            <TextComponent
              form={form}
              schema={{
                name: "lastName",
                label: "Last Name",
                placeholder: "",
                type: "text",
                validation: {
                  required: true,
                },
              }}
            />

            <PhoneComponent
              form={form}
              schema={{
                name: "mobile",
                label: "Mobile number",
                placeholder: "",
                type: "tel",
                single: isMobileSingle,
                validation: {
                  required: true,
                },
              }}
            />

            <AddressComponent
              form={form}
              schema={{
                name: "address",
                label: "Address",
                validation: { required: false },
              }}></AddressComponent>

            <div className="mt-8 space-y-2">
              <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Updating..." : "Update profile"}
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default profile;
