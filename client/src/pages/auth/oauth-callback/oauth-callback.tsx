import { ParticleLoader } from "@/components/particle-loader/ParticleLoader";
import showToast from "@/hooks/toast";
import { showCacheUseWarning } from "@/shared/utils/cache-warning";
import { setAuthToken } from "@/shared/utils/auth-token";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const ERROR_MESSAGES: Record<string, string> = {
  "OAuth sign-in was cancelled or denied": "Sign-in was cancelled.",
  "Invalid OAuth callback": "Sign-in failed. Please try again.",
  "OAuth state validation failed. Please try again.": "Sign-in expired. Please try again.",
};

function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const isNewUser = searchParams.get("isNewUser") === "true";

    if (error) {
      showToast({
        title: ERROR_MESSAGES[error] || error,
        variant: "error",
      });
      navigate("/login", { replace: true });
      return;
    }

    if (!token) {
      showToast({ title: "Sign-in failed. No access token was returned.", variant: "error" });
      navigate("/login", { replace: true });
      return;
    }

    setAuthToken(token);
    showCacheUseWarning();
    showToast({
      title: isNewUser ? "Account created successfully" : "Successfully signed in",
      variant: "success",
    });
    navigate("/dashboard", { replace: true });
  }, [navigate, searchParams]);

  return <ParticleLoader statusText="Completing sign-in..." />;
}

export default OAuthCallback;
