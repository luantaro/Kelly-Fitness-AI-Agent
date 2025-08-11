import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

interface TrialStatusData {
  hasAccess: boolean;
  status: "trial" | "active" | "expired" | "pending_activation";
  loading: boolean;
  message?: string;
  daysRemaining?: number;
}

interface CachedTrialStatus {
  data: TrialStatusData;
  timestamp: number;
}

const TRIAL_CACHE_TTL = 2 * 60 * 1000; // 2 minutes for trial status
const TRIAL_CACHE_KEY = "trial_status_cache";

export function useTrialStatusOptimized() {
  const [user] = useAuthState(auth);
  const [trialStatus, setTrialStatus] = useState<TrialStatusData>({
    hasAccess: false,
    status: "pending_activation",
    loading: true,
  });

  // Smart cache for trial status
  const getCachedTrialStatus = useCallback((): CachedTrialStatus | null => {
    if (!user) return null;

    try {
      const cached = localStorage.getItem(`${TRIAL_CACHE_KEY}_${user.uid}`);
      if (!cached) return null;

      const parsed: CachedTrialStatus = JSON.parse(cached);
      const isExpired = Date.now() - parsed.timestamp > TRIAL_CACHE_TTL;

      if (isExpired) {
        localStorage.removeItem(`${TRIAL_CACHE_KEY}_${user.uid}`);
        return null;
      }

      return parsed;
    } catch {
      return null;
    }
  }, [user]);

  const setCachedTrialStatus = useCallback(
    (data: TrialStatusData) => {
      if (!user) return;

      const cached: CachedTrialStatus = {
        data,
        timestamp: Date.now(),
      };

      localStorage.setItem(
        `${TRIAL_CACHE_KEY}_${user.uid}`,
        JSON.stringify(cached)
      );
    },
    [user]
  );

  const checkTrialStatus = useCallback(
    async (force = false) => {
      if (!user) {
        setTrialStatus({
          hasAccess: false,
          status: "pending_activation",
          loading: false,
        });
        return;
      }

      try {
        // Check cache first
        if (!force) {
          const cached = getCachedTrialStatus();
          if (cached) {
            console.log("📦 [Trial] Using cached trial status");
            setTrialStatus(cached.data);
            return;
          }
        }

        setTrialStatus((prev) => ({ ...prev, loading: true }));
        const token = await user.getIdToken();

        console.log("🔍 [Trial] Fetching trial status from server...");

        // Single optimized endpoint instead of multiple calls
        const response = await fetch("/api/user/subscription-info", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();

          const statusData: TrialStatusData = {
            hasAccess: data.isActive,
            status: data.status,
            loading: false,
            message: data.statusMessage,
            daysRemaining: data.daysRemaining,
          };

          console.log("✅ [Trial] Trial status updated:", statusData);
          setTrialStatus(statusData);
          setCachedTrialStatus(statusData);
        } else {
          throw new Error(`HTTP ${response.status}`);
        }
      } catch (error) {
        console.error("❌ [Trial] Error checking trial status:", error);

        // Fallback to cache on error
        const cached = getCachedTrialStatus();
        if (cached) {
          console.log("🔄 [Trial] Using stale cache due to error");
          setTrialStatus(cached.data);
        } else {
          setTrialStatus({
            hasAccess: false,
            status: "pending_activation",
            loading: false,
            message: "Error loading status",
          });
        }
      }
    },
    [user, getCachedTrialStatus, setCachedTrialStatus]
  );

  useEffect(() => {
    checkTrialStatus();

    // Event-driven updates only
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes("trial") || e.key === "admin_user_updated") {
        console.log(
          "🔄 [Trial] Admin update detected, refreshing trial status..."
        );
        checkTrialStatus(true);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        // Only refresh if cache is stale
        const cached = getCachedTrialStatus();
        if (!cached || Date.now() - cached.timestamp > TRIAL_CACHE_TTL / 2) {
          console.log("👁️ [Trial] Tab visible, checking trial status...");
          checkTrialStatus();
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [user, checkTrialStatus, getCachedTrialStatus]);

  return {
    trialStatus,
    refreshTrialStatus: () => checkTrialStatus(true),
  };
}
