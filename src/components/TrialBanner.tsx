"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ClockIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useUserSubscriptionOptimized } from "@/hooks/useUserSubscriptionOptimized";

export default function TrialStatusBanner() {
  const { profile, loading, refreshProfile } = useUserSubscriptionOptimized();
  const [isVisible, setIsVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshProfile();
    } catch (error) {
      console.error("Error refreshing status:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Don't show banner if user is loading, has access, or banner is hidden
  if (loading || !profile || profile.isActive || !isVisible) {
    return null;
  }

  // Don't show banner for active users (already have access)
  if (profile.status === "active") {
    return null;
  }

  // Only show for trial, expired, or pending activation
  if (
    profile.status !== "trial" &&
    profile.status !== "pending_activation" &&
    profile.status !== "expired"
  ) {
    return null;
  }

  const getBannerStyle = () => {
    switch (profile.status) {
      case "trial":
        if (profile.daysRemaining && profile.daysRemaining <= 1) {
          return "from-red-100 to-red-50 border-red-200 text-red-800";
        } else if (profile.daysRemaining && profile.daysRemaining <= 3) {
          return "from-orange-100 to-orange-50 border-orange-200 text-orange-800";
        }
        return "from-blue-100 to-blue-50 border-blue-200 text-blue-800";
      case "expired":
        return "from-red-100 to-red-50 border-red-200 text-red-800";
      case "pending_activation":
        return "from-yellow-100 to-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "from-gray-100 to-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    switch (profile.status) {
      case "trial":
        return <ClockIcon className="w-5 h-5" />;
      case "expired":
        return <XMarkIcon className="w-5 h-5" />;
      case "pending_activation":
        return <SparklesIcon className="w-5 h-5" />;
      default:
        return <ClockIcon className="w-5 h-5" />;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50, height: 0 }}
        animate={{ opacity: 1, y: 0, height: "auto" }}
        exit={{ opacity: 0, y: -50, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`mx-4 mt-4 p-4 rounded-lg border-2 bg-gradient-to-r shadow-md ${getBannerStyle()}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getIcon()}
            <div>
              <div className="font-semibold">{profile.statusMessage}</div>
              {profile.daysRemaining !== undefined &&
                profile.daysRemaining >= 0 && (
                  <div className="text-sm opacity-80">
                    {profile.daysRemaining === 0
                      ? "Hôm nay là ngày cuối!"
                      : `Còn lại ${profile.daysRemaining} ngày`}
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Refresh Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors disabled:opacity-50"
              title="Làm mới trạng thái"
            >
              <ArrowPathIcon
                className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </motion.button>

            {/* Close Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsVisible(false)}
              className="p-2 rounded-lg bg-white/50 hover:bg-white/70 transition-colors"
              title="Đóng thông báo"
            >
              <XMarkIcon className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Progress bar for trial users */}
        {profile.status === "trial" && profile.daysRemaining !== undefined && (
          <div className="mt-3">
            <div className="w-full bg-white/30 rounded-full h-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(0, (profile.daysRemaining / 3) * 100)}%`,
                }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="h-2 rounded-full bg-current opacity-60"
              />
            </div>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
