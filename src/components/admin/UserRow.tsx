"use client";

import { motion } from "framer-motion";
import { AdminUser } from "@/types/admin";
import {
  EyeIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import {
  StatusBadge,
  SubscriptionBadge,
  getUserInitials,
  shouldShowActivateButton,
} from "./utils/UserDisplayUtils";

export interface UserRowProps {
  user: AdminUser;
  onView: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onEditProfile: (user: AdminUser) => void;
  onDelete: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
  onManageSubscription: (user: AdminUser) => void;
  onActivateUser: (user: AdminUser) => void;
  isLoading?: boolean;
}

export default function UserRow({
  user,
  onView,
  onEdit,
  onEditProfile,
  onDelete,
  onToggleStatus,
  onManageSubscription,
  onActivateUser,
  isLoading = false,
}: UserRowProps) {
  const ActionButton = ({
    onClick,
    className,
    title,
    icon: Icon,
    disabled = false,
  }: {
    onClick: () => void;
    className: string;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
  }) => (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.05 }}
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`p-2 rounded-lg transition-colors ${className} ${
        disabled || isLoading ? "opacity-50 cursor-not-allowed" : ""
      }`}
      title={title}
    >
      <Icon className="w-4 h-4" />
    </motion.button>
  );

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
      className="border-b border-gray-200/50 hover:bg-gray-50/50 transition-colors"
    >
      {/* User Info */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white font-medium text-sm">
                {getUserInitials(user)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.displayName || "Chưa có tên"}
            </p>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Subscription */}
      <td className="px-6 py-4">
        <SubscriptionBadge user={user} />
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <StatusBadge user={user} />
      </td>

      {/* Total Chats */}
      <td className="px-6 py-4 text-sm text-gray-900">
        {user.totalChats?.toLocaleString() || 0}
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => onView(user)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            title="Xem chi tiết"
            icon={EyeIcon}
          />

          <ActionButton
            onClick={() => onEditProfile(user)}
            className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
            title="Chỉnh sửa Profile"
            icon={UserIcon}
          />

          <ActionButton
            onClick={() => onManageSubscription(user)}
            className="bg-purple-50 text-purple-600 hover:bg-purple-100"
            title="Quản lý Subscription"
            icon={SparklesIcon}
          />

          {shouldShowActivateButton(user) && (
            <ActionButton
              onClick={() => onActivateUser(user)}
              className="bg-green-50 text-green-600 hover:bg-green-100"
              title="Kích hoạt tài khoản"
              icon={CheckCircleIcon}
            />
          )}

          <ActionButton
            onClick={() => onEdit(user)}
            className="bg-amber-50 text-amber-600 hover:bg-amber-100"
            title="Chỉnh sửa"
            icon={PencilIcon}
          />

          <ActionButton
            onClick={() => onToggleStatus(user)}
            className={
              user.isActive
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-green-50 text-green-600 hover:bg-green-100"
            }
            title={user.isActive ? "Vô hiệu hóa" : "Kích hoạt"}
            icon={user.isActive ? XCircleIcon : CheckCircleIcon}
          />

          <ActionButton
            onClick={() => onDelete(user)}
            className="bg-red-50 text-red-600 hover:bg-red-100"
            title="Xóa"
            icon={TrashIcon}
          />
        </div>
      </td>
    </motion.tr>
  );
}
