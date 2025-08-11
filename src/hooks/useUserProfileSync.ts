"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
  personality?: string; // AI personality preference
}

interface UseUserProfileSyncReturn {
  profile: UserProfile;
  isLoading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  lastSyncTime: Date | null;
}

/**
 * Hook quản lý đồng bộ hóa thông tin user profile 2 chiều
 * - Lưu local storage + Firestore
 * - Tự động sync khi có thay đổi từ admin
 * - Event-driven updates cho realtime sync
 */
export const useUserProfileSync = (): UseUserProfileSyncReturn => {
  const [user] = useAuthState(auth);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    activityLevel: "moderate",
    goal: "maintain_weight",
    personality: "friendly",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Load từ localStorage và fetch từ server khi user login
  useEffect(() => {
    if (!user) {
      // Clear profile when user logs out
      setProfile({
        name: "",
        age: 0,
        gender: "",
        height: 0,
        weight: 0,
        activityLevel: "moderate",
        goal: "maintain_weight",
        personality: "friendly",
      });
      setError(null);
      setLastSyncTime(null);
      return;
    }

    // Load từ localStorage trước (để có dữ liệu tạm thời)
    const savedProfile = localStorage.getItem("fitchat_user_profile");
    if (savedProfile) {
      try {
        const parsedProfile = JSON.parse(savedProfile);
        setProfile(parsedProfile);
        console.log("📱 Loaded profile from localStorage:", parsedProfile);
      } catch (error) {
        console.error("❌ Error loading profile from localStorage:", error);
        localStorage.removeItem("fitchat_user_profile"); // Clear corrupted data
      }
    }

    // Don't fetch from server immediately - let the other useEffect handle it
  }, [user]);

  // Fetch từ server khi user login
  const fetchProfileFromServer = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Add timeout and better error handling
      const token = await user.getIdToken();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch("/api/user/profile", {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.userProfile) {
          const serverProfile = data.userProfile;

          // Sử dụng dữ liệu từ server làm master (ưu tiên server)
          const updatedProfile = {
            name: serverProfile.name || "",
            age: serverProfile.age || 0,
            gender: serverProfile.gender || "",
            height: serverProfile.height || 0,
            weight: serverProfile.weight || 0,
            activityLevel: serverProfile.activityLevel || "moderate",
            goal: serverProfile.goal || "maintain_weight",
            personality: serverProfile.personality || "friendly",
          };

          setProfile(updatedProfile);

          // Cập nhật localStorage với dữ liệu từ server
          localStorage.setItem(
            "fitchat_user_profile",
            JSON.stringify(updatedProfile)
          );
          setLastSyncTime(new Date());

          console.log(
            "☁️ Profile synced from server (master source):",
            updatedProfile
          );

          // Dispatch event để thông báo cho các component khác
          window.dispatchEvent(
            new CustomEvent("fitchat-profile-synced", {
              detail: { profile: updatedProfile, source: "server" },
            })
          );
        }
      } else if (response.status === 404) {
        console.warn("⚠️ Server profile not found, keeping local profile");
        setError(null); // Not an error, just no profile yet
      } else {
        console.warn(
          `⚠️ Server responded with ${response.status}, keeping local profile`
        );
        setError(null); // Don't show error for non-critical issues
      }
    } catch (error: any) {
      console.error("❌ Error fetching profile from server:", error);

      // Only set error for real network/auth issues, not for timeout or abort
      if (error.name === "AbortError") {
        console.warn("⏱️ Request timeout, keeping local profile");
        setError(null);
      } else if (
        error.message?.includes("auth") ||
        error.message?.includes("token")
      ) {
        setError("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại");
      } else {
        // Network issues - don't show error to user
        console.warn("🌐 Network issue, will retry later");
        setError(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Sync to server
  const syncToServer = useCallback(
    async (profileData: UserProfile): Promise<boolean> => {
      if (!user) return false;

      try {
        // Add timeout and better error handling
        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response = await fetch("/api/user/profile", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData), // Send profile data directly
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setLastSyncTime(new Date());
          console.log("☁️ Profile synced to server successfully:", data);

          // Dispatch event cho admin dashboard và sidebar
          window.dispatchEvent(
            new CustomEvent("fitchat-profile-updated", {
              detail: { profile: profileData, source: "user" },
            })
          );

          return true;
        } else {
          console.error("❌ Failed to sync to server:", response.status);
          return false;
        }
      } catch (error: any) {
        console.error("❌ Error syncing to server:", error);

        // Handle different error types gracefully
        if (error.name === "AbortError") {
          console.warn("⏱️ Sync timeout, will retry later");
        } else if (
          error.message?.includes("auth") ||
          error.message?.includes("token")
        ) {
          console.warn("🔐 Auth issue during sync");
        } else {
          console.warn("🌐 Network issue during sync");
        }

        return false;
      }
    },
    [user]
  );

  // Update profile với sync 2 chiều
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      const updatedProfile = { ...profile, ...updates };

      // Update local state immediately cho UX tốt
      setProfile(updatedProfile);

      // Update localStorage
      localStorage.setItem(
        "fitchat_user_profile",
        JSON.stringify(updatedProfile)
      );

      // Sync to server in background
      const syncSuccess = await syncToServer(updatedProfile);

      if (!syncSuccess) {
        setError("Đã lưu cục bộ, nhưng chưa đồng bộ được lên server");
      } else {
        setError(null);
      }

      return syncSuccess;
    },
    [profile, syncToServer]
  );

  // Refresh profile từ server (dùng cho admin updates)
  const refreshProfile = useCallback(async () => {
    await fetchProfileFromServer();
  }, [fetchProfileFromServer]);

  // Listen for admin updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { profile: updatedProfile, userId } = event.detail;

      // Chỉ update nếu là user hiện tại
      if (user && userId === user.uid) {
        setProfile(updatedProfile);
        localStorage.setItem(
          "fitchat_user_profile",
          JSON.stringify(updatedProfile)
        );
        setLastSyncTime(new Date());

        console.log("👨‍💼 Profile updated by admin:", updatedProfile);
      }
    };

    window.addEventListener(
      "fitchat-admin-profile-update",
      handleAdminUpdate as EventListener
    );

    return () => {
      window.removeEventListener(
        "fitchat-admin-profile-update",
        handleAdminUpdate as EventListener
      );
    };
  }, [user]);

  // Auto fetch từ server khi user login
  useEffect(() => {
    // Only fetch if user is authenticated and not anonymous
    if (user && !user.isAnonymous && user.emailVerified !== false) {
      console.log("🔄 User authenticated, fetching profile from server...");
      fetchProfileFromServer();
    } else if (user) {
      console.log("⚠️ User not fully authenticated, skipping server fetch");
    }
  }, [user, fetchProfileFromServer]);

  return {
    profile,
    isLoading,
    error,
    updateProfile,
    refreshProfile,
    lastSyncTime,
  };
};
