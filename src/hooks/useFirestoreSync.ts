import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { FirestoreService, ChatMessage } from "@/lib/firestore";
import { UserProfile } from "@/lib/userSettings";

export function useFirestoreSync() {
  const [user, loading] = useAuthState(auth);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  // Auto-sync when user logs in
  useEffect(() => {
    if (user && !user.isAnonymous && !loading) {
      handleInitialSync();
    }
     
  }, [user, loading]);

  // Initial sync when user logs in
  const handleInitialSync = async () => {
    if (!user || user.isAnonymous) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      // Try to get profile from Firestore first
      const firestoreProfile = await FirestoreService.getUserProfile(user.uid);

      if (firestoreProfile) {
        // Sync from Firestore to localStorage
        await FirestoreService.syncProfileFromFirestore(user.uid);
        console.log("✅ Profile synced from Firestore to localStorage");
      } else {
        // Sync from localStorage to Firestore
        await FirestoreService.syncProfileToFirestore(
          user.uid,
          user.email || undefined
        );
        console.log("✅ Profile synced from localStorage to Firestore");
      }

      setLastSyncTime(new Date());
    } catch (error) {
      console.error("❌ Sync error:", error);
      setSyncError(
        error instanceof Error ? error.message : "Unknown sync error"
      );
    } finally {
      setIsSyncing(false);
    }
  };

  // Manual sync profile to Firestore
  const syncProfileToFirestore = async (profile: UserProfile) => {
    if (!user || user.isAnonymous) return false;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await FirestoreService.saveUserProfile(
        user.uid,
        profile,
        user.email || undefined
      );
      setLastSyncTime(new Date());
      console.log("✅ Profile manually synced to Firestore");
      return true;
    } catch (error) {
      console.error("❌ Manual sync error:", error);
      setSyncError(
        error instanceof Error ? error.message : "Failed to sync profile"
      );
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  // Get user chat history
  const getChatHistory = async (limit: number = 10) => {
    if (!user || user.isAnonymous) return [];

    try {
      return await FirestoreService.getUserChatHistory(user.uid, limit);
    } catch (error) {
      console.error("❌ Error getting chat history:", error);
      return [];
    }
  };

  // Save current chat session
  const saveChatSession = async (messages: ChatMessage[], title?: string) => {
    if (!user || user.isAnonymous) return null;

    try {
      const chatId = await FirestoreService.saveChatSession(
        user.uid,
        messages,
        title
      );
      console.log("✅ Chat session saved:", chatId);
      return chatId;
    } catch (error) {
      console.error("❌ Error saving chat session:", error);
      return null;
    }
  };

  // Get user statistics
  const getUserStats = async () => {
    if (!user || user.isAnonymous) return null;

    try {
      return await FirestoreService.getUserStats(user.uid);
    } catch (error) {
      console.error("❌ Error getting user stats:", error);
      return null;
    }
  };

  return {
    // Status
    user,
    isAuthenticated: !!user && !user.isAnonymous,
    isSyncing,
    syncError,
    lastSyncTime,

    // Actions
    syncProfileToFirestore,
    getChatHistory,
    saveChatSession,
    getUserStats,

    // Utils
    clearSyncError: () => setSyncError(null),
  };
}
