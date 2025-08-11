"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { AdminUser } from "@/types/admin";
import UserTable from "./UserTable";
import UserDetailModal from "./UserDetailModal";
import UserEditModal from "./UserEditModal";
import UserProfileEditModal from "./UserProfileEditModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import SubscriptionManagerModal from "./SubscriptionManagerModal";
import ActivateUserModal from "./ActivateUserModal";
import { useAdminModals } from "@/hooks/useAdminModals";
import LoadingSpinner from "./LoadingSpinner";
import { useApiCall } from "@/hooks/common-hooks";
import { ErrorDisplay, AnimatedContainer } from "@/components/ui/common-ui";

export default function RefactoredUserManagement() {
  const [user] = useAuthState(auth);
  const { activeModal, selectedUser, openModal, closeModal, isOpen } =
    useAdminModals();

  // Optimized API call with caching
  const fetchUsers = async (): Promise<AdminUser[]> => {
    if (!user) throw new Error("User not authenticated");

    const token = await user.getIdToken();
    const response = await fetch(`/api/admin/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Cache-Control": "no-cache",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.status}`);
    }

    const data = await response.json();

    // Transform API data to AdminUser format
    return data.users.map((apiUser: any) => ({
      id: apiUser.uid,
      uid: apiUser.uid,
      email: apiUser.email,
      displayName: apiUser.displayName,
      subscription: apiUser.subscription || "free",
      subscriptionType: apiUser.subscription === "pro" ? "PRO" : "FREE",
      status: apiUser.status || "active",
      isAdmin: apiUser.isAdmin || false,
      subscriptionStartDate: apiUser.subscriptionStartDate
        ? new Date(apiUser.subscriptionStartDate)
        : null,
      subscriptionEndDate: apiUser.subscriptionEndDate
        ? new Date(apiUser.subscriptionEndDate)
        : null,
      subscriptionDurationMonths: apiUser.subscriptionDurationMonths || 0,
      createdAt: new Date(apiUser.createdAt),
      lastLogin: apiUser.lastLogin ? new Date(apiUser.lastLogin) : undefined,
      isActive: apiUser.isActive,
      totalChats: apiUser.totalChats || 0,
      totalMessages: apiUser.totalMessages || 0,
      dailyMessageCount: apiUser.dailyMessageCount || 0,
      allowedPersonalities: ["friendly"],
    }));
  };

  const {
    data: users,
    loading,
    error,
    refetch,
  } = useApiCall(fetchUsers, [user], {
    immediate: !!user,
    cacheKey: "admin-users",
    cacheDuration: 2 * 60 * 1000, // 2 minutes cache
  });

  // Ensure users is never null
  const safeUsers = users || [];

  // Optimized API operations with error handling
  const handleApiOperation = async (
    operation: () => Promise<void>,
    successMessage?: string
  ) => {
    try {
      console.log("🔄 Starting API operation...");
      await operation();
      console.log("✅ API operation successful, refreshing data...");

      // Add small delay to ensure backend has processed the change
      await new Promise((resolve) => setTimeout(resolve, 500));
      await refetch(); // Refresh data

      console.log("🔄 Data refreshed successfully");
      closeModal();
      if (successMessage) {
        console.log("✅", successMessage);
      }
    } catch (error) {
      console.error("❌ API operation failed:", error);
      // Error is handled by the operation itself
    }
  };

  const handleUpdateSubscription = async (
    userId: string,
    subscriptionType: string,
    durationMonths: number
  ) => {
    await handleApiOperation(async () => {
      console.log("🔄 Update subscription params:", {
        userId,
        subscriptionType,
        durationMonths,
      });

      const requestBody = {
        uid: userId, // API expects 'uid' not 'userId'
        subscription: subscriptionType, // API expects 'subscription' not 'subscriptionType'
        subscriptionDurationMonths: durationMonths,
        updatedAt: new Date().toISOString(),
      };

      console.log("📦 Request body:", requestBody);

      const token = await user!.getIdToken();
      const response = await fetch("/api/admin/users/update-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Update subscription failed:", errorData);
        throw new Error(`Failed to update subscription: ${errorData}`);
      }

      const result = await response.json();
      console.log("✅ Update subscription response:", result);
    }, "Subscription updated successfully");
  };

  const handleDeleteUser = async (userId: string) => {
    await handleApiOperation(async () => {
      const token = await user!.getIdToken();
      const response = await fetch("/api/admin/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }
    }, "User deleted successfully");
  };

  const handleToggleUserStatus = async (userId: string, newStatus: string) => {
    await handleApiOperation(async () => {
      const token = await user!.getIdToken();
      const response = await fetch("/api/admin/users/toggle-status-secure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId,
          newStatus: newStatus === "active" ? "inactive" : "active",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to toggle user status");
      }
    }, "User status updated successfully");
  };

  const handleActivateUser = async (userId: string, durationMonths: number) => {
    await handleApiOperation(async () => {
      console.log(
        "🎯 Activating user:",
        userId,
        "for",
        durationMonths,
        "months"
      );
      const token = await user!.getIdToken();
      const response = await fetch("/api/admin/users/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId, durationMonths }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Activation failed:", errorData);
        throw new Error(`Failed to activate user: ${errorData}`);
      }

      const result = await response.json();
      console.log("✅ Activation response:", result);
    }, `User activated for ${durationMonths} months`);
  };

  // Statistics calculations
  const stats = {
    total: safeUsers.length,
    active: safeUsers.filter((u) => u.status === "active").length,
    premium: safeUsers.filter((u) => u.subscription === "pro").length,
    admins: safeUsers.filter((u) => u.isAdmin).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
        <span className="ml-3 text-gray-600">Loading users...</span>
      </div>
    );
  }

  return (
    <AnimatedContainer className="space-y-6">
      {/* Header with stats */}
      <div className="bg-white rounded-xl border border-gray-200/50 p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          User Management
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatCard title="Total Users" value={stats.total} color="blue" />
          <StatCard title="Active Users" value={stats.active} color="green" />
          <StatCard
            title="Premium Users"
            value={stats.premium}
            color="purple"
          />
          <StatCard title="Admins" value={stats.admins} color="orange" />
        </div>

        <ErrorDisplay error={error} onRetry={refetch} />
      </div>

      {/* User Table */}
      <UserTable
        users={safeUsers}
        loading={loading}
        error={error || null}
        onView={(user: AdminUser) => openModal("view", user)}
        onEdit={(user: AdminUser) => openModal("edit", user)}
        onEditProfile={(user: AdminUser) => openModal("profile", user)}
        onDelete={(user: AdminUser) => openModal("delete", user)}
        onToggleStatus={(user: AdminUser) =>
          handleToggleUserStatus(user.uid, user.status || "active")
        }
        onActivateUser={(user: AdminUser) => openModal("activate", user)}
        onManageSubscription={(user: AdminUser) =>
          openModal("subscription", user)
        }
      />

      {/* Modals */}
      {isOpen("view") && selectedUser && (
        <UserDetailModal user={selectedUser} onClose={closeModal} />
      )}

      {isOpen("edit") && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onSave={async (updates) => {
            await handleApiOperation(async () => {
              const token = await user!.getIdToken();
              const response = await fetch("/api/admin/users/update", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  userId: selectedUser.uid, // Use selectedUser.uid instead of updatedUser.uid
                  updates: {
                    displayName: updates.displayName,
                    subscriptionType:
                      updates.subscriptionType || selectedUser.subscription,
                    isActive: updates.isActive,
                  },
                }),
              });

              if (!response.ok) {
                throw new Error("Failed to update user");
              }
            }, "User updated successfully");
          }}
          onClose={closeModal}
        />
      )}

      {isOpen("profile") && selectedUser && (
        <UserProfileEditModal
          isOpen={true}
          user={selectedUser}
          onClose={closeModal}
          onProfileUpdated={() => refetch()}
        />
      )}

      {isOpen("delete") && selectedUser && (
        <DeleteConfirmModal
          user={selectedUser}
          onConfirm={() => handleDeleteUser(selectedUser.uid)}
          onClose={closeModal}
        />
      )}

      {isOpen("subscription") && selectedUser && (
        <SubscriptionManagerModal
          user={selectedUser}
          onSave={async (subscriptionData: any) => {
            console.log("💾 Subscription save data:", subscriptionData);
            await handleUpdateSubscription(
              selectedUser.uid,
              subscriptionData.subscription, // Fixed: use 'subscription' not 'type'
              subscriptionData.subscriptionDurationMonths ||
                subscriptionData.durationMonths
            );
          }}
          onClose={closeModal}
        />
      )}

      {isOpen("activate") && selectedUser && (
        <ActivateUserModal
          user={selectedUser}
          onActivate={(durationMonths: number) =>
            handleActivateUser(selectedUser.uid, durationMonths)
          }
          onClose={closeModal}
        />
      )}
    </AnimatedContainer>
  );
}

// Optimized stats card component
interface StatCardProps {
  title: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
}

function StatCard({ title, value, color }: StatCardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200/50 p-4 shadow-sm">
      <div className="text-center">
        <div
          className={`w-8 h-8 rounded-lg ${colorClasses[color]} flex items-center justify-center mx-auto mb-2`}
        >
          <div className="w-3 h-3 rounded-full bg-current" />
        </div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
