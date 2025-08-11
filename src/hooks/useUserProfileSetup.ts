"use client";

import { useEffect } from "react";
import { User } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Hook để tự động tạo user profile trong Firestore sau khi auth
 * Ensures user data exists in Firestore for all authenticated users
 */
export function useUserProfileSetup(user: User | null | undefined) {
  useEffect(() => {
    const createUserProfile = async () => {
      if (!user) return;

      try {
        // Check if user profile already exists
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (!userDoc.exists()) {
          // Create new user profile
          const userProfile = {
            uid: user.uid,
            email: user.email,
            displayName:
              user.displayName || user.email?.split("@")[0] || "User",
            subscription: "free",
            isActive: true,
            dailyMessageCount: 0,
            lastResetDate: new Date().toISOString().split("T")[0],
            dailyExportCount: 0,
            allowedPersonalities: ["friendly", "professional"],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // Subscription fields
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            subscriptionDurationMonths: 0,
            autoRenew: false,
          };

          await setDoc(userDocRef, userProfile);
        } else {
          // Update last login if needed
          const existingData = userDoc.data();
          if (existingData) {
            await setDoc(
              userDocRef,
              {
                ...existingData,
                updatedAt: new Date().toISOString(),
              },
              { merge: true }
            );
          }
        }
      } catch (error) {
        // Silently handle errors in production
      }
    };

    createUserProfile();
  }, [user]);
}

export default useUserProfileSetup;
