"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion } from "framer-motion";
import { useState } from "react";
import SettingsModal from "./SettingsModal";
import { useChatHistory } from "@/hooks/useChatHistory";
import {
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  SparklesIcon,
  PlusIcon,
  TrashIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage: string;
  onPageChange: (page: string) => void;
  onNewChat?: () => void;
  onLoadChat?: (chatId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onToggle,
  currentPage,
  onPageChange,
  onNewChat,
  onLoadChat,
}) => {
  const [user] = useAuthState(auth);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );

  const {
    chatHistories,
    currentChatId,
    isLoading,
    deleteChatHistory,
    clearAllChatHistories,
    startNewChat,
  } = useChatHistory();

  const menuItems = [
    {
      id: "chat",
      label: "🤖 AI Agent",
      icon: ChatBubbleLeftRightIcon,
      color: "from-blue-500 to-purple-600",
      hoverColor: "hover:from-blue-600 hover:to-purple-700",
    },
    {
      id: "payment",
      label: "💎 Pricing",
      icon: CreditCardIcon,
      color: "from-purple-500 to-purple-600",
      hoverColor: "hover:from-purple-600 hover:to-purple-700",
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleNewChat = () => {
    console.log("🆕 Sidebar handleNewChat clicked");
    startNewChat();
    console.log("✅ Called startNewChat()");
    if (onNewChat) {
      console.log("✅ Calling onNewChat prop");
      onNewChat();
    } else {
      console.log("❌ onNewChat prop not available");
    }
  };

  const handleLoadChat = (chatId: string) => {
    if (onLoadChat) {
      onLoadChat(chatId);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    await deleteChatHistory(chatId);
    setShowDeleteConfirm(null);
  };

  const handleClearAllChats = async () => {
    await clearAllChatHistories();
    setShowDeleteConfirm(null);
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    if (user.isAnonymous) return "Khách";
    return user.displayName || user.email?.split("@")[0] || "User";
  };

  return (
    <>
      {/* Sidebar */}
      <motion.div
        initial={false}
        className={`fixed left-0 top-0 h-screen ${
          isOpen ? "w-80" : "w-16"
        } glass-card border-r border-gray-200/20 flex flex-col backdrop-blur-xl transition-all duration-300 z-50`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200/20">
          {isOpen ? (
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/20">
                  <SparklesIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    ✨ AI Agent
                  </h1>
                  <p className="text-sm text-gray-600 font-medium">
                    🏃‍♀️ Your Health Assistant
                  </p>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onToggle}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-700"
                title="Thu gọn sidebar"
              >
                <XMarkIcon className="w-5 h-5" />
              </motion.button>
            </div>
          ) : (
            <div className="flex justify-center">
              <motion.button
                onClick={onToggle}
                className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg border border-blue-400/20 hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
                title="Mở rộng sidebar"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          )}
        </div>

        {/* New Chat Button */}
        {isOpen ? (
          <div className="p-4">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 border border-blue-400/20"
            >
              <PlusIcon className="w-5 h-5 text-white" />
              <span className="text-white font-medium">
                ✨ Cuộc trò chuyện mới
              </span>
            </motion.button>
          </div>
        ) : (
          <div className="p-2 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="w-10 h-10 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
              title="Cuộc trò chuyện mới"
            >
              <PlusIcon className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 pb-4">
          <div className="space-y-2">
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center ${
                  isOpen ? "space-x-3 px-4 py-3" : "justify-center px-2 py-3"
                } rounded-xl transition-all duration-300 font-medium ${
                  currentPage === item.id
                    ? `bg-gradient-to-r ${item.color} text-white shadow-lg border border-white/20 ${item.hoverColor}`
                    : "text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 hover:shadow-md border border-transparent hover:border-gray-200/50"
                }`}
                title={!isOpen ? item.label : undefined}
              >
                <item.icon
                  className={`${isOpen ? "w-5 h-5" : "w-6 h-6"} ${
                    currentPage === item.id ? "text-white" : "text-gray-600"
                  } flex-shrink-0`}
                />
                {isOpen && <span className="font-medium">{item.label}</span>}

                {isOpen && currentPage === item.id && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="ml-auto w-2 h-2 bg-white rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 30,
                    }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Chat History */}
          {isOpen && (
            <div className="mt-8">
              <div className="flex items-center justify-between px-4 mb-3">
                <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                  📚 Lịch sử trò chuyện
                </h3>
                {chatHistories.length > 0 && (
                  <button
                    onClick={() => setShowDeleteConfirm("all")}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Xóa tất cả lịch sử"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {isLoading ? (
                  <div className="px-4 py-2 text-sm text-gray-500 flex items-center">
                    <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                    Đang tải...
                  </div>
                ) : chatHistories.length === 0 ? (
                  <div className="px-4 py-2 text-sm text-gray-500">
                    📝 Chưa có cuộc trò chuyện nào
                  </div>
                ) : (
                  chatHistories.map((chat, index) => (
                    <motion.div
                      key={chat.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.1 }}
                      className={`group relative ${
                        currentChatId === chat.id
                          ? "bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200"
                          : "border-transparent"
                      } border rounded-lg`}
                    >
                      <div
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:text-gray-900 rounded-lg transition-all duration-200 cursor-pointer"
                        onClick={() => handleLoadChat(chat.id)}
                      >
                        <div className="flex items-center justify-between">
                          <span className="truncate">{chat.title}</span>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDeleteConfirm(chat.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all duration-200 cursor-pointer"
                            title="Xóa cuộc trò chuyện"
                          >
                            <TrashIcon className="w-3 h-3" />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(chat.updatedAt).toLocaleDateString("vi-VN")}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
          )}
        </nav>

        {/* User Profile Section */}
        <div className="border-t border-gray-200/20 p-2">
          {isOpen ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="flex items-center space-x-3 mb-4 px-2"
              >
                <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                  <UserCircleIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    👋 {getUserDisplayName()}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {user?.isAnonymous
                      ? "🎭 Tài khoản khách"
                      : `📧 ${user?.email}`}
                  </p>
                </div>
              </motion.div>

              <div className="space-y-2">
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  onClick={() => setIsSettingsOpen(true)}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 hover:text-gray-900 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200/50"
                >
                  <Cog6ToothIcon className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium">Cài đặt</span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  onClick={handleSignOut}
                  className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 hover:text-red-700 rounded-lg transition-all duration-200 border border-transparent hover:border-red-200/50 font-medium"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-red-600" />
                  <span className="text-sm">🚪 Đăng xuất</span>
                </motion.button>
              </div>
            </>
          ) : (
            <div className="flex flex-col space-y-2">
              <motion.button
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200"
                title="Cài đặt"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSettingsOpen(true)}
              >
                <Cog6ToothIcon className="w-5 h-5" />
              </motion.button>

              <motion.button
                onClick={handleSignOut}
                className="w-10 h-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                title="Đăng xuất"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl border border-gray-200/50"
          >
            <div className="flex items-center mb-4">
              <TrashIcon className="w-6 h-6 text-red-500 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">
                {showDeleteConfirm === "all"
                  ? "Xóa tất cả lịch sử?"
                  : "Xóa cuộc trò chuyện?"}
              </h3>
            </div>
            <p className="text-gray-600 mb-6">
              {showDeleteConfirm === "all"
                ? "Tất cả lịch sử trò chuyện sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này."
                : "Cuộc trò chuyện này sẽ bị xóa vĩnh viễn. Bạn không thể hoàn tác thao tác này."}
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={() =>
                  showDeleteConfirm === "all"
                    ? handleClearAllChats()
                    : handleDeleteChat(showDeleteConfirm)
                }
                className="flex-1 px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
              >
                Xóa
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
