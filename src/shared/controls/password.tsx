import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import React, { useState } from "react";
import { FieldValue } from "react-hook-form";
type PasswordSchema = {
  name: string;
  label: string;
  placeholder: string;
  type: "password";
  validation: { required: boolean; minLength?: number; maxLength?: number };
};

function password({ form, schema }: { form: FieldValue<any>; schema: PasswordSchema }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormField
      control={form.control}
      name={schema.name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {schema.label}
            {schema.validation.required && <span className="text-destructive">*</span>}
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input type={!showPassword ? "password" : "text"} {...field} placeholder={schema.placeholder} />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ?
                <EyeOffIcon className="h-4 w-4 text-gray-500" />
              : <EyeIcon className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default password;
