import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ParticleLoader } from "@/components/particle-loader/ParticleLoader";
import showToast from "@/hooks/toast";
import { useFullPageScroll } from "@/hooks/use-full-page-scroll";
import { TermsContent } from "@/pages/layout/terms/terms";
import { acceptTermsAPI } from "@/shared/services/auth.ts";
import { usePermissions } from "@/shared/context/PermissionsContext";
import { PRIVACY_PATH } from "@/shared/utils/policy-paths";
import { LoaderCircleIcon } from "lucide-react";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function RegistrationTermsAcceptance() {
  useFullPageScroll();
  const navigate = useNavigate();
  const { requiresTermsAcceptance, isLoading, refetchPermissions } = usePermissions();
  const [hasAgreed, setHasAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    void refetchPermissions().finally(() => {
      if (active) setIsReady(true);
    });
    return () => {
      active = false;
    };
  }, [refetchPermissions]);

  useEffect(() => {
    if (!isReady || isLoading) return;

    if (!requiresTermsAcceptance) {
      navigate("/dashboard", { replace: true });
    }
  }, [isLoading, isReady, navigate, requiresTermsAcceptance]);

  const onContinue = async () => {
    if (!hasAgreed) return;

    setIsSubmitting(true);
    try {
      await acceptTermsAPI();
      await refetchPermissions();
      showToast({ title: "Terms accepted. Welcome to Notofy!", variant: "success" });
      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to accept terms";
      showToast({ title: message, variant: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isReady || isLoading || !requiresTermsAcceptance) {
    return <ParticleLoader statusText="Loading terms..." />;
  }

  return (
    <div className="min-h-screen w-full bg-muted/60 px-4 py-6 md:px-6 md:py-10">
      <div className="mx-auto w-full max-w-3xl">
        <Card className="border shadow-lg">
          <CardHeader className="space-y-1 border-b pb-5">
            <CardTitle className="text-2xl">Accept Terms & Conditions</CardTitle>
            <CardDescription>
              Please review and accept our terms to finish setting up your account and access Notofy.
            </CardDescription>
          </CardHeader>

          <CardContent className="py-6">
            <div className="max-h-[min(52vh,560px)] overflow-y-auto rounded-lg border bg-background/60 p-4 scrollbar-none">
              <TermsContent introText="To continue using Notofy, please read and accept these terms, including our" />
            </div>

            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/30 p-4">
              <Checkbox
                id="accept-terms"
                checked={hasAgreed}
                onCheckedChange={(checked) => setHasAgreed(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm leading-relaxed text-muted-foreground">
                I have read and agree to the{" "}
                <span className="font-medium text-foreground">Terms & Conditions</span> and{" "}
                <Link to={PRIVACY_PATH} className="font-medium underline underline-offset-4 hover:text-primary">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
          </CardContent>

          <CardFooter className="border-t px-6 py-4">
            <Button className="w-full" type="button" disabled={!hasAgreed || isSubmitting} onClick={onContinue}>
              {isSubmitting && <LoaderCircleIcon className="-ms-1 animate-spin" size={16} aria-hidden="true" />}
              Continue to Notofy
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default RegistrationTermsAcceptance;
