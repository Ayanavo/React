import AddressComponent from "@/shared/controls/address";
import CorporateComponent from "@/shared/controls/corporate";
import DropdownComponent from "@/shared/controls/dropdown";
import ImageComponent from "@/shared/controls/image";
import PhoneComponent from "@/shared/controls/phone";
import TextComponent from "@/shared/controls/text";
import React, { useEffect, useMemo, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useZodForm } from "../layout/grid/form/validationBuilder";
import { createProfileSchemaWithValidation } from "@/shared/validation/schema";
import { sendMobileOtpAPI, updateProfileAPI, validatePincodeAPI, verifyMobileOtpAPI } from "@/shared/services/profile";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp";
import BreadcrumbInbuild from "@/components/inbuild/breadcrumb-inbuild";
import PageBreadcrumbBar from "@/components/inbuild/page-breadcrumb-bar";
import { getCurrentUserAPI } from "@/shared/services/auth";
import showToast from "@/hooks/toast";
import axios from "axios";
import { getAxiosErrorMessage } from "@/shared/interceptors/auth-interceptor";
import { EMPTY_COMPANY_ENTRY, normalizeCompanies } from "@/shared/utils/work-experience";
import {
  buildFullMobileNumber,
  findIsdOption,
  resolveIsdOptionFromPincode,
  splitMobileAndIsd,
} from "@/shared/utils/mobile-isd";
import { BriefcaseBusiness, CheckCircle2, MapPin, UserRound } from "lucide-react";
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

const genderOptions = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Non-binary", value: "non-binary" },
  { label: "Prefer not to say", value: "prefer-not-to-say" },
];

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
    <section className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", profileCardClass, className)}>
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
  const defaultIsd = resolveIsdOptionFromPincode("");
  const schema = useMemo(() => {
    return createProfileSchemaWithValidation(isMobileSingle);
  }, [isMobileSingle]);

  const form = useZodForm(schema, {
    profile_image: "",
    firstName: "",
    lastName: "",
    gender: "",
    mobileIsd: defaultIsd.isd,
    mobileCountry: defaultIsd.iso,
    mobile: isMobileSingle ? "" : [{ phone: "", isPrimary: true }],
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    companies: [EMPTY_COMPANY_ENTRY],
  });

  const [mobileVerified, setMobileVerified] = useState(false);
  const [verifiedFullMobile, setVerifiedFullMobile] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const profileImageValue = form.watch("profile_image");
  const firstNameValue = form.watch("firstName");
  const lastNameValue = form.watch("lastName");
  const mobileValue = form.watch("mobile");
  const mobileIsdValue = form.watch("mobileIsd");
  const stateValue = form.watch("state");
  const pincodeValue = form.watch("pincode");

  const currentMobile = typeof mobileValue === "string" ? mobileValue.trim() : "";
  const currentMobileIsd = String(mobileIsdValue ?? defaultIsd.isd);
  const currentFullMobile = buildFullMobileNumber(currentMobileIsd, currentMobile);
  const isCurrentMobileVerified =
    mobileVerified && Boolean(currentFullMobile) && currentFullMobile === verifiedFullMobile;

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await getCurrentUserAPI();
        if (!isMounted || !response.user) return;

        const pincode = response.user.address?.pincode ?? "";
        const mobileParts = splitMobileAndIsd(response.user.mobile, response.user.mobileIsd, pincode);
        const fullMobile = buildFullMobileNumber(mobileParts.mobileIsd, mobileParts.mobile);

        setMobileVerified(Boolean(response.user.mobileVerified));
        setVerifiedFullMobile(response.user.mobileVerified ? fullMobile : "");
        setOtpSent(false);
        setOtp("");

        form.reset({
          profile_image: response.user.photoURL ?? "",
          firstName: response.user.firstName ?? "",
          lastName: response.user.lastName ?? "",
          gender: (response.user.gender ?? "") as "" | "male" | "female" | "non-binary" | "prefer-not-to-say",
          mobileIsd: mobileParts.mobileIsd,
          mobileCountry: mobileParts.mobileCountry,
          mobile:
            isMobileSingle ? mobileParts.mobile
            : mobileParts.mobile ? [{ phone: mobileParts.mobile, isPrimary: true }]
            : [{ phone: "", isPrimary: true }],
          addressLine1: response.user.address?.addressLine1 ?? "",
          addressLine2: response.user.address?.addressLine2 ?? "",
          landmark: response.user.address?.landmark ?? "",
          city: response.user.address?.city ?? "",
          state: response.user.address?.state ?? "",
          pincode,
          companies:
            response.user.companies?.length ? normalizeCompanies(response.user.companies) : [EMPTY_COMPANY_ENTRY],
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

  useEffect(() => {
    const pin = pincodeValue?.trim() ?? "";
    if (!pin) return;

    // Default ISD from recognized postal formats (India PIN / US ZIP).
    const isIndiaPin = /^[1-9]\d{5}$/.test(pin);
    const isUsZip = /^\d{5}(-\d{4})?$/.test(pin);
    if (!isIndiaPin && !isUsZip) return;

    const option = resolveIsdOptionFromPincode(pin);
    form.setValue("mobileIsd", option.isd, { shouldDirty: false });
    form.setValue("mobileCountry", option.iso, { shouldDirty: false });
  }, [pincodeValue, form]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timerId = window.setInterval(() => {
      setResendCooldown((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timerId);
  }, [resendCooldown]);

  useEffect(() => {
    setOtpSent(false);
    setOtp("");
  }, [currentMobile, currentMobileIsd]);

  const isOtpDialogOpen = otpSent && !isCurrentMobileVerified;

  const handleOtpDialogOpenChange = (open: boolean) => {
    if (!open) {
      setOtpSent(false);
      setOtp("");
    }
  };

  const handleSendMobileOtp = async () => {
    if (!currentMobile) {
      showToast({ title: "Enter a mobile number first", variant: "error" });
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await sendMobileOtpAPI(currentMobile, currentMobileIsd);
      if (response.alreadyVerified || response.mobileVerified) {
        setMobileVerified(true);
        setVerifiedFullMobile(currentFullMobile);
        setOtpSent(false);
        setOtp("");
        showToast({ title: response.message || "Mobile number is already verified", variant: "success" });
        return;
      }

      setOtpSent(true);
      setOtp("");
      setResendCooldown(response.retryAfterSeconds ?? 60);
      showToast({ title: response.message || "Verification code sent", variant: "success" });
    } catch (error) {
      const retryAfterSeconds = axios.isAxiosError(error) ? error.response?.data?.retryAfterSeconds : undefined;
      if (typeof retryAfterSeconds === "number" && retryAfterSeconds > 0) {
        setResendCooldown(retryAfterSeconds);
      }
      showToast({
        title: "Failed to send verification code",
        description: getAxiosErrorMessage(error),
        variant: "error",
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyMobileOtp = async (otpValue = otp) => {
    const code = otpValue.trim();
    if (!currentMobile || !code) {
      showToast({ title: "Enter the verification code", variant: "error" });
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await verifyMobileOtpAPI(currentMobile, currentMobileIsd, code);
      const nextMobile = response.mobile || currentMobile;
      const nextIsd = response.mobileIsd || currentMobileIsd;
      const nextOption = findIsdOption(nextIsd);
      setMobileVerified(true);
      setVerifiedFullMobile(buildFullMobileNumber(nextIsd, nextMobile));
      setOtpSent(false);
      setOtp("");
      form.reset({
        ...form.getValues(),
        mobile: nextMobile,
        mobileIsd: nextIsd,
        mobileCountry: nextOption.iso,
      });
      showToast({ title: response.message || "Mobile number verified successfully", variant: "success" });
    } catch (error) {
      showToast({
        title: "Verification failed",
        description: getAxiosErrorMessage(error),
        variant: "error",
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const onSubmit = async (values: any) => {
    try {
      const mobile =
        typeof values.mobile === "string" ?
          values.mobile
        : values.mobile?.find((item: { phone: string; isPrimary: boolean }) => item.isPrimary)?.phone ||
          values.mobile?.[0]?.phone ||
          "";
      const mobileIsd = values.mobileIsd || resolveIsdOptionFromPincode(values.pincode).isd;

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
        gender: values.gender,
        mobile,
        mobileIsd,
        addressLine1: values.addressLine1,
        addressLine2: values.addressLine2,
        landmark: values.landmark,
        city: values.city,
        state: values.state,
        pincode: values.pincode,
        companies,
      });

      const savedMobile = response?.mobile ?? mobile;
      const savedIsd = response?.mobileIsd ?? mobileIsd;
      const savedOption = findIsdOption(savedIsd);
      setMobileVerified(Boolean(response?.mobileVerified));
      setVerifiedFullMobile(response?.mobileVerified ? buildFullMobileNumber(savedIsd, savedMobile) : "");
      setOtpSent(false);
      setOtp("");
      form.reset({
        ...values,
        mobile: savedMobile,
        mobileIsd: savedIsd,
        mobileCountry: savedOption.iso,
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
        <PageBreadcrumbBar>
          <BreadcrumbInbuild />
        </PageBreadcrumbBar>

        <div className="mx-4 my-2 mb-5 space-y-4">
          <div className={cn("rounded-lg border border-dashed border-border px-6 py-5 shadow-sm", profileCardClass)}>
            <h1 className="text-xl font-semibold">Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Update your personal, address, and corporate details.</p>
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <ProfileSection title="Personal Information" icon={UserRound}>
                <div className="space-y-6">
                  <div className={cn("rounded-lg border border-dotted border-border px-4 py-3", profileCardClass)}>
                    <ImageComponent
                      form={form}
                      schema={{
                        name: "profile_image",
                        label: "Profile photo",
                        placeholder: profileImageValue ? undefined : getInitials(firstNameValue, lastNameValue),
                        profileDefaultLink: profileImageValue || undefined,
                        type: "image",
                        validation: {
                          required: false,
                        },
                      }}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
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
                    <DropdownComponent
                      form={form}
                      schema={{
                        name: "gender",
                        label: "Gender",
                        placeholder: "Select gender",
                        type: "list",
                        options: genderOptions,
                        validation: { required: false },
                      }}
                    />
                    <PhoneComponent
                      form={form}
                      schema={{
                        name: "mobile",
                        label: "Mobile number",
                        placeholder: "Mobile number",
                        type: "tel",
                        single: isMobileSingle,
                        isdName: "mobileIsd",
                        countryName: "mobileCountry",
                        validation: { required: false },
                      }}
                      action={
                        isCurrentMobileVerified ?
                          <Badge
                            variant="secondary"
                            className="h-9 shrink-0 gap-1 px-2.5 font-medium text-emerald-700 dark:text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </Badge>
                        : <Button
                            type="button"
                            variant="outline"
                            className="h-9 shrink-0 px-3"
                            disabled={!currentMobile || isSendingOtp || (isOtpDialogOpen && resendCooldown > 0)}
                            onClick={handleSendMobileOtp}>
                            {isSendingOtp ?
                              "Sending..."
                            : isOtpDialogOpen ?
                              "Resend"
                            : "Verify"}
                          </Button>
                      }
                    />
                  </div>
                </div>

                <Dialog open={isOtpDialogOpen} onOpenChange={handleOtpDialogOpenChange}>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Verify mobile number</DialogTitle>
                      <DialogDescription>
                        Enter the 6-digit code sent to{" "}
                        <span className="font-medium text-foreground">
                          +{currentMobileIsd} {currentMobile}
                        </span>
                        .
                      </DialogDescription>
                    </DialogHeader>

                    <div className="flex flex-col items-center gap-4 py-2">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value.replace(/\D/g, ""))}
                        onComplete={(value) => {
                          if (!isVerifyingOtp) {
                            void handleVerifyMobileOtp(value);
                          }
                        }}
                        disabled={isVerifyingOtp}
                        autoFocus>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                        </InputOTPGroup>
                        <InputOTPSeparator />
                        <InputOTPGroup>
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                      <p className="text-center text-xs text-muted-foreground">
                        Didn&apos;t receive the code? You can resend
                        {resendCooldown > 0 ? ` in ${resendCooldown}s` : " now"}.
                      </p>
                    </div>

                    <DialogFooter className="gap-2 sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={isSendingOtp || isVerifyingOtp || resendCooldown > 0}
                        onClick={handleSendMobileOtp}>
                        {isSendingOtp ?
                          "Sending..."
                        : resendCooldown > 0 ?
                          `Resend in ${resendCooldown}s`
                        : "Resend code"}
                      </Button>
                      <Button
                        type="button"
                        disabled={otp.length !== 6 || isVerifyingOtp}
                        onClick={() => void handleVerifyMobileOtp()}>
                        {isVerifyingOtp ? "Verifying..." : "Verify"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
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

              <div className={cn("rounded-lg border border-dashed border-border p-5 shadow-sm", profileCardClass)}>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!form.formState.isDirty || form.formState.isSubmitting || !form.formState.isValid}>
                  {form.formState.isSubmitting ? "Updating..." : "Update profile"}
                </Button>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
}

export default profile;
