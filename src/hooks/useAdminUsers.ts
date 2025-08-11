import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { AdminUser } from "@/types/admin";

export interface UseAdminUsersReturn {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUser: (userId: string, updates: Partial<AdminUser>) => void;
  removeUser: (userId: string) => void;
}

export function useAdminUsers(): UseAdminUsersReturn {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user] = useAuthState(auth);

  const fetchUsers = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const token = await user.getIdToken();
      const response = await fetch(`/api/admin/users?t=${Date.now()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Cache-Control": "no-cache",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();

      // Convert API response to AdminUser format
      const convertedUsers: AdminUser[] = data.users.map((apiUser: any) => ({
        id: apiUser.uid,
        uid: apiUser.uid,
        email: apiUser.email,
        displayName: apiUser.displayName,
        subscription: apiUser.subscription || "free",
        subscriptionType: apiUser.subscription === "pro" ? "PRO" : "FREE",
        status: apiUser.status || "active",
        isAdmin: apiUser.isAdmin || false,
        subscriptionStartDate: null,
        subscriptionEndDate: null,
        subscriptionDurationMonths: 0,
        createdAt: new Date(apiUser.createdAt),
        lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined,
        isActive: apiUser.isActive,
        totalChats: apiUser.totalChats || 0,
        totalMessages: apiUser.totalMessages || 0,
        dailyMessageCount: apiUser.dailyMessageCount || 0,
        allowedPersonalities: ["friendly"],
      }));

      setUsers(convertedUsers);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = useCallback(
    (userId: string, updates: Partial<AdminUser>) => {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, ...updates } : user
        )
      );
    },
    []
  );

  const removeUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((user) => user.id !== userId));
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUser,
    removeUser,
  };
}
