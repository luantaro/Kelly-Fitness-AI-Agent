import { useState, useEffect, useCallback } from "react";
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

interface CachedProfile {
  data: UserSubscriptionInfo;
  timestamp: number;
  etag?: string;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const CACHE_KEY = "user_subscription_cache";

export function useUserSubscriptionOptimized() {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserSubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Smart cache check
  const getCachedProfile = useCallback((): CachedProfile | null => {
    if (!user) return null;

    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${user.uid}`);
      if (!cached) return null;

      const parsed: CachedProfile = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > CACHE_TTL;

      if (isExpired) {
        localStorage.removeItem(`${CACHE_KEY}_${user.uid}`);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, [user]);

  // Cache profile data
  const setCachedProfile = useCallback(
    (data: UserSubscriptionInfo, etag?: string) => {
      if (!user) return;

      const cached: CachedProfile = {
        data,
        timestamp: Date.now(),
        etag,
      };

      localStorage.setItem(`${CACHE_KEY}_${user.uid}`, JSON.stringify(cached));
    },
    [user]
  );

  // Optimized fetch with conditional requests
  const fetchProfile = useCallback(
    async (force = false) => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Check cache first (unless forced refresh)
        if (!force) {
          const cached = getCachedProfile();
          if (cached) {
            console.log("📦 [Subscription] Using cached data");
            setProfile(cached.data);
            setLoading(false);
            return;
          }
        }

        console.log("🔍 [Subscription] Fetching from server...");

        const token = await user.getIdToken();
        const cached = getCachedProfile();

        const headers: Record<string, string> = {
          Authorization: `Bearer ${token}`,
        };

        // Add conditional request headers
        if (cached?.etag) {
          headers["If-None-Match"] = cached.etag;
        }

        const response = await fetch("/api/user/subscription-info", {
          headers,
        });

        // 304 Not Modified - use cached data
        if (response.status === 304 && cached) {
          console.log("✅ [Subscription] Data unchanged, using cache");
          setProfile(cached.data);
          setLoading(false);
          return;
        }

        if (response.ok) {
          const responseData = await response.json();

          // Transform subscription-info response to UserSubscriptionInfo format
          const profileData: UserSubscriptionInfo = {
            userId: user.uid,
            email: user.email || "",
            displayName: user.displayName || "",

            subscriptionType: responseData.subscriptionType || "free",
            subscriptionPlan: responseData.subscriptionType || "free",

            status: responseData.status || "pending_activation",
            isActive: responseData.isActive || false,

            subscriptionStartDate: responseData.subscriptionStartDate,
            subscriptionEndDate: responseData.subscriptionEndDate,

            activatedByAdmin: responseData.activatedByAdmin || false,
            activatedDate: responseData.subscription?.activatedDate,

            daysRemaining: responseData.daysRemaining,
            isTrialActive: responseData.status === "trial",
            isProActive:
              responseData.subscriptionType === "pro" && responseData.isActive,
            isExpired: responseData.status === "expired",

            statusMessage: responseData.statusMessage || "Không xác định",
            planDisplay:
              responseData.subscriptionType === "pro"
                ? "Pro"
                : responseData.subscriptionType === "trial"
                ? "Dùng thử"
                : "Miễn phí",
          };

          const etag = response.headers.get("etag");

          console.log("✅ [Subscription] Fresh data received");
          setProfile(profileData);
          setCachedProfile(profileData, etag || undefined);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to fetch profile");
        }
      } catch (err) {
        console.error("❌ [Subscription] Network error:", err);
        setError("Network error while fetching profile");

        // Fallback to cache on network error
        const cached = getCachedProfile();
        if (cached) {
          console.log(
            "🔄 [Subscription] Using stale cache due to network error"
          );
          setProfile(cached.data);
        }
      } finally {
        setLoading(false);
      }
    },
    [user, getCachedProfile, setCachedProfile]
  );

  // Force refresh function
  const refreshProfile = useCallback(() => {
    setLoading(true);
    fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    fetchProfile();

    // Event-driven updates instead of polling
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.startsWith(CACHE_KEY) || e.key === "admin_user_updated") {
        console.log("🔄 [Subscription] Storage event detected, refreshing...");
        fetchProfile(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Refresh when user returns to tab (smart refresh)
        const cached = getCachedProfile();
        if (!cached || Date.now() - cached.timestamp > CACHE_TTL / 2) {
          console.log("👁️ [Subscription] Tab visible, checking for updates...");
          fetchProfile();
        }
      }
    };

    const handleOnline = () => {
      console.log("🌐 [Subscription] Back online, refreshing...");
      fetchProfile(true);
    };

    // Event listeners
    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("online", handleOnline);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("online", handleOnline);
    };
  }, [user, fetchProfile, getCachedProfile]);

  return {
    profile,
    loading,
    error,
    refreshProfile,
  };
}
