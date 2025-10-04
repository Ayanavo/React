import AddressComponent from "@/shared/controls/address";
import ImageComponent from "@/shared/controls/image";
import PhoneComponent from "@/shared/controls/phone";
import TextComponent from "@/shared/controls/text";
import React from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/grid/form/validation";
import { Button } from "@/components/ui/button";

function profile() {
  const profileSchema = [
    {
      name: "themecolor",
      type: "color" as "color",
      validation: {
        required: false,
      },
    },
    {
      name: "fullname",
      type: "text" as "text",
      validation: {
        required: false,
      },
    },
  ];
  const form = generateControl(profileSchema, { mode: "onChange" });

  return (
    <div className="flex flex-col h-[9vh]">
      <div className="px-6">
        <FormProvider {...form}>
          <div className="space-y-6">
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
          </div>
        </FormProvider>
        <div className="mt-8 space-y-2">
          <Button type="submit" className="w-full">
            Update profile
          </Button>
        </div>
      </div>
    </div>
  );
}

export default profile;
