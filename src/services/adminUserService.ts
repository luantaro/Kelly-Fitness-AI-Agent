import { AdminUser } from "@/types/admin";

export class AdminUserService {
  private static async getAuthToken(): Promise<string> {
    const { auth } = await import("@/lib/firebase");
    const { useAuthState } = await import("react-firebase-hooks/auth");

    // This is a simplified version - in real implementation,
    // you'd pass the user token from the calling component
    throw new Error("Token must be provided by calling component");
  }

  static async toggleUserStatus(userId: string, token: string): Promise<void> {
    const response = await fetch(`/api/admin/user/activate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to toggle user status");
    }
  }

  static async deleteUser(userId: string, token: string): Promise<void> {
    const response = await fetch(`/api/admin/user/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to delete user");
    }
  }

  static async updateUser(
    userId: string,
    updates: Partial<AdminUser>,
    token: string
  ): Promise<void> {
    const response = await fetch(`/api/admin/users/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, updates }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update user");
    }
  }

  static async activateUser(
    userId: string,
    durationMonths: number,
    token: string
  ): Promise<void> {
    const response = await fetch("/api/admin/user/activate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, durationMonths }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to activate user");
    }
  }

  static async updateSubscription(
    userId: string,
    subscriptionData: {
      type: string;
      durationMonths: number;
      startDate?: Date;
    },
    token: string
  ): Promise<void> {
    const response = await fetch(`/api/admin/users/update-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId, ...subscriptionData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to update subscription");
    }
  }
}
