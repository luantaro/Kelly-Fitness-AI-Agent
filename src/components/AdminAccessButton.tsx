"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

export default function AdminAccessButton() {
  const [user] = useAuthState(auth);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminData, setAdminData] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) return;

      try {
        const token = await user.getIdToken(true); // Force refresh
        const tokenResult = await user.getIdTokenResult();
        console.log("Token claims:", tokenResult.claims);

        setAdminData(tokenResult.claims);
        setIsAdmin(!!tokenResult.claims.admin);
      } catch (error) {
        console.error("Error checking admin status:", error);
      }
    };

    checkAdmin();
  }, [user]);

  if (!user) return null;

  // Only show admin button for admin users
  if (!isAdmin) return null;

  return (
    <div className="fixed top-4 right-4 z-50">
      <motion.a
        href="/admin"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="block px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
      >
        🚀 Admin Dashboard
      </motion.a>
    </div>
  );
}
