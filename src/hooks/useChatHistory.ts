import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  ChatHistoryService,
  ChatHistory,
  ChatMessage,
} from "@/lib/chatHistory";

export function useChatHistory() {
  const [user] = useAuthState(auth);
  const [chatHistories, setChatHistories] = useState<ChatHistory[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionSaved, setSessionSaved] = useState(false); // Track if current session is saved
  const [sessionId, setSessionId] = useState<string>(() => {
    // Tạo session ID unique cho mỗi instance của hook
    const id = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    console.log("🆔 New useChatHistory instance with sessionId:", id);
    return id;
  });

  // Tải lịch sử trò chuyện khi user đăng nhập
  useEffect(() => {
    console.log("🔄 useChatHistory useEffect - User state changed:", {
      user: user
        ? {
            uid: user.uid,
            isAnonymous: user.isAnonymous,
            email: user.email,
          }
        : null,
    });

    if (user && !user.isAnonymous) {
      console.log("✅ User is authenticated, loading chat histories...");
      loadChatHistories();
    } else {
      console.log("❌ No authenticated user, clearing chat histories");
      setChatHistories([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Tải danh sách lịch sử trò chuyện
  const loadChatHistories = async () => {
    if (!user || user.isAnonymous) return;

    console.log("🔄 Loading chat histories for user:", user.uid);
    setIsLoading(true);
    try {
      const histories = await ChatHistoryService.getChatHistories(user.uid);
      console.log("✅ Loaded chat histories:", histories.length, histories);
      setChatHistories(histories);
    } catch (error) {
      console.error("❌ Error loading chat histories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Lưu cuộc trò chuyện mới
  const saveChatHistory = async (
    title: string,
    messages: ChatMessage[]
  ): Promise<string | null> => {
    if (!user || user.isAnonymous || messages.length === 0) return null;

    try {
      const chatId = await ChatHistoryService.saveChatHistory(
        user.uid,
        title,
        messages
      );
      await loadChatHistories(); // Reload để cập nhật danh sách
      return chatId;
    } catch (error) {
      console.error("Error saving chat history:", error);
      return null;
    }
  };

  // Cập nhật cuộc trò chuyện hiện có
  const updateChatHistory = async (
    chatId: string,
    messages: ChatMessage[],
    title?: string
  ): Promise<void> => {
    if (!user || user.isAnonymous) return;

    try {
      await ChatHistoryService.updateChatHistory(chatId, messages, title);
      await loadChatHistories(); // Reload để cập nhật danh sách
    } catch (error) {
      console.error("Error updating chat history:", error);
    }
  };

  // Xóa cuộc trò chuyện
  const deleteChatHistory = async (chatId: string): Promise<void> => {
    try {
      await ChatHistoryService.deleteChatHistory(chatId);
      await loadChatHistories(); // Reload để cập nhật danh sách

      // Nếu đang ở cuộc trò chuyện bị xóa, reset về null
      if (currentChatId === chatId) {
        setCurrentChatId(null);
      }
    } catch (error) {
      console.error("Error deleting chat history:", error);
    }
  };

  // Xóa tất cả lịch sử trò chuyện
  const clearAllChatHistories = async (): Promise<void> => {
    if (!user || user.isAnonymous) return;

    try {
      await ChatHistoryService.clearAllChatHistories(user.uid);
      setChatHistories([]);
      setCurrentChatId(null);
    } catch (error) {
      console.error("Error clearing all chat histories:", error);
    }
  };

  // Tạo cuộc trò chuyện mới - giống ChatGPT
  const startNewChat = () => {
    console.log("🆕 Starting new chat session");
    setCurrentChatId(null);
    setSessionSaved(false); // Reset session saved flag
    // Tạo session ID mới cho cuộc trò chuyện mới
    const newSessionId = `session_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    setSessionId(newSessionId);
    console.log("🔑 New session ID:", newSessionId);
  };

  // Tải một cuộc trò chuyện cụ thể
  const loadChat = async (chatId: string): Promise<ChatHistory | null> => {
    try {
      console.log("📂 Loading existing chat:", chatId);
      const chat = await ChatHistoryService.getChatHistoryById(chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setSessionSaved(true); // Existing chat is already saved
        // Khi tải chat cũ, sử dụng chatId làm sessionId để tránh tạo duplicate
        setSessionId(chatId);
        console.log("✅ Loaded chat successfully, session set to:", chatId);
        return chat;
      }
      return null;
    } catch (error) {
      console.error("Error loading chat:", error);
      return null;
    }
  };

  // Lưu cuộc trò chuyện - chỉ khi cần thiết (giống ChatGPT)
  const saveChatWhenNeeded = async (messages: ChatMessage[]): Promise<void> => {
    console.log("💾 Save chat when needed - checking conditions:", {
      user: user ? { uid: user.uid, isAnonymous: user.isAnonymous } : null,
      messagesCount: messages.length,
      currentChatId,
      sessionId,
      sessionSaved,
    });

    // Điều kiện để lưu:
    // 1. User đã đăng nhập
    // 2. Có ít nhất 2 tin nhắn (1 user + 1 AI)
    // 3. Chưa có currentChatId (tức là cuộc trò chuyện mới)
    // 4. Session chưa từng được lưu (để tránh duplicate)
    if (
      !user ||
      user.isAnonymous ||
      messages.length < 2 ||
      currentChatId ||
      sessionSaved
    ) {
      console.log("❌ Save skipped - conditions not met");
      return;
    }

    try {
      const title = ChatHistoryService.generateChatTitle(messages);
      console.log("📝 Saving new chat with title:", title);

      const newChatId = await saveChatHistory(title, messages);
      if (newChatId) {
        console.log("✅ New chat saved with ID:", newChatId);
        setCurrentChatId(newChatId);
        setSessionSaved(true); // Mark session as saved
        // Use the chatId as new sessionId
        setSessionId(newChatId);

        // Reload chat histories để cập nhật sidebar
        await loadChatHistories();
      }
    } catch (error) {
      console.error("❌ Error saving new chat:", error);
    }
  };

  // Cập nhật cuộc trò chuyện hiện có
  const updateCurrentChat = async (messages: ChatMessage[]): Promise<void> => {
    console.log("🔄 Update current chat:", {
      currentChatId,
      messagesCount: messages.length,
    });

    if (!user || user.isAnonymous || !currentChatId || messages.length < 2) {
      console.log("❌ Update skipped - conditions not met");
      return;
    }

    try {
      const title = ChatHistoryService.generateChatTitle(messages);
      await updateChatHistory(currentChatId, messages, title);
      console.log("✅ Current chat updated successfully");

      // Reload để cập nhật sidebar
      await loadChatHistories();
    } catch (error) {
      console.error("❌ Error updating current chat:", error);
    }
  };

  return {
    chatHistories,
    currentChatId,
    sessionId,
    isLoading,
    loadChatHistories,
    saveChatHistory,
    updateChatHistory,
    deleteChatHistory,
    clearAllChatHistories,
    startNewChat,
    loadChat,
    saveChatWhenNeeded,
    updateCurrentChat,
  };
}
