"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import SettingsModal from "./SettingsModal";
import { useChatHistory } from "@/hooks/useChatHistory";
import { useUserProfileSync } from "@/hooks/useUserProfileSync";
import { isAdminClientCheck } from "@/lib/admin-client";
import { ChatHistoryService, ChatHistory } from "@/lib/chatHistory";
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
  ShieldCheckIcon,
  PencilIcon,
  CheckIcon,
  EllipsisHorizontalIcon,
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
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState<string>("");
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // User profile sync for realtime updates
  const { profile: userProfile, lastSyncTime } = useUserProfileSync();

  const {
    chatHistories,
    setChatHistories,
    currentChatId,
    isLoading,
    deleteChatHistory,
    clearAllChatHistories,
    startNewChat,
    updateChatHistory,
  } = useChatHistory();

  const menuItems = [
    {
      id: "chat",
      label: "🤖 AI Agent",
      icon: ChatBubbleLeftRightIcon,
      color: "from-blue-500 to-purple-600",
      hoverColor: "hover:from-blue-600 hover:to-purple-700",
    },
    // Admin menu - chỉ hiển thị cho admin
    ...(user && isAdminClientCheck(user)
      ? [
          {
            id: "admin",
            label: "🔧 Admin",
            icon: ShieldCheckIcon,
            color: "from-red-500 to-red-600",
            hoverColor: "hover:from-red-600 hover:to-red-700",
          },
        ]
      : []),
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

  const handleUpdateChatTitle = async (chatId: string, newTitle: string) => {
    if (!newTitle.trim()) return;

    try {
      // Find the current chat to get its messages
      const currentChat = chatHistories.find((chat) => chat.id === chatId);
      if (!currentChat) {
        console.error("Chat not found:", chatId);
        return;
      }

      // Update in Firebase first
      await ChatHistoryService.updateChatHistory(
        chatId,
        currentChat.messages,
        newTitle
      );

      // Update local state manually to preserve position
      setChatHistories((prevHistories: ChatHistory[]) =>
        prevHistories.map((chat: ChatHistory) =>
          chat.id === chatId
            ? { ...chat, title: newTitle, updatedAt: new Date() }
            : chat
        )
      );

      console.log("✅ Chat title updated successfully");
    } catch (error) {
      console.error("Error updating chat title:", error);
    }
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    return user.displayName || user.email?.split("@")[0] || "User";
  };

  return (
    <>
      {/* Backdrop overlay when sidebar is open */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: isOpen ? 0 : -240 }}
        animate={{
          x: 0,
          width: isOpen ? 320 : 64,
        }}
        transition={{
          type: "spring",
          damping: 25,
          stiffness: 200,
          duration: 0.4,
        }}
        className="fixed left-0 top-0 h-screen backdrop-blur-xl border-r flex flex-col shadow-2xl z-50"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 25%, rgba(241,245,249,0.95) 50%, rgba(226,232,240,0.95) 75%, rgba(203,213,225,0.95) 100%)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(148, 163, 184, 0.3)",
          boxShadow: "4px 0 40px rgba(148, 163, 184, 0.15)",
        }}
      >
        {/* Header */}
        <motion.div
          className="p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: "easeOut" }}
        >
          {isOpen ? (
            <div className="flex items-center justify-between">
              <motion.div
                className="flex items-center space-x-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.6, ease: "easeOut" }}
              >
                <motion.div
                  className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                    boxShadow: "0 8px 32px rgba(59, 130, 246, 0.6)",
                  }}
                  whileHover={{
                    scale: 1.05,
                    rotate: 5,
                    boxShadow: "0 12px 40px rgba(59, 130, 246, 0.8)",
                  }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <SparklesIcon className="w-7 h-7 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 rounded-2xl bg-white/30 animate-pulse" />
                </motion.div>
                <div>
                  <motion.h1
                    className="text-xl font-bold text-gray-800 drop-shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    AI Agent
                  </motion.h1>
                  <motion.p
                    className="text-sm font-medium text-gray-600 drop-shadow-sm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    Health Assistant
                  </motion.p>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                onClick={onToggle}
                className="relative p-2.5 rounded-xl transition-all duration-300 group"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(248,113,113,0.8) 0%, rgba(239,68,68,0.8) 100%)",
                  backdropFilter: "blur(15px)",
                  boxShadow: "0 4px 15px rgba(248, 113, 113, 0.3)",
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 6px 20px rgba(248, 113, 113, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                title="Thu gọn sidebar"
              >
                <XMarkIcon className="w-5 h-5 text-white transition-transform duration-300 group-hover:rotate-90 drop-shadow-lg" />
              </motion.button>
            </div>
          ) : (
            <div className="flex justify-center">
              <motion.button
                onClick={onToggle}
                className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-xl group"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)",
                  boxShadow: "0 8px 32px rgba(59, 130, 246, 0.6)",
                }}
                whileHover={{
                  scale: 1.1,
                  rotate: 5,
                  boxShadow: "0 12px 40px rgba(102, 126, 234, 0.5)",
                }}
                whileTap={{ scale: 0.95 }}
                title="Mở rộng sidebar"
                transition={{ type: "spring", stiffness: 300 }}
              >
                <SparklesIcon className="w-7 h-7 text-white drop-shadow-lg transition-transform duration-300 group-hover:scale-110" />
                <div className="absolute inset-0 rounded-2xl bg-white/20 animate-pulse" />
              </motion.button>
            </div>
          )}
        </motion.div>

        {/* New Chat Button */}
        {isOpen ? (
          <motion.div
            className="p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "backOut" }}
              whileHover={{
                scale: 1.02,
                y: -2,
                boxShadow: "0 12px 40px rgba(102, 126, 234, 0.3)",
              }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewChat}
              className="relative w-full flex items-center justify-center space-x-3 px-5 py-4 text-white rounded-full font-semibold shadow-xl overflow-hidden group"
              style={{
                background:
                  "linear-gradient(135deg, #1e40af 0%, #7c3aed 50%, #dc2626 100%)",
                boxShadow: "0 8px 32px rgba(30, 64, 175, 0.6)",
              }}
            >
              <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.3 }}
              >
                <PlusIcon className="w-6 h-6 text-white drop-shadow-lg" />
              </motion.div>
              <span className="text-white font-semibold relative z-10 drop-shadow-lg">
                ✨ Cuộc trò chuyện mới
              </span>
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            className="p-4 flex justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
          >
            <motion.button
              initial={{ opacity: 0, rotate: -90 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.4, duration: 0.6, ease: "backOut" }}
              whileHover={{
                scale: 1.1,
                rotate: 90,
                boxShadow: "0 8px 25px rgba(102, 126, 234, 0.4)",
              }}
              whileTap={{ scale: 0.95 }}
              onClick={handleNewChat}
              className="relative w-12 h-12 flex items-center justify-center text-white rounded-full shadow-xl group overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                boxShadow: "0 6px 25px rgba(102, 126, 234, 0.3)",
              }}
              title="Cuộc trò chuyện mới"
            >
              <PlusIcon className="w-6 h-6 text-white drop-shadow-lg transition-transform duration-300 group-hover:rotate-180" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse" />
            </motion.button>
          </motion.div>
        )}

        {/* Navigation Menu */}
        <motion.nav
          className="px-4 pb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
        >
          <div
            className={`space-y-2 ${
              !isOpen ? "flex flex-col items-center" : ""
            }`}
          >
            {menuItems.map((item, index) => (
              <motion.button
                key={item.id}
                data-testid={
                  item.id === "admin" ? "admin-button" : `menu-${item.id}`
                }
                initial={{ opacity: 0, x: -30, scale: 0.8 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{
                  delay: 0.6 + index * 0.15,
                  duration: 0.6,
                  ease: "backOut",
                }}
                whileHover={{
                  scale: 1.03,
                  y: -2,
                  boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (item.id === "admin") {
                    window.location.href = "/admin";
                  } else {
                    onPageChange(item.id);
                  }
                }}
                className={`
                  relative flex items-center overflow-hidden transition-all duration-300 font-semibold group
                  backdrop-blur-lg border rounded-full
                  ${
                    isOpen
                      ? "w-full space-x-3 px-4 py-3"
                      : "w-12 h-12 justify-center"
                  }
                  ${
                    currentPage === item.id
                      ? `bg-gradient-to-r ${item.color} text-white shadow-xl border-blue-400/50`
                      : "bg-white/40 text-gray-700 hover:bg-white/60 hover:text-gray-900 shadow-lg border-gray-300/40"
                  }
                `}
                title={!isOpen ? item.label : undefined}
              >
                {/* Shiny overlay effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.3 }}
                  className="relative z-10"
                >
                  <item.icon
                    className={`${isOpen ? "w-5 h-5" : "w-6 h-6"} ${
                      currentPage === item.id
                        ? "text-white drop-shadow-lg"
                        : "text-gray-600 group-hover:text-gray-800"
                    } flex-shrink-0 transition-colors duration-300`}
                  />
                </motion.div>

                {isOpen && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`text-sm font-semibold relative z-10 ${
                      currentPage === item.id
                        ? "text-white drop-shadow-sm"
                        : "text-gray-700 group-hover:text-gray-900"
                    } transition-colors duration-300`}
                  >
                    {item.label}
                  </motion.span>
                )}

                {/* Active indicator */}
                {currentPage === item.id && (
                  <motion.div
                    layoutId="activeMenuItem"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400/20 to-purple-600/20 border-2 border-blue-400/50"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.nav>

        {/* Chat History - Full Height with Scroll */}
        {isOpen && (
          <motion.div
            className="flex-1 px-4 pb-2 flex flex-col min-h-0"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.7, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between mb-3 px-2">
              <h3 className="text-sm font-bold text-gray-800 flex items-center drop-shadow-sm">
                � Lịch sử trò chuyện
              </h3>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowDeleteConfirm("all")}
                className="p-1.5 rounded-xl text-gray-600 hover:text-red-500 hover:bg-red-100/50 transition-all duration-300 backdrop-blur-sm"
                title="Xóa tất cả"
              >
                <TrashIcon className="w-4 h-4" />
              </motion.button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar overflow-x-visible">
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 py-2 text-sm text-gray-700 flex items-center backdrop-blur-lg bg-white/40 rounded-xl border border-gray-300/40"
                >
                  <ClockIcon className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </motion.div>
              ) : chatHistories.length > 0 ? (
                chatHistories.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    data-chat-id={chat.id}
                    initial={{ opacity: 0, x: -20, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ delay: 1.4 + index * 0.02 }}
                    whileHover={{
                      scale: 1.02,
                      y: -2,
                      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                    }}
                    className={`group relative overflow-visible rounded-xl backdrop-blur-lg border transition-all duration-300 ${
                      currentChatId === chat.id
                        ? "bg-gradient-to-r from-blue-500/40 to-purple-600/40 border-blue-400/60 shadow-xl"
                        : "bg-white/40 hover:bg-white/60 shadow-lg border-gray-300/40"
                    } ${openMenuId === chat.id ? "z-[50]" : "z-10"}`}
                  >
                    {/* Shiny overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                    <div
                      className="relative w-full text-left px-3 py-2.5 cursor-pointer"
                      onClick={() => handleLoadChat(chat.id)}
                    >
                      <div className="flex items-center justify-between">
                        {editingChatId === chat.id ? (
                          <div className="flex-1 flex items-center space-x-2">
                            <input
                              type="text"
                              value={editingTitle}
                              onChange={(e) => setEditingTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleUpdateChatTitle(chat.id, editingTitle);
                                  setEditingChatId(null);
                                } else if (e.key === "Escape") {
                                  setEditingChatId(null);
                                }
                              }}
                              className="flex-1 bg-white/60 border border-gray-300/60 rounded-lg px-2 py-1 text-sm font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                              autoFocus
                              onClick={(e) => e.stopPropagation()}
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleUpdateChatTitle(chat.id, editingTitle);
                                setEditingChatId(null);
                              }}
                              className="p-1 text-green-600 hover:text-green-700 transition-colors"
                            >
                              <CheckIcon className="w-3.5 h-3.5" />
                            </motion.button>
                          </div>
                        ) : (
                          <>
                            <span
                              className={`truncate font-semibold text-sm drop-shadow-sm ${
                                currentChatId === chat.id
                                  ? "text-white"
                                  : "text-gray-800"
                              }`}
                            >
                              {chat.title}
                            </span>
                            <div className="relative z-10">
                              <motion.button
                                initial={{ opacity: 1, scale: 1 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(
                                    openMenuId === chat.id ? null : chat.id
                                  );
                                }}
                                className={`p-1.5 transition-all duration-300 cursor-pointer rounded-lg hover:bg-white/30 ${
                                  currentChatId === chat.id
                                    ? "text-white/80 hover:text-white"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                                title="Tùy chọn"
                              >
                                <EllipsisHorizontalIcon className="w-4 h-4" />
                              </motion.button>

                              {/* Dropdown Menu */}
                              {openMenuId === chat.id && (
                                <>
                                  {/* Backdrop */}
                                  <div
                                    className="fixed inset-0 z-[100]"
                                    onClick={() => setOpenMenuId(null)}
                                  />
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      scale: 0.95,
                                      y: -10,
                                    }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute right-0 top-full mt-1 z-[110] w-36 bg-white/95 backdrop-blur-lg border border-gray-200/60 rounded-xl shadow-2xl py-1.5 overflow-hidden"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <motion.button
                                      whileHover={{
                                        backgroundColor:
                                          "rgba(59, 130, 246, 0.1)",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingChatId(chat.id);
                                        setEditingTitle(chat.title);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors"
                                    >
                                      <PencilIcon className="w-4 h-4" />
                                      <span>Đổi tên</span>
                                    </motion.button>
                                    <motion.button
                                      whileHover={{
                                        backgroundColor:
                                          "rgba(239, 68, 68, 0.1)",
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setShowDeleteConfirm(chat.id);
                                        setOpenMenuId(null);
                                      }}
                                      className="w-full flex items-center space-x-2 px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors"
                                    >
                                      <TrashIcon className="w-4 h-4" />
                                      <span>Xóa</span>
                                    </motion.button>
                                  </motion.div>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                      <div
                        className={`text-xs mt-1 font-medium ${
                          currentChatId === chat.id
                            ? "text-gray-200"
                            : "text-gray-600"
                        }`}
                      >
                        {new Date(chat.updatedAt).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-gray-400/20 to-gray-600/20 flex items-center justify-center backdrop-blur-lg border border-gray-300/20">
                    <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    🌟 Chưa có cuộc trò chuyện nào
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Bắt đầu trò chuyện đầu tiên của bạn!
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}

        {/* Bottom Navigation - 3 Icons */}
        <motion.div
          className="p-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.7, ease: "easeOut" }}
        >
          {isOpen ? (
            <div className="space-y-3">
              {/* User Profile Row */}
              <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.2, duration: 0.6, ease: "backOut" }}
                className="relative flex items-center space-x-3 p-3 rounded-2xl backdrop-blur-lg bg-white/40 border border-gray-300/40 shadow-xl overflow-hidden group"
              >
                {/* Shiny overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                <motion.div
                  className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #1d4ed8 50%, #7c3aed 100%)",
                    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.4)",
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <UserCircleIcon className="w-7 h-7 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                </motion.div>

                <div className="flex-1 min-w-0 relative z-10">
                  <motion.p
                    className="text-sm font-bold text-gray-800 truncate drop-shadow-sm"
                    data-testid="sidebar-user-name"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3, duration: 0.5, ease: "easeOut" }}
                  >
                    {userProfile.name || getUserDisplayName()}
                  </motion.p>
                  <motion.p
                    className="text-xs text-gray-600 truncate font-medium"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.4, duration: 0.5, ease: "easeOut" }}
                  >
                    {user?.email}
                  </motion.p>
                  {userProfile.age &&
                    userProfile.height &&
                    userProfile.weight && (
                      <motion.p
                        className="text-xs text-gray-500 truncate font-medium"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 1.5,
                          duration: 0.5,
                          ease: "easeOut",
                        }}
                      >
                        {userProfile.age}t • {userProfile.height}cm •{" "}
                        {userProfile.weight}kg
                      </motion.p>
                    )}
                </div>
              </motion.div>

              {/* Settings & Logout Row */}
              <div className="flex space-x-2">
                <motion.button
                  initial={{ opacity: 0, x: -30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 1.6, duration: 0.6, ease: "backOut" }}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 8px 25px rgba(59, 130, 246, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsSettingsOpen(true)}
                  data-testid="settings-button"
                  className="relative flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-full font-semibold transition-all duration-300 overflow-hidden group backdrop-blur-lg border border-blue-400/50 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(29, 78, 216, 0.8) 0%, rgba(124, 58, 237, 0.8) 100%)",
                    boxShadow: "0 4px 20px rgba(29, 78, 216, 0.4)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Cog6ToothIcon className="w-4 h-4 text-white drop-shadow-sm relative z-10" />
                  <span className="text-sm text-white font-semibold relative z-10 drop-shadow-sm">
                    Cài đặt
                  </span>
                </motion.button>

                <motion.button
                  initial={{ opacity: 0, x: -30, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  transition={{ delay: 1.7, duration: 0.6, ease: "backOut" }}
                  whileHover={{
                    scale: 1.02,
                    y: -2,
                    boxShadow: "0 8px 25px rgba(220, 38, 38, 0.6)",
                  }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSignOut}
                  data-testid="logout-button"
                  className="relative flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-full font-semibold transition-all duration-300 overflow-hidden group backdrop-blur-lg border border-red-500/50 shadow-lg"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(220, 38, 38, 0.8) 0%, rgba(185, 28, 28, 0.8) 100%)",
                    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <ArrowRightOnRectangleIcon className="w-4 h-4 text-white drop-shadow-sm relative z-10" />
                  <span className="text-sm text-white font-semibold relative z-10 drop-shadow-sm">
                    Thoát
                  </span>
                </motion.button>
              </div>
            </div>
          ) : (
            <motion.div
              className="flex flex-col space-y-3"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.2, duration: 0.6, ease: "backOut" }}
            >
              {/* User Profile Icon */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ delay: 1.3, duration: 0.7, ease: "backOut" }}
                  className="relative w-12 h-12 rounded-full flex items-center justify-center shadow-lg overflow-hidden"
                  style={{
                    background:
                      "linear-gradient(135deg, #059669 0%, #1d4ed8 50%, #7c3aed 100%)",
                    boxShadow: "0 4px 20px rgba(5, 150, 105, 0.4)",
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  title={getUserDisplayName()}
                >
                  <UserCircleIcon className="w-7 h-7 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/30 animate-pulse rounded-full" />
                </motion.div>
              </div>

              {/* Settings Icon */}
              <div className="flex justify-center">
                <motion.button
                  initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.7, ease: "backOut" }}
                  whileHover={{
                    scale: 1.1,
                    rotate: 5,
                    boxShadow: "0 8px 25px rgba(29, 78, 216, 0.6)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="relative w-12 h-12 flex items-center justify-center rounded-full shadow-xl group"
                  style={{
                    background:
                      "linear-gradient(135deg, #1d4ed8 0%, #7c3aed 100%)",
                    boxShadow: "0 4px 20px rgba(29, 78, 216, 0.4)",
                  }}
                  title="Cài đặt"
                  data-testid="settings-button"
                  onClick={() => setIsSettingsOpen(true)}
                >
                  <Cog6ToothIcon className="w-6 h-6 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
                </motion.button>
              </div>

              {/* Logout Icon */}
              <div className="flex justify-center">
                <motion.button
                  initial={{ opacity: 0, rotate: -180, scale: 0.5 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ delay: 1.7, duration: 0.7, ease: "backOut" }}
                  whileHover={{
                    scale: 1.1,
                    rotate: -5,
                    boxShadow: "0 8px 25px rgba(220, 38, 38, 0.6)",
                  }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSignOut}
                  data-testid="logout-button"
                  className="relative w-12 h-12 flex items-center justify-center rounded-full shadow-xl group"
                  style={{
                    background:
                      "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                    boxShadow: "0 4px 20px rgba(220, 38, 38, 0.4)",
                  }}
                  title="Đăng xuất"
                >
                  <ArrowRightOnRectangleIcon className="w-6 h-6 text-white drop-shadow-lg" />
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </motion.div>
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
