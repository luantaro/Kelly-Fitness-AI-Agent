import { useState, useEffect } from "react";
import { getUserProfile, UserProfile } from "@/lib/userSettings";

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  useEffect(() => {
    const loadProfile = () => {
      const userProfile = getUserProfile();
      setProfile(userProfile);

      if (userProfile) {
        // Check if profile is reasonably complete
        const isComplete = !!(
          userProfile.name &&
          userProfile.age > 0 &&
          userProfile.gender &&
          userProfile.height > 0 &&
          userProfile.weight > 0
        );
        setIsProfileComplete(isComplete);
      } else {
        setIsProfileComplete(false);
      }
    };

    loadProfile();

    // Listen for storage changes (when settings are updated)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fitchat_user_profile") {
        loadProfile();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Also listen for custom events (same-tab updates)
    const handleCustomEvent = () => {
      loadProfile();
    };

    window.addEventListener("fitchat-profile-updated", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("fitchat-profile-updated", handleCustomEvent);
    };
  }, []);

  return { profile, isProfileComplete };
}

// Helper function to dispatch profile update event
export function notifyProfileUpdate() {
  window.dispatchEvent(new CustomEvent("fitchat-profile-updated"));
}
