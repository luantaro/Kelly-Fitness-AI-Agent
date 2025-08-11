"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  SparklesIcon,
  CalendarIcon,
  UserIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { AdminUser } from "@/types/admin";

interface SubscriptionManagerModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (subscriptionData: any) => Promise<void>;
}

export default function SubscriptionManagerModal({
  user,
  onClose,
  onSave,
}: SubscriptionManagerModalProps) {
  const [subscription, setSubscription] = useState<"trial" | "free" | "pro">(
    user.subscription || "free"
  );
  const [durationMonths, setDurationMonths] = useState(
    user.subscriptionDurationMonths || 1
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setLoading(true);
    setError("");

    try {
      const now = new Date();
      const endDate = new Date(now);
      endDate.setMonth(now.getMonth() + durationMonths);

      const updates = {
        subscription,
        subscriptionStartDate:
          subscription === "pro" ? now.toISOString() : null,
        subscriptionEndDate:
          subscription === "pro" ? endDate.toISOString() : null,
        subscriptionDurationMonths: subscription === "pro" ? durationMonths : 0,
        updatedAt: now.toISOString(),
      };

      await onSave(updates);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      setError("");
    }
  };

  const presetOptions = [
    { months: 1, label: "1 tháng", price: "100k" },
    { months: 3, label: "3 tháng", price: "270k" },
    { months: 6, label: "6 tháng", price: "480k" },
    { months: 12, label: "1 năm", price: "900k" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-gray-500/20 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quản lý Subscription
              </h3>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {user.displayName
                    ? user.displayName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .substring(0, 2)
                        .toUpperCase()
                    : user.email.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {user.displayName || "Chưa có tên"}
                </p>
                <p className="text-sm text-gray-500">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.subscription === "pro"
                        ? "bg-yellow-100 text-yellow-800"
                        : user.subscription === "trial"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.subscription === "pro"
                      ? "PRO"
                      : user.subscription === "trial"
                      ? "TRIAL"
                      : "FREE"}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      user.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.isActive ? "Hoạt động" : "Tạm khóa"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription Type */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Loại subscription
            </label>

            <div className="grid grid-cols-3 gap-3">
              {["trial", "free", "pro"].map((type) => (
                <button
                  key={type}
                  onClick={() =>
                    setSubscription(type as "trial" | "free" | "pro")
                  }
                  disabled={loading}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    subscription === type
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                  } disabled:opacity-50`}
                >
                  {type === "trial"
                    ? "Dùng thử"
                    : type === "free"
                    ? "Miễn phí"
                    : "Pro"}
                </button>
              ))}
            </div>
          </div>

          {/* Duration (only for Pro) */}
          {subscription === "pro" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Thời hạn subscription (tháng)
              </label>

              {/* Preset options */}
              <div className="grid grid-cols-2 gap-3">
                {presetOptions.map((option) => (
                  <button
                    key={option.months}
                    onClick={() => setDurationMonths(option.months)}
                    disabled={loading}
                    className={`p-3 rounded-lg border text-sm transition-colors ${
                      durationMonths === option.months
                        ? "border-purple-500 bg-purple-50 text-purple-700"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                    } disabled:opacity-50`}
                  >
                    <div className="font-medium">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.price}</div>
                  </button>
                ))}
              </div>

              {/* Custom input */}
              <div className="space-y-2">
                <label className="block text-sm text-gray-600">
                  Hoặc nhập tùy chỉnh:
                </label>
                <div className="relative">
                  <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={durationMonths}
                    onChange={(e) =>
                      setDurationMonths(parseInt(e.target.value) || 1)
                    }
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:opacity-50"
                    placeholder="Nhập số tháng"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Summary */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Tóm tắt thay đổi:
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • Subscription:{" "}
                {subscription === "trial"
                  ? "Dùng thử"
                  : subscription === "free"
                  ? "Miễn phí"
                  : "Pro"}
              </li>
              {subscription === "pro" && (
                <li>• Thời hạn: {durationMonths} tháng</li>
              )}
              <li>• Tài khoản sẽ được cập nhật ngay lập tức</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            onClick={handleClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            <span>{loading ? "Đang lưu..." : "Lưu thay đổi"}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
