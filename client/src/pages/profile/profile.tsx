import ImageComponent from "@/shared/controls/image";
import TextComponent from "@/shared/controls/text";
import React from "react";
import { FormProvider } from "react-hook-form";
import generateControl from "../layout/grid/form/validation";

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
  const form = generateControl(profileSchema);
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

            <div className="space-y-4">
              <TextComponent
                form={form}
                schema={{
                  name: "full_name",
                  label: "Full Name",
                  placeholder: "",
                  type: "text",
                  validation: {
                    required: true,
                  },
                }}
              />
            </div>
          </div>
        </FormProvider>
      </div>
    </div>
  );
}

export default profile;
