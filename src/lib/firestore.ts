import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile } from "./userSettings";

// Interfaces for Firestore data
export interface FirestoreUserProfile extends UserProfile {
  uid: string;
  email?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt: Timestamp;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  context?: string;
  specialRequest?: string;
}

export interface FirestoreChatSession {
  id: string;
  userId: string;
  messages: ChatMessage[];
  title?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserAnalytics {
  userId: string;
  action:
    | "profile_created"
    | "profile_updated"
    | "chat_sent"
    | "workout_requested"
    | "nutrition_requested";
  data?: unknown;
  timestamp: Timestamp;
  sessionId?: string;
}

// User Profile Operations
export class FirestoreService {
  // Save or update user profile
  static async saveUserProfile(
    uid: string,
    profile: UserProfile,
    email?: string
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      const now = serverTimestamp();

      if (userDoc.exists()) {
        // Update existing profile
        await updateDoc(userRef, {
          ...profile,
          email: email || userDoc.data().email,
          updatedAt: now,
          lastLoginAt: now,
        });
      } else {
        // Create new profile
        await setDoc(userRef, {
          uid,
          ...profile,
          email: email || "",
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        });
      }

      // Track analytics
      await this.logUserAnalytics(uid, "profile_updated", profile);
    } catch (error) {
      console.error("Error saving user profile:", error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(
    uid: string
  ): Promise<FirestoreUserProfile | null> {
    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        return userDoc.data() as FirestoreUserProfile;
      }

      return null;
    } catch (error) {
      console.error("Error getting user profile:", error);
      throw error;
    }
  }

  // Save chat session
  static async saveChatSession(
    userId: string,
    messages: ChatMessage[],
    title?: string
  ): Promise<string> {
    try {
      const chatRef = collection(db, "chats");
      const now = serverTimestamp();

      const docRef = await addDoc(chatRef, {
        userId,
        messages,
        title: title || this.generateChatTitle(messages),
        createdAt: now,
        updatedAt: now,
      });

      // Track analytics
      await this.logUserAnalytics(userId, "chat_sent", {
        messageCount: messages.length,
        chatId: docRef.id,
      });

      return docRef.id;
    } catch (error) {
      console.error("Error saving chat session:", error);
      throw error;
    }
  }

  // Get user chat history
  static async getUserChatHistory(
    userId: string,
    limitCount: number = 10
  ): Promise<FirestoreChatSession[]> {
    try {
      const chatsRef = collection(db, "chats");
      const q = query(
        chatsRef,
        where("userId", "==", userId),
        orderBy("updatedAt", "desc"),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const chatHistory: FirestoreChatSession[] = [];

      querySnapshot.forEach((doc) => {
        chatHistory.push({
          id: doc.id,
          ...doc.data(),
        } as FirestoreChatSession);
      });

      return chatHistory;
    } catch (error) {
      console.error("Error getting chat history:", error);
      throw error;
    }
  }

  // Update chat session
  static async updateChatSession(
    chatId: string,
    messages: ChatMessage[]
  ): Promise<void> {
    try {
      const chatRef = doc(db, "chats", chatId);
      await updateDoc(chatRef, {
        messages,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error updating chat session:", error);
      throw error;
    }
  }

  // Log user analytics
  static async logUserAnalytics(
    userId: string,
    action: UserAnalytics["action"],
    data?: unknown,
    sessionId?: string
  ): Promise<void> {
    try {
      const analyticsRef = collection(db, "analytics");
      await addDoc(analyticsRef, {
        userId,
        action,
        data: data || null,
        sessionId: sessionId || null,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging analytics:", error);
      // Don't throw error for analytics to avoid breaking main flow
    }
  }

  // Sync localStorage profile to Firestore
  static async syncProfileToFirestore(
    uid: string,
    email?: string
  ): Promise<void> {
    try {
      // Get profile from localStorage
      const savedProfile = localStorage.getItem("fitchat_user_profile");
      const savedPersonality = localStorage.getItem("fitchat_ai_personality");

      if (savedProfile) {
        const profile: UserProfile = JSON.parse(savedProfile);
        profile.activityLevel = profile.activityLevel || "moderate";
        profile.goal = profile.goal || "general_health";

        // Add personality to profile if exists
        if (savedPersonality) {
          (profile as UserProfile & { personality?: string }).personality =
            savedPersonality;
        }

        await this.saveUserProfile(uid, profile, email);
      }
    } catch (error) {
      console.error("Error syncing profile to Firestore:", error);
      throw error;
    }
  }

  // Sync Firestore profile to localStorage
  static async syncProfileFromFirestore(
    uid: string
  ): Promise<UserProfile | null> {
    try {
      const firestoreProfile = await this.getUserProfile(uid);

      if (firestoreProfile) {
        // Extract UserProfile data (without Firestore metadata)
        const profile: UserProfile = {
          name: firestoreProfile.name,
          age: firestoreProfile.age,
          gender: firestoreProfile.gender,
          height: firestoreProfile.height,
          weight: firestoreProfile.weight,
          activityLevel: firestoreProfile.activityLevel,
          goal: firestoreProfile.goal,
        };

        // Save to localStorage
        localStorage.setItem("fitchat_user_profile", JSON.stringify(profile));

        // Save personality if exists
        if (
          (firestoreProfile as UserProfile & { personality?: string })
            .personality
        ) {
          localStorage.setItem(
            "fitchat_ai_personality",
            (firestoreProfile as UserProfile & { personality?: string })
              .personality!
          );
        }

        // Notify components about the update
        window.dispatchEvent(new CustomEvent("fitchat-profile-updated"));

        return profile;
      }

      return null;
    } catch (error) {
      console.error("Error syncing profile from Firestore:", error);
      throw error;
    }
  }

  // Generate chat title from messages
  private static generateChatTitle(messages: ChatMessage[]): string {
    if (messages.length === 0) return "Cuộc trò chuyện mới";

    const firstUserMessage = messages.find((m) => m.isUser);
    if (firstUserMessage) {
      const title = firstUserMessage.text.substring(0, 50);
      return title.length < firstUserMessage.text.length
        ? title + "..."
        : title;
    }

    return "Cuộc trò chuyện mới";
  }

  // Get user statistics
  static async getUserStats(userId: string): Promise<{
    totalChats: number;
    totalMessages: number;
    profileUpdates: number;
    lastActivity: Date | null;
  }> {
    try {
      const [chatsSnapshot, analyticsSnapshot] = await Promise.all([
        getDocs(query(collection(db, "chats"), where("userId", "==", userId))),
        getDocs(
          query(collection(db, "analytics"), where("userId", "==", userId))
        ),
      ]);

      let totalMessages = 0;
      let profileUpdates = 0;
      let lastActivity: Date | null = null;

      chatsSnapshot.forEach((doc) => {
        const data = doc.data() as FirestoreChatSession;
        totalMessages += data.messages.length;

        if (
          data.updatedAt &&
          (!lastActivity || data.updatedAt.toDate() > lastActivity)
        ) {
          lastActivity = data.updatedAt.toDate();
        }
      });

      analyticsSnapshot.forEach((doc) => {
        const data = doc.data() as UserAnalytics;
        if (data.action === "profile_updated") {
          profileUpdates++;
        }
      });

      return {
        totalChats: chatsSnapshot.size,
        totalMessages,
        profileUpdates,
        lastActivity,
      };
    } catch (error) {
      console.error("Error getting user stats:", error);
      return {
        totalChats: 0,
        totalMessages: 0,
        profileUpdates: 0,
        lastActivity: null,
      };
    }
  }
}
