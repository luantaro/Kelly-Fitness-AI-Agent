"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import FloatingShapes from "@/components/FloatingShapes";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, loading] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminLoading, setAdminLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setAdminLoading(false);
        return;
      }

      try {
        // Emergency admin emails (fallback)
        const ADMIN_EMAILS = [
          "admin@kelly-fitness.com",
          "taro2255@gmail.com",
          "admin@kellyfitness.com",
        ];

        const isAdminByEmail = ADMIN_EMAILS.includes(
          user.email?.toLowerCase() || ""
        );
        console.log("🔍 Admin email check:", isAdminByEmail, "for", user.email);

        // Get fresh token with custom claims - FORCE REFRESH
        const tokenResult = await user.getIdTokenResult(true); // true = force refresh
        const claims = tokenResult.claims;

        console.log("🔍 Admin claims check:", claims);
        console.log("🔍 User email:", user.email);
        console.log("🔍 Claims.admin:", claims.admin);
        console.log("🔍 Full token result:", tokenResult);

        // More explicit admin check
        const hasAdminClaim = !!(
          claims.admin ||
          claims.isAdmin ||
          claims.role === "admin"
        );
        console.log("🔍 Has admin access (claims):", hasAdminClaim);
        console.log("🔍 Has admin access (email):", isAdminByEmail);

        // Use either claims OR email fallback
        const finalAdminStatus = hasAdminClaim || isAdminByEmail;
        console.log("🎯 Final admin status:", finalAdminStatus);

        setIsAdmin(finalAdminStatus);
      } catch (error) {
        console.error("❌ Admin verification failed:", error);

        // Emergency fallback - check by email only
        const ADMIN_EMAILS = [
          "admin@kelly-fitness.com",
          "taro2255@gmail.com",
          "admin@kellyfitness.com",
        ];
        const emergencyAdmin = ADMIN_EMAILS.includes(
          user.email?.toLowerCase() || ""
        );
        console.log("🆘 Emergency admin fallback:", emergencyAdmin);
        setIsAdmin(emergencyAdmin);
      } finally {
        setAdminLoading(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Loading state
  if (loading || adminLoading) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center relative">
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center z-10"
        >
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">
            Đang xác thực quyền admin...
          </p>
        </motion.div>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center relative">
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10 glass-card p-8 rounded-3xl max-w-md"
        >
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Admin Access Required
          </h1>
          <p className="text-white/80 mb-6">
            Vui lòng đăng nhập để truy cập khu vực admin
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="gradient-button px-6 py-3 rounded-xl font-medium text-gray-700 hover:shadow-lg transition-all"
          >
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  // Not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen animated-gradient flex items-center justify-center relative">
        <FloatingShapes />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center z-10 glass-card p-8 rounded-3xl max-w-md"
        >
          <div className="text-6xl mb-4">⛔</div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Không có quyền truy cập
          </h1>
          <p className="text-white/80 mb-2">
            Tài khoản của bạn không có quyền admin
          </p>
          <p className="text-white/60 text-sm mb-6">Email: {user.email}</p>

          {/* Debug info */}
          <div className="text-left bg-black/20 p-4 rounded-lg mb-4 text-xs">
            <p className="text-white/80">🐛 Debug Info:</p>
            <p className="text-white/60">Check browser console for claims</p>
            <button
              onClick={async () => {
                console.log("🔄 Force refreshing token...");
                try {
                  const tokenResult = await user.getIdTokenResult(true);
                  console.log("🔍 New claims:", tokenResult.claims);
                  window.location.reload();
                } catch (error) {
                  console.error("❌ Token refresh failed:", error);
                }
              }}
              className="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-xs"
            >
              Force Refresh Token
            </button>
          </div>

          <button
            onClick={() => (window.location.href = "/")}
            className="gradient-button px-6 py-3 rounded-xl font-medium text-gray-700 hover:shadow-lg transition-all"
          >
            Quay lại trang chủ
          </button>
        </motion.div>
      </div>
    );
  }

  // Admin layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <FloatingShapes />
      {children}
    </div>
  );
}
