import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export interface TrialStatus {
  hasAccess: boolean;
  status: "trial" | "active" | "expired" | "pending_activation";
  daysRemaining?: number;
  message?: string;
  loading?: boolean;
  // Additional subscription info
  subscriptionType?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isActive?: boolean;
  activatedByAdmin?: boolean;
}

export function useTrialStatus() {
  const [user] = useAuthState(auth);
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    hasAccess: true, // Default to true để tránh flicker
    status: "trial",
    loading: true,
  });

  useEffect(() => {
    if (user && !user.isAnonymous) {
      console.log("🔄 User authenticated, checking trial status...");
      checkTrialStatus();

      // Set up periodic refresh every 2 minutes instead of 10 seconds
      const interval = setInterval(() => {
        if (user && !user.isAnonymous) {
          checkTrialStatus();
        }
      }, 120000); // 2 minutes

      // Listen for storage events (when admin activates user)
      const handleStorageChange = () => {
        if (user && !user.isAnonymous) {
          checkTrialStatus();
        }
      };

      window.addEventListener("storage", handleStorageChange);

      return () => {
        clearInterval(interval);
        window.removeEventListener("storage", handleStorageChange);
      };
    } else if (user === null) {
      // User explicitly logged out
      setTrialStatus({
        hasAccess: false,
        status: "pending_activation",
        loading: false,
        message: "Vui lòng đăng nhập để sử dụng dịch vụ",
      });
    } else {
      // User is loading or anonymous
      setTrialStatus({
        hasAccess: false,
        status: "pending_activation",
        loading: true,
        message: "Đang kiểm tra trạng thái...",
      });
    }
  }, [user]);

  const checkTrialStatus = async () => {
    if (!user || user.isAnonymous) return;

    try {
      setTrialStatus((prev) => ({ ...prev, loading: true }));

      // 🚨 ADMIN BYPASS CHECK - Priority #1
      const ADMIN_EMAILS = [
        "admin@kelly-fitness.com",
        "taro2255@gmail.com",
        "admin@kellyfitness.com",
      ];

      const isAdminByEmail = ADMIN_EMAILS.includes(
        user.email?.toLowerCase() || ""
      );

      console.log("🔍 Admin email check:", isAdminByEmail, "for", user.email);

      // If admin by email, grant full access immediately
      if (isAdminByEmail) {
        console.log("👑 ADMIN DETECTED - Granting full access");
        setTrialStatus({
          hasAccess: true,
          status: "active",
          loading: false,
          message: "Admin Access - Full Permissions",
          subscriptionType: "admin",
          isActive: true,
          activatedByAdmin: true,
        });
        return; // Early return for admin
      }

      // Add timeout for API calls
      const token = await user.getIdToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

      console.log("🔍 Fetching trial status...");

      // First get basic trial status
      const trialResponse = await fetch("/api/user/trial-status", {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📡 Trial response status:", trialResponse.status);

      // Then get detailed subscription info
      const subscriptionResponse = await fetch("/api/user/subscription-info", {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      clearTimeout(timeoutId);

      console.log(
        "📡 Subscription response status:",
        subscriptionResponse.status
      );

      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        console.log("📊 Trial data:", trialData);

        let subscriptionData = {};

        if (subscriptionResponse.ok) {
          subscriptionData = await subscriptionResponse.json();
          console.log("📊 Subscription data:", subscriptionData);
        } else {
          console.error(
            "❌ Subscription fetch failed:",
            subscriptionResponse.status
          );
        }

        const combinedData = {
          ...trialData,
          ...subscriptionData,
          loading: false,
        };

        console.log("🔗 Combined data:", combinedData);
        setTrialStatus(combinedData);
      } else {
        console.error("❌ Trial fetch failed:", trialResponse.status);
        setTrialStatus({
          hasAccess: false,
          status: "pending_activation",
          loading: false,
          message: "Không thể kiểm tra trạng thái tài khoản",
        });
      }
    } catch (error: any) {
      console.error("Error checking trial status:", error);

      // Handle different error types gracefully
      let errorMessage = "Lỗi khi kiểm tra trạng thái tài khoản";

      if (error.name === "AbortError") {
        console.warn("⏱️ Trial status check timeout");
        errorMessage = "Kiểm tra timeout, vui lòng thử lại";
      } else if (
        error.message?.includes("auth") ||
        error.message?.includes("token")
      ) {
        console.warn("🔐 Auth issue during trial check");
        errorMessage = "Phiên đăng nhập đã hết hạn";
      } else if (
        error.message?.includes("network") ||
        error.message?.includes("fetch")
      ) {
        console.warn("🌐 Network issue during trial check");
        errorMessage = "Lỗi kết nối, vui lòng kiểm tra mạng";
      }

      setTrialStatus({
        hasAccess: false,
        status: "pending_activation",
        loading: false,
        message: errorMessage,
      });
    }
  };

  const refetchTrialStatus = () => {
    if (user && !user.isAnonymous) {
      console.log("🔄 Manual trial status refetch requested");
      checkTrialStatus();
    } else {
      console.warn("⚠️ Cannot refetch trial status: user not authenticated");
    }
  };

  const refreshUserStatus = async () => {
    if (!user) return;

    try {
      setTrialStatus((prev) => ({ ...prev, loading: true }));
      const token = await user.getIdToken();

      const response = await fetch("/api/user/refresh-status", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setTrialStatus({
          hasAccess: data.hasAccess,
          status: data.status,
          daysRemaining: data.daysRemaining,
          message: data.message,
          loading: false,
        });
        return data;
      } else {
        throw new Error("Failed to refresh status");
      }
    } catch (error) {
      console.error("Error refreshing status:", error);
      setTrialStatus((prev) => ({ ...prev, loading: false }));
      throw error;
    }
  };

  return {
    trialStatus,
    refetchTrialStatus,
    refreshUserStatus,
    isLoading: trialStatus.loading,
    hasAccess: trialStatus.hasAccess,
  };
}
