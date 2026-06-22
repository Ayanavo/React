import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getPasswordStrength, PASSWORD_RULES } from "@/shared/utils/password-strength";
import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

type PasswordStrengthFieldProps = {
  form: UseFormReturn<FieldValues>;
};

function PasswordStrengthField({ form }: PasswordStrengthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const password = form.watch("password") ?? "";
  const strength = getPasswordStrength(password);

  return (
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>
            Password <span className="text-destructive">*</span>
          </FormLabel>
          <div className="relative">
            <FormControl>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                autoComplete="new-password"
                {...field}
              />
            </FormControl>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Hide password" : "Show password"}>
              {showPassword ?
                <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
              : <EyeIcon className="h-4 w-4 text-muted-foreground" />}
            </Button>
          </div>

          {password && (
            <div className="space-y-2 rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Password strength</span>
                <span className={cn("font-medium", strength.textClass)}>{strength.label}</span>
              </div>
              <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-primary/20">
                <div className={cn("h-full transition-all duration-300", strength.barClass)} style={{ width: `${strength.score}%` }} />
              </div>
              <ul className="grid gap-1.5 pt-1">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.test(password);
                  return (
                    <li key={rule.id} className="flex items-center gap-2 text-xs">
                      {passed ?
                        <CheckIcon className="h-3.5 w-3.5 shrink-0 text-green-600" />
                      : <XIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                      <span className={passed ? "text-foreground" : "text-muted-foreground"}>{rule.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <FormMessage />
        </FormItem>
      )}
    />
  );
}

export default PasswordStrengthField;
