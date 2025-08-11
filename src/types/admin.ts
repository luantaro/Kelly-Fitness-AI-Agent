export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  createdAt: Date;
  lastLogin: Date;
  subscription: "trial" | "free" | "pro";
  subscriptionType?: "FREE" | "PRO"; // For backward compatibility
  subscriptionStatus?: "ACTIVE" | "EXPIRED";
  status?: "trial" | "active" | "expired" | "pending_activation";
  isActive: boolean;
  isAdmin?: boolean; // Add admin flag
  totalChats: number;
  totalMessages: number;
  dailyMessageCount: number;
  // New trial/activation fields
  trialStartDate?: Date;
  trialEndDate?: Date;
  activatedByAdmin?: boolean;
  activatedDate?: Date;
  activatedByAdminId?: string;
  subscriptionStartDate?: Date;
  subscriptionEndDate?: Date;
  subscriptionDurationMonths?: number;
}

export interface ApiUser {
  uid: string;
  email: string;
  displayName?: string;
  createdAt: Date;
  lastLogin: Date;
  subscription: "free" | "pro";
  isActive: boolean;
  totalChats: number;
  totalMessages: number;
  dailyMessageCount: number;
}
