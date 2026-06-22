export const PASSWORD_MIN_LENGTH = 8;

export const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (value: string) => value.length >= PASSWORD_MIN_LENGTH },
  { id: "upper", label: "One uppercase letter", test: (value: string) => /[A-Z]/.test(value) },
  { id: "lower", label: "One lowercase letter", test: (value: string) => /[a-z]/.test(value) },
  { id: "number", label: "One number", test: (value: string) => /\d/.test(value) },
  { id: "special", label: "One special character", test: (value: string) => /[^A-Za-z0-9]/.test(value) },
] as const;

export type PasswordStrength = {
  score: number;
  label: "Weak" | "Fair" | "Good" | "Strong" | "";
  barClass: string;
  textClass: string;
};

export const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, label: "", barClass: "bg-muted", textClass: "text-muted-foreground" };
  }

  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;

  if (passed <= 2) {
    return { score: 25, label: "Weak", barClass: "bg-red-500", textClass: "text-red-600" };
  }
  if (passed === 3) {
    return { score: 50, label: "Fair", barClass: "bg-orange-500", textClass: "text-orange-600" };
  }
  if (passed === 4) {
    return { score: 75, label: "Good", barClass: "bg-yellow-500", textClass: "text-yellow-600" };
  }
  return { score: 100, label: "Strong", barClass: "bg-green-500", textClass: "text-green-600" };
};

export const isPasswordValid = (password: string): boolean => PASSWORD_PATTERN.test(password);
