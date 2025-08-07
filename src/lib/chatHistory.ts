import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import { db } from "./firebase";

export interface ChatHistory {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export class ChatHistoryService {
  private static COLLECTION_NAME = "chatHistory";

  // Lưu cuộc trò chuyện mới với unique ID
  static async saveChatHistory(
    userId: string,
    title: string,
    messages: ChatMessage[]
  ): Promise<string> {
    // Tạo ID unique dựa trên timestamp và user ID để tránh duplicate
    const chatId = `chat_${userId}_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    console.log("💾 Creating new chat with ID:", chatId);

    const chatHistory: ChatHistory = {
      id: chatId,
      title: title.substring(0, 50) + (title.length > 50 ? "..." : ""), // Giới hạn độ dài title
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
      userId,
    };

    await setDoc(doc(db, this.COLLECTION_NAME, chatId), {
      ...chatHistory,
      createdAt: chatHistory.createdAt.toISOString(),
      updatedAt: chatHistory.updatedAt.toISOString(),
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
    });

    console.log("✅ Chat saved successfully:", chatId);
    return chatId;
  }

  // Cập nhật cuộc trò chuyện hiện có
  static async updateChatHistory(
    chatId: string,
    messages: ChatMessage[],
    title?: string
  ): Promise<void> {
    const updateData: Record<string, unknown> = {
      messages: messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp.toISOString(),
      })),
      updatedAt: new Date().toISOString(),
    };

    if (title) {
      updateData.title =
        title.substring(0, 50) + (title.length > 50 ? "..." : "");
    }

    await setDoc(doc(db, this.COLLECTION_NAME, chatId), updateData, {
      merge: true,
    });
  }

  // Lấy danh sách lịch sử trò chuyện của user
  static async getChatHistories(userId: string): Promise<ChatHistory[]> {
    console.log("📊 Getting chat histories for userId:", userId);
    try {
      // Sử dụng query đơn giản để tránh cần composite index
      const q = query(
        collection(db, this.COLLECTION_NAME),
        where("userId", "==", userId),
        limit(20) // Tăng limit để có đủ data sau khi sort
      );

      console.log("🔍 Executing Firestore query...");
      const snapshot = await getDocs(q);
      console.log("📄 Query result - documents count:", snapshot.size);

      const histories: ChatHistory[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        histories.push({
          ...data,
          id: doc.id,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          messages: data.messages.map(
            (msg: {
              id: string;
              text: string;
              isUser: boolean;
              timestamp: string;
            }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })
          ),
        } as ChatHistory);
      });

      // Sort theo updatedAt trên client side
      const sortedHistories = histories
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, 10); // Giới hạn 10 cuộc trò chuyện gần nhất

      console.log(
        "✅ Processed chat histories:",
        sortedHistories.length,
        sortedHistories
      );
      return sortedHistories;
    } catch (error) {
      console.error("❌ Error fetching chat histories:", error);
      return [];
    }
  }

  // Lấy một cuộc trò chuyện cụ thể theo ID
  static async getChatHistoryById(chatId: string): Promise<ChatHistory | null> {
    try {
      const docRef = doc(db, this.COLLECTION_NAME, chatId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          ...data,
          id: docSnap.id,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          messages: data.messages.map(
            (msg: {
              id: string;
              text: string;
              isUser: boolean;
              timestamp: string;
            }) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            })
          ),
        } as ChatHistory;
      }
      return null;
    } catch (error) {
      console.error("Error fetching chat history by ID:", error);
      return null;
    }
  }

  // Xóa cuộc trò chuyện
  static async deleteChatHistory(chatId: string): Promise<void> {
    await deleteDoc(doc(db, this.COLLECTION_NAME, chatId));
  }

  // Tạo title tự động từ tin nhắn đầu tiên
  static generateChatTitle(messages: ChatMessage[]): string {
    const firstUserMessage = messages.find((msg) => msg.isUser);
    if (firstUserMessage) {
      const text = firstUserMessage.text.trim();
      if (text.length <= 40) {
        return text;
      }
      return text.substring(0, 37) + "...";
    }
    return "Cuộc trò chuyện mới";
  }

  // Xóa tất cả lịch sử trò chuyện của user
  static async clearAllChatHistories(userId: string): Promise<void> {
    const histories = await this.getChatHistories(userId);
    const deletePromises = histories.map((history) =>
      this.deleteChatHistory(history.id)
    );
    await Promise.all(deletePromises);
  }
}
