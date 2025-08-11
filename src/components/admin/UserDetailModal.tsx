"use client";

import { AdminUser } from "@/types/admin";
import {
  XMarkIcon,
  UserIcon,
  EnvelopeIcon,
  CalendarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChatBubbleLeftRightIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface UserDetailModalProps {
  user: AdminUser;
  onClose: () => void;
}

export default function UserDetailModal({
  user,
  onClose,
}: UserDetailModalProps) {
  if (!user) return null;

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "Chưa có";

    try {
      const dateObj = typeof date === "string" ? new Date(date) : date;

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Ngày không hợp lệ";
      }

      return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(dateObj);
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Lỗi định dạng ngày";
    }
  };

  const getSubscriptionBadge = () => {
    if (user.subscription === "pro") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300">
          <StarIcon className="w-4 h-4 mr-1" />
          Pro
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-300">
        Free
      </span>
    );
  };

  const getStatusBadge = () => {
    if (user.isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-300">
          <CheckCircleIcon className="w-4 h-4 mr-1" />
          Hoạt động
        </span>
      );
    }
    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-300">
        <XCircleIcon className="w-4 h-4 mr-1" />
        Vô hiệu hóa
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-20 transition-opacity"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900">
              Thông tin người dùng
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* User Avatar & Basic Info */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-lg font-medium text-gray-900 truncate">
                  {user.displayName || "Chưa có tên"}
                </h4>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center space-x-2 mt-2">
                  {getSubscriptionBadge()}
                  {getStatusBadge()}
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-6">
            {/* Account Info */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Thông tin tài khoản
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Email</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Ngày tạo
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <ClockIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Đăng nhập cuối
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </p>
                  </div>
                </div>

                {/* Pro Subscription Start Date */}
                {user.subscription === "pro" && user.subscriptionStartDate && (
                  <div className="flex items-center space-x-3">
                    <StarIcon className="w-5 h-5 text-yellow-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Bắt đầu Pro
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(user.subscriptionStartDate)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Pro Subscription End Date */}
                {user.subscription === "pro" && user.subscriptionEndDate && (
                  <div className="flex items-center space-x-3">
                    <CalendarIcon className="w-5 h-5 text-orange-500" />
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        Hết hạn Pro
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(user.subscriptionEndDate)}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center space-x-3">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      Tổng số chat
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.totalChats.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Usage Stats */}
            <div>
              <h5 className="text-sm font-medium text-gray-700 mb-3">
                Thống kê sử dụng
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ChatBubbleLeftRightIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-blue-900">
                        Tổng tin nhắn
                      </p>
                      <p className="text-lg font-semibold text-blue-700">
                        {user.totalMessages.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <ClockIcon className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-green-900">
                        Tin nhắn hôm nay
                      </p>
                      <p className="text-lg font-semibold text-green-700">
                        {user.dailyMessageCount.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
