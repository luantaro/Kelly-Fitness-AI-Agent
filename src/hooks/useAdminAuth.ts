import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface AdminStatus {
  isAdmin: boolean;
  hasAdminClaim: boolean;
  isAdminByEmail: boolean;
  loading: boolean;
  error: string | null;
}

export function useAdminAuth(): AdminStatus {
  const [user, loading, error] = useAuthState(auth);
  const [adminStatus, setAdminStatus] = useState<AdminStatus>({
    isAdmin: false,
    hasAdminClaim: false,
    isAdminByEmail: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let mounted = true;

    const checkAdminStatus = async () => {
      if (!user) {
        if (mounted) {
          setAdminStatus({
            isAdmin: false,
            hasAdminClaim: false,
            isAdminByEmail: false,
            loading: false,
            error: null,
          });
        }
        return;
      }

      try {
        // Get ID token from current user
        const idToken = await user.getIdToken();

        // Verify with backend
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ idToken }),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (mounted) {
          setAdminStatus({
            isAdmin: data.isAdmin,
            hasAdminClaim: data.hasAdminClaim,
            isAdminByEmail: data.isAdminByEmail,
            loading: false,
            error: null,
          });
        }
      } catch (err) {
        console.error("Error checking admin status:", err);
        if (mounted) {
          setAdminStatus({
            isAdmin: false,
            hasAdminClaim: false,
            isAdminByEmail: false,
            loading: false,
            error: err instanceof Error ? err.message : "Unknown error",
          });
        }
      }
    };

    if (loading) {
      // Still loading auth state
      return;
    }

    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [user, loading]);

  return {
    ...adminStatus,
    loading: loading || adminStatus.loading,
    error: error?.message || adminStatus.error,
  };
}

// Helper function to get auth header for API calls
export async function getAuthHeader(): Promise<string | null> {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const idToken = await currentUser.getIdToken();
    return `Bearer ${idToken}`;
  } catch (error) {
    console.error("Error getting auth header:", error);
    return null;
  }
}

// Helper function to make authenticated API calls
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
) {
  const authHeader = await getAuthHeader();

  if (!authHeader) {
    throw new Error("User not authenticated");
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });
}
