import { useState } from "react";
import { motion } from "framer-motion";
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface UserStats {
  uid: string;
  email: string;
  displayName?: string;
  subscription: "free" | "pro";
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  subscriptionDurationMonths?: number;
  isActive: boolean;
}

interface SubscriptionModalProps {
  user: UserStats | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (
    userId: string,
    subscription: "free" | "pro",
    durationMonths: number,
    autoRenew: boolean
  ) => void;
}

export default function SubscriptionModal({
  user,
  isOpen,
  onClose,
  onUpdate,
}: SubscriptionModalProps) {
  const [subscription, setSubscription] = useState<"free" | "pro">(
    user?.subscription || "free"
  );
  const [durationMonths, setDurationMonths] = useState(1);
  const [autoRenew, setAutoRenew] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onUpdate(user.uid, subscription, durationMonths, autoRenew);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateEndDate = (months: number) => {
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + months);
    return endDate.toLocaleDateString("vi-VN");
  };

  const getDurationOptions = [
    { value: 1, label: "1 tháng" },
    { value: 3, label: "3 tháng" },
    { value: 6, label: "6 tháng" },
    { value: 12, label: "1 năm" },
    { value: 24, label: "2 năm" },
    { value: 36, label: "3 năm" },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl max-w-md w-full mx-4"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Cập nhật Subscription
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              {/* User Info */}
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-700">
                  {user.displayName || user.email}
                </p>
                <p className="text-xs text-gray-500">
                  Hiện tại: {user.subscription === "pro" ? "Pro" : "Free"}
                </p>
                {user.subscriptionEndDate && (
                  <p className="text-xs text-gray-500">
                    Hết hạn:{" "}
                    {new Date(user.subscriptionEndDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                )}
              </div>

              {/* Subscription Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại gói subscription
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSubscription("free")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      subscription === "free"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    📱 Free
                    <div className="text-xs text-gray-500 mt-1">
                      5 messages/ngày
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubscription("pro")}
                    className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                      subscription === "pro"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    ⭐ Pro
                    <div className="text-xs text-gray-500 mt-1">Unlimited</div>
                  </button>
                </div>
              </div>

              {/* Duration (only for Pro) */}
              {subscription === "pro" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <ClockIcon className="h-4 w-4 inline mr-1" />
                    Thời gian sử dụng
                  </label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {getDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  {durationMonths > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm text-blue-700">
                        📅 Ngày bắt đầu:{" "}
                        {new Date().toLocaleDateString("vi-VN")}
                      </p>
                      <p className="text-sm text-blue-700">
                        📅 Ngày kết thúc: {calculateEndDate(durationMonths)}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Auto Renew */}
              {subscription === "pro" && (
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoRenew"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  />
                  <label htmlFor="autoRenew" className="text-sm text-gray-700">
                    🔄 Tự động gia hạn khi hết hạn
                  </label>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
