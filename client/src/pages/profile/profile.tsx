import AddressComponent from "@/shared/controls/address";
import ImageComponent from "@/shared/controls/image";
import PhoneComponent from "@/shared/controls/phone";
import TextComponent from "@/shared/controls/text";
import React, { useMemo, useEffect } from "react";
import { FormProvider } from "react-hook-form";
import { useZodForm } from "../layout/grid/form/validationBuilder";
import { createProfileSchemaWithValidation } from "@/shared/validation/schema";
import { validatePincodeAPI } from "@/shared/services/profile";
import { Button } from "@/components/ui/button";

function profile() {
  const isMobileSingle = true; // set true for single phone, false for multiple
  const schema = useMemo(() => {
    return createProfileSchemaWithValidation(isMobileSingle);
  }, [isMobileSingle]);

  // Use the form with async validation
  const form = useZodForm(schema, {
    profile_image: "",
    full_name: "",
    mobile: isMobileSingle ? "" : [{ phone: "", isPrimary: true }],
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Watch for state and pincode changes to trigger validation
  const stateValue = form.watch("state");
  const pincodeValue = form.watch("pincode");

  // Manual pincode validation when state or pincode changes
  useEffect(() => {
    const validatePincode = async () => {
      if (!pincodeValue || !stateValue) {
        form.clearErrors("pincode");
        return;
      }

      try {
        const response = await validatePincodeAPI({ pincode: pincodeValue, state: stateValue });
        const result = response?.data ?? [];

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
      // Replace with API call when available
      const response = { success: true, data: values };
      console.log("Update profile response:", response);
    } catch (error) {
      console.error("Update profile error:", error);
    }
  };

  return (
    <div className="flex flex-col h-[9vh]">
      <div className="px-6">
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ImageComponent
              form={form}
              schema={{
                name: "profile_image",
                label: "Profile Image",
                placeholder: "AL",
                type: "image",
                validation: {
                  required: true,
                },
              }}
            />

            <TextComponent
              form={form}
              schema={{
                name: "full_name",
                label: "Full Name (First and Last Name)",
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
              <Button type="submit" className="w-full">
                Update profile
              </Button>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}

export default profile;
