"use client";

import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import { motion, AnimatePresence } from "framer-motion";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useUserProfileSetup } from "@/hooks/useUserProfileSetup";

// Components
import Sidebar from "@/components/Sidebar";
import ChatInterface from "@/components/ChatInterface";
import AuthForm from "@/components/AuthForm";
import FloatingShapes from "@/components/FloatingShapes";
import AdminAccessButton from "@/components/AdminAccessButton";
import TrialStatusBanner from "@/components/TrialBanner";

interface LoadedMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function HomePage() {
  const [user, loading] = useAuthState(auth);
  const [forceShowContent, setForceShowContent] = useState(false);

  // Force show content after 10 seconds if still loading
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("Auth loading timeout - forcing content display");
        setForceShowContent(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [loading]);

  // Setup user profile in Firestore when authenticated
  useUserProfileSetup(user);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState("chat");
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [loadedMessages, setLoadedMessages] = useState<LoadedMessage[]>([]);
  const [currentMessages, setCurrentMessages] = useState<LoadedMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  const { loadChat, saveChatWhenNeeded, startNewChat } = useChatHistory();

  // Show loading spinner while checking auth
  if (loading && !forceShowContent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg font-medium">Đang tải...</p>
          <p className="text-gray-400 text-sm mt-2">
            Đang kiểm tra đăng nhập...
          </p>
        </div>
      </div>
    );
  }

  // Show auth form if user is not logged in
  if (!user) {
    return (
      <>
        <FloatingShapes />
        <AuthForm mode="login" />
      </>
    );
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    // Chỉ đóng sidebar trên mobile (màn hình nhỏ)
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleNewChat = async () => {
    console.log("🆕 Page handleNewChat called");

    // Gọi startNewChat từ useChatHistory để tạo session mới
    startNewChat();

    // Reset UI state
    console.log("🔄 Creating new chat...");
    setCurrentChatId(null);
    setLoadedMessages([]);
    setCurrentMessages([]);
    console.log("✅ New chat created - cleared all state");
  };

  const handleMessagesChange = (messages: LoadedMessage[]) => {
    setCurrentMessages(messages);
  };

  const handleLoadChat = async (chatId: string) => {
    setIsLoadingChat(true);
    try {
      const chat = await loadChat(chatId);
      if (chat) {
        setCurrentChatId(chatId);
        setLoadedMessages(chat.messages);
        setCurrentPage("chat"); // Switch to chat page
        // Chỉ đóng sidebar trên mobile (màn hình nhỏ) để UX tốt hơn
        if (window.innerWidth < 768) {
          setSidebarOpen(false);
        }
      }
    } catch (error) {
      console.error("Error loading chat:", error);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case "chat":
      case "fitness":
      case "nutrition":
        return (
          <ChatInterface
            currentChatId={currentChatId}
            loadedMessages={loadedMessages}
            onMessagesChange={handleMessagesChange}
          />
        );
      case "admin":
        // Redirect to separate admin page to avoid sidebar overlap
        window.location.href = "/admin";
        return null;
      default:
        return (
          <ChatInterface
            currentChatId={currentChatId}
            loadedMessages={loadedMessages}
            onMessagesChange={handleMessagesChange}
          />
        );
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 to-white relative">
      <FloatingShapes />

      {/* Sidebar - Fixed position */}
      <div className="relative z-50">
        <Sidebar
          isOpen={sidebarOpen}
          onToggle={toggleSidebar}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          onNewChat={handleNewChat}
          onLoadChat={handleLoadChat}
        />
      </div>

      {/* Main Content - Adjusted for fixed sidebar */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          sidebarOpen ? "ml-80" : "ml-16"
        }`}
      >
        {/* Trial Status Banner */}
        {user && <TrialStatusBanner />}

        {/* Mobile Header */}
        <div className="lg:hidden glass-card border-b border-gray-200/20 p-4 backdrop-blur-sm bg-white/80">
          <div className="flex items-center justify-center">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🤖 AI Agent
            </h1>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 relative">{renderCurrentPage()}</div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Admin Access Button */}
      <AdminAccessButton />
    </div>
  );
}
