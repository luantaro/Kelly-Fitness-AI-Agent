import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export interface UserSubscriptionInfo {
  // Basic info
  userId: string;
  email: string;
  displayName?: string;

  // Subscription details
  subscriptionType: "free" | "pro" | "trial";
  subscriptionPlan: "trial" | "pro" | "free";

  // Status
  status: "trial" | "active" | "expired" | "pending_activation";
  isActive: boolean;

  // Dates
  accountCreatedDate?: string;
  trialStartDate?: string;
  trialEndDate?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;

  // Admin activation
  activatedByAdmin: boolean;
  activatedDate?: string;
  activatedByAdminId?: string;

  // Calculated fields
  daysRemaining?: number;
  isTrialActive: boolean;
  isProActive: boolean;
  isExpired: boolean;

  // Message for UI
  statusMessage: string;
  planDisplay: string;
}

export function useUserSubscription() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log("🔍 [useUserSubscription] Fetching user profile...");
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profileData = await response.json();
        console.log(
          "📊 [useUserSubscription] Profile data received:",
          profileData
        );
        setProfile(profileData);
      } else {
        const errorData = await response.json();
        console.error("❌ [useUserSubscription] Error response:", errorData);
        setError(errorData.error || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("❌ [useUserSubscription] Fetch error:", err);
      setError("Network error while fetching profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();

    // Refresh profile every 5 minutes instead of 30 seconds
    const interval = setInterval(fetchProfile, 300000); // 5 minutes

    // Listen for storage events (when admin updates user)
    const handleStorageChange = () => {
      fetchProfile();
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user]);

  const refreshProfile = () => {
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    refreshProfile,
    // Legacy compatibility for existing components
    trialStatus: profile
      ? {
          hasAccess: profile.isActive,
          status: profile.status,
          daysRemaining: profile.daysRemaining,
          message: profile.statusMessage,
          loading,
          // Enhanced fields for Settings modal
          subscriptionType: profile.subscriptionType,
          subscriptionStartDate: profile.subscriptionStartDate,
          subscriptionEndDate: profile.subscriptionEndDate,
          isActive: profile.isActive,
          activatedByAdmin: profile.activatedByAdmin,
          trialEndDate: profile.trialEndDate,
          createdAt: profile.accountCreatedDate,
        }
      : null,
  };
}
