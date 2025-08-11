"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

// Types
export interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
  personality?: string;
}

export interface TrialStatus {
  hasAccess: boolean;
  status: "trial" | "active" | "expired" | "pending_activation";
  daysRemaining?: number;
  message?: string;
  loading?: boolean;
  subscriptionType?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isActive?: boolean;
  activatedByAdmin?: boolean;
}

interface SyncState {
  isLoading: boolean;
  lastSync: Date | null;
  error: string | null;
  profileSyncEnabled: boolean;
  trialSyncEnabled: boolean;
}

interface UserDataStore {
  // Data
  profile: UserProfile;
  trialStatus: TrialStatus;

  // State
  syncState: SyncState;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  refreshTrialStatus: () => Promise<void>;
  forceFullSync: () => Promise<void>;
  clearData: () => void;

  // Config
  enableProfileSync: (enabled: boolean) => void;
  enableTrialSync: (enabled: boolean) => void;
}

/**
 * 🗄️ Unified Data Manager - Central store cho tất cả user data
 *
 * Quản lý tất cả user data trong 1 nơi:
 * - User Profile (name, age, gender, etc.)
 * - Trial Status (subscription, access, etc.)
 * - Smart caching với localStorage backup
 * - Event-driven architecture cho real-time updates
 * - Robust error handling với graceful fallbacks
 * - Optimized API calls (debouncing, retries, timeouts)
 */
export const useUserDataStore = (): UserDataStore => {
  const [user] = useAuthState(auth);

  // Data State
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    activityLevel: "moderate",
    goal: "maintain_weight",
    personality: "friendly",
  });

  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    hasAccess: true,
    status: "trial",
    loading: true,
  });

  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSync: null,
    error: null,
    profileSyncEnabled: true,
    trialSyncEnabled: true,
  });

  // Refs for controlling intervals and preventing multiple calls
  const trialIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const profileSyncRef = useRef<boolean>(false);
  const trialSyncRef = useRef<boolean>(false);

  // 📱 Local Storage Operations
  const saveProfileToStorage = useCallback((profileData: UserProfile) => {
    try {
      localStorage.setItem("fitchat_user_profile", JSON.stringify(profileData));
      console.log("💾 Profile saved to localStorage");
    } catch (error) {
      console.warn("⚠️ Failed to save profile to localStorage:", error);
    }
  }, []);

  const loadProfileFromStorage = useCallback((): UserProfile | null => {
    try {
      const saved = localStorage.getItem("fitchat_user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("📱 Profile loaded from localStorage");
        return parsed;
      }
    } catch (error) {
      console.warn("⚠️ Failed to load profile from localStorage:", error);
      localStorage.removeItem("fitchat_user_profile"); // Clear corrupted data
    }
    return null;
  }, []);

  // 🌐 API Operations với Smart Error Handling
  const fetchProfileFromAPI =
    useCallback(async (): Promise<UserProfile | null> => {
      if (!user || user.isAnonymous || profileSyncRef.current) return null;

      profileSyncRef.current = true;

      try {
        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("/api/user/profile", {
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${token}`,
            "Cache-Control": "no-cache",
          },
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          if (data.userProfile) {
            console.log("☁️ Profile fetched from API successfully");
            return data.userProfile;
          }
        } else if (response.status === 401) {
          console.warn("🔐 Profile API auth issue, using local data");
          return null;
        } else if (response.status === 404) {
          console.log("📝 No profile found on server, creating new");
          return null;
        } else {
          console.warn(`⚠️ Profile API returned ${response.status}`);
          return null;
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.warn("⏱️ Profile fetch timeout");
        } else {
          console.warn("🌐 Profile fetch error:", error.message);
        }
        return null;
      } finally {
        profileSyncRef.current = false;
      }

      return null;
    }, [user]);

  const syncProfileToAPI = useCallback(
    async (profileData: UserProfile): Promise<boolean> => {
      if (!user || user.isAnonymous) return false;

      try {
        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch("/api/user/profile", {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(profileData),
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          console.log("☁️ Profile synced to API successfully");

          // Dispatch event for other components
          window.dispatchEvent(
            new CustomEvent("fitchat-profile-updated", {
              detail: { profile: profileData, source: "user" },
            })
          );

          return true;
        } else {
          console.warn(`⚠️ Profile sync failed: ${response.status}`);
          return false;
        }
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.warn("⏱️ Profile sync timeout");
        } else {
          console.warn("🌐 Profile sync error:", error.message);
        }
        return false;
      }
    },
    [user]
  );

  const fetchTrialFromAPI =
    useCallback(async (): Promise<TrialStatus | null> => {
      if (!user || user.isAnonymous || trialSyncRef.current) return null;

      trialSyncRef.current = true;

      try {
        const token = await user.getIdToken();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        // Fetch both trial and subscription data
        const [trialResponse, subscriptionResponse] = await Promise.all([
          fetch("/api/user/trial-status", {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("/api/user/subscription-info", {
            signal: controller.signal,
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        clearTimeout(timeoutId);

        let trialData = {};
        let subscriptionData = {};

        if (trialResponse.ok) {
          trialData = await trialResponse.json();
        }

        if (subscriptionResponse.ok) {
          subscriptionData = await subscriptionResponse.json();
        }

        const combinedData = {
          ...trialData,
          ...subscriptionData,
          loading: false,
        };

        console.log("☁️ Trial status fetched from API successfully");
        return combinedData;
      } catch (error: any) {
        if (error.name === "AbortError") {
          console.warn("⏱️ Trial status fetch timeout");
        } else {
          console.warn("🌐 Trial status fetch error:", error.message);
        }
        return null;
      } finally {
        trialSyncRef.current = false;
      }
    }, [user]);

  // 🔄 Sync Operations
  const syncProfile = useCallback(async () => {
    if (!syncState.profileSyncEnabled || !user) return;

    setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      // 1. Load from localStorage first (fast UX)
      const localProfile = loadProfileFromStorage();
      if (localProfile) {
        setProfile(localProfile);
      }

      // 2. Fetch from API (authoritative source)
      const apiProfile = await fetchProfileFromAPI();
      if (apiProfile) {
        const normalizedProfile = {
          name: apiProfile.name || "",
          age: apiProfile.age || 0,
          gender: apiProfile.gender || "",
          height: apiProfile.height || 0,
          weight: apiProfile.weight || 0,
          activityLevel: apiProfile.activityLevel || "moderate",
          goal: apiProfile.goal || "maintain_weight",
          personality: apiProfile.personality || "friendly",
        };

        setProfile(normalizedProfile);
        saveProfileToStorage(normalizedProfile);

        // Dispatch sync event
        window.dispatchEvent(
          new CustomEvent("fitchat-profile-synced", {
            detail: { profile: normalizedProfile, source: "server" },
          })
        );
      }

      setSyncState((prev) => ({
        ...prev,
        lastSync: new Date(),
        error: null,
      }));
    } catch (error: any) {
      console.error("❌ Profile sync error:", error);
      setSyncState((prev) => ({
        ...prev,
        error: "Profile sync failed",
      }));
    } finally {
      setSyncState((prev) => ({ ...prev, isLoading: false }));
    }
  }, [
    user,
    syncState.profileSyncEnabled,
    loadProfileFromStorage,
    saveProfileToStorage,
    fetchProfileFromAPI,
  ]);

  const syncTrialStatus = useCallback(async () => {
    if (!syncState.trialSyncEnabled || !user) return;

    try {
      setTrialStatus((prev) => ({ ...prev, loading: true }));

      const apiTrialStatus = await fetchTrialFromAPI();
      if (apiTrialStatus) {
        setTrialStatus(apiTrialStatus);
      }
    } catch (error: any) {
      console.error("❌ Trial sync error:", error);
      setTrialStatus((prev) => ({
        ...prev,
        loading: false,
        message: "Failed to check trial status",
      }));
    }
  }, [user, syncState.trialSyncEnabled, fetchTrialFromAPI]);

  // 🎯 Public API
  const updateProfile = useCallback(
    async (updates: Partial<UserProfile>): Promise<boolean> => {
      const updatedProfile = { ...profile, ...updates };

      // Update local state immediately
      setProfile(updatedProfile);
      saveProfileToStorage(updatedProfile);

      // Sync to server in background
      const syncSuccess = await syncProfileToAPI(updatedProfile);

      if (!syncSuccess) {
        setSyncState((prev) => ({
          ...prev,
          error: "Profile saved locally but not synced to server",
        }));
      } else {
        setSyncState((prev) => ({
          ...prev,
          error: null,
          lastSync: new Date(),
        }));
      }

      return syncSuccess;
    },
    [profile, saveProfileToStorage, syncProfileToAPI]
  );

  const refreshProfile = useCallback(async () => {
    await syncProfile();
  }, [syncProfile]);

  const refreshTrialStatus = useCallback(async () => {
    await syncTrialStatus();
  }, [syncTrialStatus]);

  const forceFullSync = useCallback(async () => {
    console.log("🔄 Force full sync requested");
    await Promise.all([syncProfile(), syncTrialStatus()]);
  }, [syncProfile, syncTrialStatus]);

  const clearData = useCallback(() => {
    console.log("🧹 Clearing all user data");

    // Clear state
    setProfile({
      name: "",
      age: 0,
      gender: "",
      height: 0,
      weight: 0,
      activityLevel: "moderate",
      goal: "maintain_weight",
      personality: "friendly",
    });

    setTrialStatus({
      hasAccess: false,
      status: "pending_activation",
      loading: false,
    });

    setSyncState({
      isLoading: false,
      lastSync: null,
      error: null,
      profileSyncEnabled: true,
      trialSyncEnabled: true,
    });

    // Clear localStorage
    try {
      localStorage.removeItem("fitchat_user_profile");
    } catch (error) {
      console.warn("⚠️ Failed to clear localStorage:", error);
    }

    // Clear intervals
    if (trialIntervalRef.current) {
      clearInterval(trialIntervalRef.current);
      trialIntervalRef.current = null;
    }
  }, []);

  const enableProfileSync = useCallback((enabled: boolean) => {
    setSyncState((prev) => ({ ...prev, profileSyncEnabled: enabled }));
    console.log(`🔄 Profile sync ${enabled ? "enabled" : "disabled"}`);
  }, []);

  const enableTrialSync = useCallback((enabled: boolean) => {
    setSyncState((prev) => ({ ...prev, trialSyncEnabled: enabled }));
    console.log(`🔄 Trial sync ${enabled ? "enabled" : "disabled"}`);
  }, []);

  // 📡 Setup Effects

  // Initialize data when user changes
  useEffect(() => {
    if (!user) {
      clearData();
      return;
    }

    if (user.isAnonymous) {
      console.log("👻 Anonymous user, skipping sync");
      return;
    }

    console.log("🚀 User authenticated, initializing data store");

    // Initial sync
    const initializeData = async () => {
      await Promise.all([syncProfile(), syncTrialStatus()]);
    };

    initializeData();
  }, [user, syncProfile, syncTrialStatus, clearData]);

  // Setup periodic trial status refresh
  useEffect(() => {
    if (!user || user.isAnonymous || !syncState.trialSyncEnabled) {
      if (trialIntervalRef.current) {
        clearInterval(trialIntervalRef.current);
        trialIntervalRef.current = null;
      }
      return;
    }

    // Setup 2-minute interval for trial status
    trialIntervalRef.current = setInterval(() => {
      if (user && !user.isAnonymous && syncState.trialSyncEnabled) {
        syncTrialStatus();
      }
    }, 120000); // 2 minutes

    return () => {
      if (trialIntervalRef.current) {
        clearInterval(trialIntervalRef.current);
        trialIntervalRef.current = null;
      }
    };
  }, [user, syncState.trialSyncEnabled, syncTrialStatus]);

  // Listen for admin updates
  useEffect(() => {
    const handleAdminUpdate = (event: CustomEvent) => {
      const { profile: updatedProfile, userId } = event.detail;

      if (user && userId === user.uid) {
        console.log("👨‍💼 Admin updated profile, applying changes");
        setProfile(updatedProfile);
        saveProfileToStorage(updatedProfile);
        setSyncState((prev) => ({ ...prev, lastSync: new Date() }));
      }
    };

    const handleStorageChange = () => {
      if (user && !user.isAnonymous) {
        console.log("💾 Storage changed, refreshing data");
        forceFullSync();
      }
    };

    window.addEventListener(
      "fitchat-admin-profile-update",
      handleAdminUpdate as EventListener
    );
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener(
        "fitchat-admin-profile-update",
        handleAdminUpdate as EventListener
      );
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [user, saveProfileToStorage, forceFullSync]);

  return {
    // Data
    profile,
    trialStatus,

    // State
    syncState,

    // Actions
    updateProfile,
    refreshProfile,
    refreshTrialStatus,
    forceFullSync,
    clearData,

    // Config
    enableProfileSync,
    enableTrialSync,
  };
};
