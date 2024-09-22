import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EyeClosedIcon, EyeOpenIcon } from "@radix-ui/react-icons";
import React, { useState } from "react";
import { FieldValue } from "react-hook-form";

function password({ form }: { form: FieldValue<any> }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Password</FormLabel>
          <div className="relative">
            <FormControl>
              <Input type={!showPassword ? "password" : "text"} {...field} />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ?
                <EyeClosedIcon className="h-4 w-4 text-gray-500" />
              : <EyeOpenIcon className="h-4 w-4 text-gray-500" />}
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default password;
