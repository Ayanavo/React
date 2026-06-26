import { auth } from "@/firebase.setup";
import showToast from "@/hooks/toast";
import { socialLoginAPI } from "@/shared/services/auth";
import { showCacheUseWarning } from "@/shared/utils/cache-warning";
import { FirebaseError } from "firebase/app";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

export type SocialProvider = "google" | "github";

function getProvider(provider: SocialProvider) {
  switch (provider) {
    case "google":
      return new GoogleAuthProvider();
    case "github":
      return new GithubAuthProvider();
  }
}

function getSocialLoginErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    if (error.code === "auth/popup-closed-by-user") {
      return "Sign-in was cancelled.";
    }
    if (error.code === "auth/account-exists-with-different-credential") {
      return "An account already exists with this email using a different sign-in method.";
    }
    return error.message;
  }

  const axiosError = error as { response?: { data?: { message?: string } } };
  return axiosError.response?.data?.message ?? "Authentication failed";
}

export function useSocialAuth() {
  const navigate = useNavigate();
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<SocialProvider | null>(null);

  const signInWithProvider = useCallback(
    async (provider: SocialProvider) => {
      if (isSocialLoading) return;

      setIsSocialLoading(true);
      setLoadingProvider(provider);

      try {
        const loginProvider = getProvider(provider);
        const userCredential = await signInWithPopup(auth, loginProvider);
        const idToken = await userCredential.user.getIdToken();
        const response = await socialLoginAPI(idToken);

        showToast({
          title: response.message || (response.isNewUser ? "Account created successfully" : "Successfully signed in"),
          variant: "success",
        });
        showCacheUseWarning();
        navigate("/dashboard");
      } catch (error) {
        showToast({
          title: getSocialLoginErrorMessage(error),
          variant: "error",
        });
      } finally {
        setIsSocialLoading(false);
        setLoadingProvider(null);
      }
    },
    [isSocialLoading, navigate]
  );

  return { signInWithProvider, isSocialLoading, loadingProvider };
}
