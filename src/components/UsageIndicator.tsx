"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { motion } from "framer-motion";

interface UsageStats {
  menuUsage: {
    current: number;
    max: number;
    remaining: number;
    resetDate: string;
    isUnlimited: boolean;
  };
  chatUsage: {
    isUnlimited: boolean;
  };
  subscription: "free" | "pro";
}

export default function UsageIndicator() {
  const [user] = useAuthState(auth);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsage = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Get Firebase token
        const token = await user.getIdToken();

        const response = await fetch("/api/user/quota", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUsage(data);
        }
      } catch (error) {
        console.error("Error fetching usage:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
  }, [user]);

  if (!user || loading) return null;

  if (!usage) return null;

  const isPro = usage.subscription === "pro";
  const menuUsage = usage.menuUsage;

  // Calculate progress percentage for menu usage
  const menuProgress = menuUsage.isUnlimited
    ? 100
    : (menuUsage.current / menuUsage.max) * 100;

  // Get color based on usage
  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const formatResetDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-sm rounded-lg p-2 border border-white/20"
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-semibold text-white/90">
          {isPro ? "✨ Pro" : "🆓 Free"}
        </h3>
        {isPro && (
          <span className="px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs rounded-full">
            PRO
          </span>
        )}
      </div>

      {/* Menu Creation Usage - Compact */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-white/80">🍽️ Thực đơn</span>
          {menuUsage.isUnlimited ? (
            <span className="text-xs text-green-400 font-medium">∞</span>
          ) : (
            <span className="text-xs text-white/60">
              {menuUsage.current}/{menuUsage.max}
            </span>
          )}
        </div>

        <div className="w-full bg-white/20 rounded-full h-1.5">
          <motion.div
            className={`h-1.5 rounded-full ${
              menuUsage.isUnlimited
                ? "bg-green-500"
                : getProgressColor(menuProgress)
            }`}
            initial={{ width: 0 }}
            animate={{
              width: menuUsage.isUnlimited ? "100%" : `${menuProgress}%`,
            }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>

        {!menuUsage.isUnlimited && menuUsage.remaining === 0 && (
          <div className="mt-1">
            <button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs py-1 px-2 rounded-md font-medium hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
              ⚡ Nâng cấp Pro
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}
