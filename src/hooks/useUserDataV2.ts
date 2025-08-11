"use client";

import {
  useUserDataStore,
  UserProfile,
  TrialStatus,
} from "@/stores/userDataStore";

/**
 * 🔄 useUserProfileSync Wrapper
 *
 * Drop-in replacement cho useUserProfileSync hook cũ
 * Sử dụng UserDataStore bên dưới nhưng giữ nguyên API interface
 */
export const useUserProfileSync = () => {
  const { profile, syncState, updateProfile, refreshProfile } =
    useUserDataStore();

  return {
    profile,
    isLoading: syncState.isLoading,
    error: syncState.error,
    updateProfile,
    refreshProfile,
    lastSyncTime: syncState.lastSync,
  };
};

/**
 * 🎫 useTrialStatus Wrapper
 *
 * Drop-in replacement cho useTrialStatus hook cũ
 * Sử dụng UserDataStore bên dưới nhưng giữ nguyên API interface
 */
export const useTrialStatus = () => {
  const { trialStatus, refreshTrialStatus } = useUserDataStore();

  const refetchTrialStatus = refreshTrialStatus;

  return {
    ...trialStatus,
    refetchTrialStatus,
  };
};

/**
 * 🗄️ useUserData
 *
 * New unified hook for components that need both profile and trial data
 */
export const useUserData = () => {
  const store = useUserDataStore();

  return {
    // Data
    profile: store.profile,
    trialStatus: store.trialStatus,

    // State
    isLoading: store.syncState.isLoading,
    error: store.syncState.error,
    lastSync: store.syncState.lastSync,

    // Actions
    updateProfile: store.updateProfile,
    refreshProfile: store.refreshProfile,
    refreshTrialStatus: store.refreshTrialStatus,
    forceFullSync: store.forceFullSync,

    // Config
    enableProfileSync: store.enableProfileSync,
    enableTrialSync: store.enableTrialSync,

    // Utils
    clearData: store.clearData,
  };
};

// Re-export types for convenience
export type { UserProfile, TrialStatus };
