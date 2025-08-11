import { AdminUser } from "@/types/admin";
import {
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

export interface StatusBadgeProps {
  user: AdminUser;
  className?: string;
}

export function StatusBadge({ user, className = "" }: StatusBadgeProps) {
  const getStatusConfig = () => {
    // Admin badge gets priority
    if (user.isAdmin) {
      return {
        text: "Admin",
        icon: StarIcon,
        className:
          "bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300",
      };
    }

    if (!user.isActive) {
      return {
        text: "Tạm khóa",
        icon: XCircleIcon,
        className: "bg-red-100 text-red-700 border-red-300",
      };
    }

    // Check for trial status
    if (user.status === "trial") {
      return {
        text: "Dùng thử",
        icon: null,
        className: "bg-blue-100 text-blue-700 border-blue-300",
        emoji: "⏰",
      };
    }

    // Check for pending activation
    if (user.status === "pending_activation") {
      return {
        text: "Chờ kích hoạt",
        icon: null,
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        emoji: "⏳",
      };
    }

    if (user.subscriptionStatus === "EXPIRED") {
      return {
        text: "Hết hạn",
        icon: null,
        className: "bg-orange-100 text-orange-700 border-orange-300",
      };
    }

    return {
      text: "Hoạt động",
      icon: CheckCircleIcon,
      className: "bg-green-100 text-green-700 border-green-300",
    };
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.className} ${className}`}
    >
      {config.emoji && <span className="mr-1">{config.emoji}</span>}
      {IconComponent && <IconComponent className="w-3 h-3 mr-1" />}
      {config.text}
    </span>
  );
}

export interface SubscriptionBadgeProps {
  user: AdminUser;
  className?: string;
}

export function SubscriptionBadge({
  user,
  className = "",
}: SubscriptionBadgeProps) {
  if (user.subscription === "pro") {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300 ${className}`}
      >
        <StarIcon className="w-3 h-3 mr-1" />
        Pro
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300 ${className}`}
    >
      Free
    </span>
  );
}

export function formatDate(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | undefined): string {
  if (!date) return "N/A";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getUserInitials(user: AdminUser): string {
  return (user.displayName || user.email || "U").charAt(0).toUpperCase();
}

export function shouldShowActivateButton(user: AdminUser): boolean {
  return (
    !user.isAdmin &&
    (user.status === "trial" || user.status === "pending_activation")
  );
}
