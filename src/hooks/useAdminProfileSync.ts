"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { AdminUser } from "@/types/admin";

interface UseAdminProfileSyncReturn {
  updateUserProfile: (userId: string, profileData: any) => Promise<boolean>;
  getUserProfile: (userId: string) => Promise<any>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook cho admin quản lý profile của users
 * - Lấy và cập nhật profile của bất kỳ user nào
 * - Tự động thông báo cho user khi admin cập nhật
 * - Tích hợp với admin dashboard
 */
export const useAdminProfileSync = (): UseAdminProfileSyncReturn => {
  const [user] = useAuthState(auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get user profile by ID (for admin)
  const getUserProfile = useCallback(
    async (userId: string) => {
      if (!user) throw new Error("Admin not authenticated");

      setIsLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/users/${userId}/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile: ${response.status}`);
        }

        const data = await response.json();
        console.log("👨‍💼 Fetched user profile:", data.userProfile);
        return data.userProfile;
      } catch (error) {
        console.error("❌ Error fetching user profile:", error);
        setError("Không thể tải thông tin user");
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  // Update user profile (admin action)
  const updateUserProfile = useCallback(
    async (userId: string, profileData: any): Promise<boolean> => {
      if (!user) return false;

      setIsLoading(true);
      setError(null);

      try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/admin/users/${userId}/profile`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userProfile: profileData,
            updatedAt: new Date().toISOString(),
            updatedBy: user.email,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to update user profile: ${response.status}`);
        }

        const result = await response.json();
        console.log("👨‍💼 Updated user profile successfully:", result);

        // Thông báo cho user rằng admin đã cập nhật profile
        window.dispatchEvent(
          new CustomEvent("fitchat-admin-profile-update", {
            detail: {
              profile: profileData,
              userId,
              updatedBy: user.email,
              timestamp: new Date().toISOString(),
            },
          })
        );

        setError(null);
        return true;
      } catch (error) {
        console.error("❌ Error updating user profile:", error);
        setError("Không thể cập nhật thông tin user");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [user]
  );

  return {
    updateUserProfile,
    getUserProfile,
    isLoading,
    error,
  };
};
