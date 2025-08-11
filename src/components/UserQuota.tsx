"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";
import {
  SparklesIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";

interface UserQuotaProps {
  onUpgradeClick?: () => void;
}

interface QuotaData {
  subscription: "free" | "pro";
  dailyMessageCount: number;
  dailyMessageLimit: number;
  dailyExportCount: number;
  dailyExportLimit: number;
  allowedPersonalities: string[];
  totalPersonalities: number;
}

export default function UserQuota({ onUpgradeClick }: UserQuotaProps) {
  const [user] = useAuthState(auth);
  const [quotaData, setQuotaData] = useState<QuotaData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadQuotaData();
    }
  }, [user]);

  const loadQuotaData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/user/quota?userId=${user.uid}`);
      if (response.ok) {
        const data = await response.json();
        setQuotaData(data);
      }
    } catch (error) {
      console.error("Error loading quota data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading || !quotaData) {
    return null;
  }

  const isProUser = quotaData.subscription === "pro";
  const messageProgress = isProUser
    ? 100
    : (quotaData.dailyMessageCount / quotaData.dailyMessageLimit) * 100;
  const exportProgress = isProUser
    ? 100
    : (quotaData.dailyExportCount / quotaData.dailyExportLimit) * 100;
  const personalityProgress =
    (quotaData.allowedPersonalities.length / quotaData.totalPersonalities) *
    100;

  if (isProUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl shadow-lg"
      >
        <div className="flex items-center space-x-3">
          <SparklesIcon className="h-6 w-6" />
          <div>
            <h3 className="font-bold">Kelly Pro</h3>
            <p className="text-sm opacity-90">Trải nghiệm không giới hạn</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-5 w-5 text-gray-600" />
          <h3 className="font-medium text-gray-800">Gói Free</h3>
        </div>
        <button
          onClick={onUpgradeClick}
          className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
        >
          Nâng cấp Pro
        </button>
      </div>

      <div className="space-y-3">
        {/* Message Quota */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Tin nhắn hôm nay</span>
            <span className="text-gray-800 font-medium">
              {quotaData.dailyMessageCount}/{quotaData.dailyMessageLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                messageProgress >= 80
                  ? "bg-red-500"
                  : messageProgress >= 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(messageProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Export Quota */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Export PDF hôm nay</span>
            <span className="text-gray-800 font-medium">
              {quotaData.dailyExportCount}/{quotaData.dailyExportLimit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                exportProgress >= 80
                  ? "bg-red-500"
                  : exportProgress >= 60
                  ? "bg-yellow-500"
                  : "bg-green-500"
              }`}
              style={{ width: `${Math.min(exportProgress, 100)}%` }}
            />
          </div>
        </div>

        {/* Personality Access */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600">Cá tính AI</span>
            <span className="text-gray-800 font-medium">
              {quotaData.allowedPersonalities.length}/
              {quotaData.totalPersonalities}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full bg-blue-500 transition-all duration-300"
              style={{ width: `${personalityProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warning when approaching limits */}
      {messageProgress >= 80 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
        >
          <p className="text-sm text-yellow-800">
            ⚠️ Bạn sắp đạt giới hạn tin nhắn! Nâng cấp Pro để sử dụng không giới
            hạn.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
