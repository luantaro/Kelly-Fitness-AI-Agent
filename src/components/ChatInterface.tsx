"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  HeartIcon,
  FireIcon,
  LightBulbIcon,
} from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PDFExporter from "./PDFExporter";
import { useChatHistory } from "@/hooks/useChatHistory";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onMenuClick?: () => void;
  currentChatId?: string | null;
  loadedMessages?: Message[];
  onMessagesChange?: (messages: Message[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  currentChatId,
  loadedMessages,
  onMessagesChange,
}) => {
  const chatHistory = useChatHistory();
  const {
    saveChatWhenNeeded = () => {},
    updateCurrentChat = () => {},
    sessionId,
  } = chatHistory || {};

  const defaultMessage: Message = {
    id: "1",
    text: "👋 **Xin chào! Tôi là AI Agent** - trợ lý thông minh chuyên về sức khỏe và dinh dưỡng! 🤖✨\n\n🎯 **Tôi có thể giúp bạn:**\n\n🥗 **Tư vấn dinh dưỡng chuyên nghiệp**\n- Lập thực đơn cá nhân hóa 7 ngày\n- Tính toán macro và calories chính xác\n- Tư vấn chế độ ăn theo mục tiêu\n\n📊 **Phân tích thể trạng thông minh**\n- Tính BMR/TDEE tự động\n- Đưa ra lời khuyên dựa trên thông tin cá nhân\n- Theo dõi tiến độ phát triển\n\n💡 **Tư vấn lối sống lành mạnh**\n- Hướng dẫn thói quen ăn uống khoa học\n- Gợi ý thực phẩm và bổ sung dinh dưỡng\n- Random topics dinh dưỡng thú vị\n\n🎭 **6 cá tính AI đa dạng**\n- Thân thiện, Nhiệt tình, Chuyên nghiệp\n- Truyền cảm hứng, Nhẹ nhàng, Khoa học\n\n📱 **Tính năng tiện ích**\n- Xuất thực đơn PDF chuyên nghiệp\n- Lưu lịch sử trò chuyện tự động\n- Giao diện thân thiện, dễ sử dụng\n\n---\n\n🚀 **Bắt đầu ngay:** Vào **⚙️ Cài đặt** để cập nhật thông tin cá nhân, chọn cá tính AI yêu thích, sau đó click vào gợi ý bên dưới để nhận tư vấn tức thì!\n\n💫 **Tôi đã nhớ tất cả thông tin của bạn** - không cần nhập lại!",
    isUser: false,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([defaultMessage]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load messages khi có cuộc trò chuyện được chọn
  useEffect(() => {
    if (loadedMessages && loadedMessages.length > 0) {
      setMessages(loadedMessages);
    } else if (currentChatId === null) {
      setMessages([defaultMessage]);
    }
  }, [loadedMessages, currentChatId]);

  // Thông báo cho parent component khi messages thay đổi
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages);
    }
  }, [messages, onMessagesChange]);

  // Auto-save/update chat history theo logic ChatGPT với debounce
  useEffect(() => {
    // Safety checks để tránh lỗi
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return;
    }

    // Chỉ xử lý khi:
    // 1. Có ít nhất 2 tin nhắn (1 user + 1 bot)
    // 2. Tin nhắn cuối không phải là default message
    // 3. Tin nhắn cuối không phải từ user (đợi bot reply xong mới save)
    const lastMessage = messages[messages.length - 1];
    const shouldProcess =
      messages.length >= 2 &&
      lastMessage?.id !== defaultMessage.id &&
      !lastMessage?.isUser; // Chỉ save sau khi bot reply xong

    if (shouldProcess) {
      // Debounce để tránh Firebase write stream exhausted
      const timeoutId = setTimeout(() => {
        console.log("💾 Processing chat save/update...", {
          messagesCount: messages.length,
          currentChatId,
          sessionId,
        });

        try {
          if (currentChatId) {
            // Cập nhật cuộc trò chuyện hiện có
            console.log("🔄 Updating existing chat");
            updateCurrentChat(messages);
          } else {
            // Lưu cuộc trò chuyện mới
            console.log("✨ Saving new chat");
            saveChatWhenNeeded(messages);
          }
        } catch (error) {
          console.error("❌ Error in chat processing:", error);
        }
      }, 2000); // Delay 2 giây để tránh ghi quá thường xuyên

      return () => clearTimeout(timeoutId); // Cleanup timeout
    }
  }, [
    messages,
    currentChatId,
    sessionId,
    saveChatWhenNeeded,
    updateCurrentChat,
  ]);

  // Listen for personality changes and add AI notification message
  useEffect(() => {
    const handlePersonalityChange = (event: CustomEvent) => {
      const { personalityName, personalityMessage } = event.detail;

      if (personalityMessage) {
        const notificationMessage: Message = {
          id: Date.now().toString(),
          text: personalityMessage,
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, notificationMessage]);

        // Auto scroll to bottom
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    };

    // Add event listener
    window.addEventListener(
      "fitchat-personality-changed",
      handlePersonalityChange as EventListener
    );

    // Cleanup
    return () => {
      window.removeEventListener(
        "fitchat-personality-changed",
        handlePersonalityChange as EventListener
      );
    };
  }, []);

  // Hàm kiểm tra xem tin nhắn có phải là thực đơn dinh dưỡng cần PDF không
  const shouldShowPDFExport = (message: Message): boolean => {
    if (message.isUser) return false; // Không hiển thị cho tin nhắn của user

    const text = message.text.toLowerCase();

    // 1. KIỂM TRA CẤU TRÚC THỰC ĐƠN CHI TIẾT
    // Phải có ít nhất 3 bữa ăn được đề cập
    const mealCount = (text.match(/bữa (sáng|trưa|tối|phụ)/g) || []).length;

    // Hoặc có cấu trúc ngày/tuần
    const dayStructure = (text.match(/(ngày \d|thứ \d|chủ nhật)/g) || [])
      .length;

    // 2. KIỂM TRA DINH LƯỢNG CHI TIẾT
    // Phải có định lượng cụ thể (gram, ml, cái, bát...)
    const portionCount = (
      text.match(/\d+\s*(g|gram|ml|cái|bát|lát|quả|con|thìa|muỗng)/g) || []
    ).length;

    // 3. KIỂM TRA MACRO NUTRITION
    // Phải có thông tin macro (protein, carb, fat, calories)
    const macroCount = (text.match(/(protein|carb|fat|calo|kcal)/g) || [])
      .length;

    // 4. KIỂM TRA TỪ KHÓA THỰC ĐƠN CHÍNH THỨC
    const menuKeywords = ["thực đơn", "lịch ăn", "chế độ ăn", "menu"];
    const hasMenuTitle = menuKeywords.some((keyword) => text.includes(keyword));

    // 5. KIỂM TRA ĐỘ DÀI THỰC ĐƠN (phải đủ chi tiết)
    const isDetailedContent = message.text.length > 1000;

    // 6. LOẠI TRỪ CÁC CONTENT KHÔNG PHẢI THỰC ĐƠN
    const excludeKeywords = [
      "random nutrition topic",
      "vitamin d",
      "omega-3",
      "hydration",
      "anti-inflammatory",
      "superfoods",
      "collagen",
      "detox",
      "brain foods",
      "gut-brain",
      "prebiotics",
      "probiotics",
      "intermittent fasting",
    ];
    const isExcluded = excludeKeywords.some((keyword) =>
      text.includes(keyword)
    );

    // CHỈ HIỂN THỊ PDF KHI:
    // - Có cấu trúc thực đơn rõ ràng (nhiều bữa ăn HOẶC nhiều ngày)
    // - Có định lượng chi tiết (ít nhất 5 định lượng)
    // - Có thông tin macro (ít nhất 3 lần xuất hiện)
    // - Có tiêu đề thực đơn chính thức
    // - Nội dung đủ dài và chi tiết
    // - KHÔNG PHẢI là bài viết giáo dục/random topic

    return (
      (mealCount >= 3 || dayStructure >= 3) &&
      portionCount >= 5 &&
      macroCount >= 3 &&
      hasMenuTitle &&
      isDetailedContent &&
      !isExcluded
    );
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text: string, specialRequest?: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Lấy user profile từ localStorage để gửi kèm
      let userProfile = null;
      try {
        const saved = localStorage.getItem("fitchat_user_profile");
        userProfile = saved ? JSON.parse(saved) : null;
      } catch (error) {
        console.warn("Could not load user profile:", error);
      }

      // Chuẩn bị conversation history (loại bỏ default message)
      const conversationHistory = messages
        .filter((msg) => msg.id !== defaultMessage.id) // Loại bỏ default message
        .map((msg) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.text,
        }));

      console.log("📤 Sending conversation history:", {
        totalMessages: messages.length,
        filteredHistory: conversationHistory.length,
        conversationHistory: conversationHistory.slice(-3), // Log 3 tin nhắn cuối
      });

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          context: "general",
          specialRequest,
          userProfile, // Gửi kèm thông tin user
          conversationHistory, // Gửi kèm lịch sử cuộc trò chuyện đã lọc
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message || "Xin lỗi, tôi không thể phản hồi ngay lúc này.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "❌ Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.",
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(inputText);
  };

  const quickActions = [
    {
      icon: FireIcon,
      text: "🍽️ Tạo thực đơn 1 tuần theo mục tiêu của bạn",
      color: "from-green-500 to-emerald-600",
      specialRequest: "weekly-diet-plan",
    },
    {
      icon: HeartIcon,
      text: "� Let's roll",
      color: "from-orange-500 to-red-500",
      specialRequest: "lets-roll",
    },
    {
      icon: LightBulbIcon,
      text: "🧘‍♀️ Tư vấn lối sống lành mạnh",
      color: "from-purple-500 to-pink-500",
      specialRequest: "lifestyle-advice",
    },
    {
      icon: SparklesIcon,
      text: "📊 Phân tích thể trạng của tôi",
      color: "from-blue-500 to-cyan-500",
      specialRequest: "body-analysis",
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-6 space-y-4">
        <div className="max-w-4xl mx-auto px-4">
          <AnimatePresence>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`flex ${
                  message.isUser ? "justify-end" : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-[80%] px-6 py-4 rounded-2xl shadow-sm border ${
                    message.isUser
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white border-blue-400/20"
                      : "bg-white text-gray-800 border-gray-200/50"
                  }`}
                >
                  <div className="text-sm leading-relaxed">
                    {message.isUser ? (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          // Custom styling for specific elements
                          h1: ({ children }) => (
                            <h1 className="text-lg font-bold text-gray-900 mb-3 mt-4 first:mt-0">
                              {children}
                            </h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-base font-semibold text-gray-800 mb-2 mt-3 first:mt-0">
                              {children}
                            </h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-sm font-medium text-gray-800 mb-2 mt-2 first:mt-0">
                              {children}
                            </h3>
                          ),
                          p: ({ children }) => (
                            <p className="text-gray-700 leading-relaxed my-2 first:mt-0 last:mb-0">
                              {children}
                            </p>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-semibold text-gray-900">
                              {children}
                            </strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-700">{children}</em>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc pl-5 my-2 space-y-1">
                              {children}
                            </ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal pl-5 my-2 space-y-1">
                              {children}
                            </ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-gray-700">{children}</li>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-blue-400 pl-4 my-3 text-gray-600 italic bg-blue-50 py-2 rounded-r">
                              {children}
                            </blockquote>
                          ),
                          code: ({ children, className }) => {
                            const isInline = !className;
                            return isInline ? (
                              <code className="text-purple-600 bg-purple-50 px-1 py-0.5 rounded text-xs font-mono">
                                {children}
                              </code>
                            ) : (
                              <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto my-3">
                                <code>{children}</code>
                              </pre>
                            );
                          },
                          pre: ({ children }) => (
                            <pre className="bg-gray-100 text-gray-800 p-3 rounded-lg text-xs font-mono overflow-x-auto my-3">
                              {children}
                            </pre>
                          ),
                          hr: () => <hr className="border-gray-300 my-4" />,
                          table: ({ children }) => (
                            <div className="overflow-x-auto my-3">
                              <table className="min-w-full border border-gray-300 rounded-lg">
                                {children}
                              </table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-gray-50">{children}</thead>
                          ),
                          tbody: ({ children }) => (
                            <tbody className="divide-y divide-gray-200">
                              {children}
                            </tbody>
                          ),
                          tr: ({ children }) => (
                            <tr className="border-b border-gray-200">
                              {children}
                            </tr>
                          ),
                          th: ({ children }) => (
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300 last:border-r-0">
                              {children}
                            </th>
                          ),
                          td: ({ children }) => (
                            <td className="px-3 py-2 text-xs text-gray-600 border-r border-gray-200 last:border-r-0">
                              {children}
                            </td>
                          ),
                        }}
                      >
                        {message.text}
                      </ReactMarkdown>
                    )}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      message.isUser ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>

                  {!message.isUser && shouldShowPDFExport(message) && (
                    <div className="mt-3 pt-3 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <span className="text-xs text-green-700 font-medium">
                          🥗 Thực đơn dinh dưỡng này có thể được tải xuống dưới
                          dạng PDF
                        </span>
                      </div>
                      <PDFExporter nutritionContent={message.text} />
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start mb-4"
            >
              <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-200/50">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.1s]"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  </div>
                  <span className="text-sm text-gray-500">
                    Agent đang trả lời...
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 1 && (
        <div className="pb-4">
          <div className="max-w-4xl mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  onClick={() =>
                    sendMessage(action.text, action.specialRequest)
                  }
                  className={`p-4 rounded-xl bg-gradient-to-r ${action.color} text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 border border-white/20`}
                >
                  <div className="flex items-center space-x-3">
                    <action.icon className="w-6 h-6 flex-shrink-0" />
                    <span className="text-sm font-medium text-left">
                      {action.text}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="border-t border-gray-200/50 bg-white/80 backdrop-blur-sm p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="💬 Nhập tin nhắn của bạn..."
              className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:bg-white transition-all duration-200 text-gray-800 placeholder-gray-500"
              disabled={isTyping}
            />
            <motion.button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="absolute right-2 p-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 border border-blue-400/20"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
