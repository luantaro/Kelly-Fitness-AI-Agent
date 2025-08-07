"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import {
  XMarkIcon,
  UserIcon,
  SparklesIcon,
  ScaleIcon,
  CalendarIcon,
  IdentificationIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
}

interface AIPersonality {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    activityLevel: "moderate",
    goal: "general_health",
  });

  const [selectedPersonality, setSelectedPersonality] =
    useState<string>("friendly");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [personalityChangeMessage, setPersonalityChangeMessage] =
    useState<string>("");
  const {
    isAuthenticated,
    isSyncing,
    syncError,
    lastSyncTime,
    syncProfileToFirestore,
  } = useFirestoreSync();

  const aiPersonalities: AIPersonality[] = [
    {
      id: "friendly",
      name: "Thân thiện",
      description: "Ấm áp, gần gũi và dễ tiếp cận",
      emoji: "😊",
    },
    {
      id: "enthusiastic",
      name: "Nhiệt tình",
      description: "Tràn đầy năng lượng và động lực",
      emoji: "🔥",
    },
    {
      id: "professional",
      name: "Chuyên nghiệp",
      description: "Nghiêm túc, tập trung vào kết quả",
      emoji: "💼",
    },
    {
      id: "motivational",
      name: "Truyền cảm hứng",
      description: "Luôn khuyến khích và động viên",
      emoji: "💪",
    },
    {
      id: "gentle",
      name: "Nhẹ nhàng",
      description: "Kiên nhẫn, thấu hiểu và hỗ trợ",
      emoji: "🌸",
    },
    {
      id: "scientific",
      name: "Khoa học",
      description: "Tập trung vào dữ liệu và nghiên cứu",
      emoji: "🧬",
    },
  ];

  // Load saved settings from localStorage
  useEffect(() => {
    const savedProfile = localStorage.getItem("fitchat_user_profile");
    const savedPersonality = localStorage.getItem("fitchat_ai_personality");

    if (savedProfile) {
      try {
        setUserProfile(JSON.parse(savedProfile));
      } catch (error) {
        console.error("Error loading user profile:", error);
      }
    }

    if (savedPersonality) {
      setSelectedPersonality(savedPersonality);
    }
  }, []);

  const handleSave = async () => {
    // Get previous personality to check if it changed
    const prevPersonality = localStorage.getItem("fitchat_ai_personality");

    // Save to localStorage first
    localStorage.setItem("fitchat_user_profile", JSON.stringify(userProfile));
    localStorage.setItem("fitchat_ai_personality", selectedPersonality);

    // Check if personality changed and show appropriate message
    if (prevPersonality && prevPersonality !== selectedPersonality) {
      const personalityNames: { [key: string]: string } = {
        friendly: "Thân thiện 😊",
        enthusiastic: "Nhiệt tình 🔥",
        professional: "Chuyên nghiệp 💼",
        motivational: "Truyền cảm hứng 💪",
        gentle: "Nhẹ nhàng 🌸",
        scientific: "Khoa học 🧬",
      };

      const newPersonalityName =
        personalityNames[selectedPersonality] || "Thân thiện 😊";

      const modalMessage = `Đã thay đổi cá tính AI thành "${newPersonalityName}" thành công!`;
      setPersonalityChangeMessage(modalMessage);

      // Create AI notification message for chat
      const aiNotificationMessage = `🎭 **Chào bạn! Tôi vừa cập nhật cá tính mới!**

✨ **Thay đổi thành công:** Tôi đã chuyển sang phong cách **${newPersonalityName}**

🎯 **Điều này có nghĩa là:**
- Tôi sẽ tư vấn dinh dưỡng theo phong cách ${newPersonalityName.toLowerCase()}
- Cách giao tiếp và phản hồi sẽ phù hợp với cá tính mới
- Trải nghiệm tư vấn sẽ được cá nhân hóa hơn cho bạn

🚀 **Sẵn sàng trải nghiệm!** Hãy hỏi tôi bất cứ điều gì về dinh dưỡng để thấy sự khác biệt!

❓ **Bạn có muốn tôi tư vấn thực đơn theo cá tính mới không?**
❓ **Bạn có muốn trải nghiệm phong cách tư vấn ${newPersonalityName.toLowerCase()} không?**
❓ **Bạn có cần hỗ trợ gì khác về dinh dưỡng không?**`;

      // Dispatch event to ChatInterface
      window.dispatchEvent(
        new CustomEvent("fitchat-personality-changed", {
          detail: {
            personalityName: newPersonalityName,
            personalityMessage: aiNotificationMessage,
          },
        })
      );
    } else {
      setPersonalityChangeMessage("");
    }

    // Sync to Firestore if user is authenticated
    if (isAuthenticated) {
      const success = await syncProfileToFirestore(userProfile);
      if (!success) {
        // Show error but don't prevent close
        console.error("Failed to sync to Firestore, but saved locally");
      }
    }

    // Show success message
    setSaveSuccess(true);

    // Notify other components about the update
    window.dispatchEvent(new CustomEvent("fitchat-profile-updated"));

    // Auto hide success message and close modal after 2 seconds
    setTimeout(() => {
      setSaveSuccess(false);
      setPersonalityChangeMessage("");
      onClose();
    }, 2000);
  };

  const calculateBMR = (): number => {
    if (
      !userProfile.weight ||
      !userProfile.height ||
      !userProfile.age ||
      !userProfile.gender
    ) {
      return 0;
    }

    // Mifflin-St Jeor Equation
    let bmr;
    if (userProfile.gender === "male") {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age +
        5;
    } else {
      bmr =
        10 * userProfile.weight +
        6.25 * userProfile.height -
        5 * userProfile.age -
        161;
    }
    return Math.round(bmr);
  };

  const calculateTDEE = (): number => {
    const bmr = calculateBMR();
    const activityMultipliers: { [key: string]: number } = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    return Math.round(
      bmr * (activityMultipliers[userProfile.activityLevel] || 1.55)
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">⚙️ Tuỳ chỉnh AI</h2>
              </div>
              <div className="flex items-center space-x-3">
                {/* Sync Status */}
                {isAuthenticated && (
                  <div className="flex items-center space-x-2 bg-white/20 px-3 py-1 rounded-lg">
                    {isSyncing ? (
                      <>
                        <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />
                        <span className="text-xs">Đang đồng bộ...</span>
                      </>
                    ) : syncError ? (
                      <>
                        <ExclamationTriangleIcon className="w-4 h-4 text-yellow-300" />
                        <span className="text-xs">Lỗi sync</span>
                      </>
                    ) : lastSyncTime ? (
                      <>
                        <CheckCircleIcon className="w-4 h-4 text-green-300" />
                        <span className="text-xs">Đã đồng bộ</span>
                      </>
                    ) : null}
                  </div>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
            {syncError && (
              <div className="mt-2 text-xs text-yellow-200 bg-red-500/20 px-3 py-1 rounded">
                Lỗi: {syncError}
              </div>
            )}
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* User Profile Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <UserIcon className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    👤 Thông tin cá nhân
                  </h3>
                  {isAuthenticated && (
                    <div className="ml-auto">
                      <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                        🔄 Tự động lưu cloud
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <IdentificationIcon className="w-4 h-4 inline mr-1" />
                      Tên của bạn
                    </label>
                    <input
                      type="text"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập tên của bạn"
                    />
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <CalendarIcon className="w-4 h-4 inline mr-1" />
                      Tuổi
                    </label>
                    <input
                      type="number"
                      value={userProfile.age || ""}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập tuổi"
                      min="1"
                      max="120"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Giới tính
                    </label>
                    <div className="flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="male"
                          checked={userProfile.gender === "male"}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              gender: e.target.value as "male" | "female",
                            })
                          }
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">👨 Nam</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="female"
                          checked={userProfile.gender === "female"}
                          onChange={(e) =>
                            setUserProfile({
                              ...userProfile,
                              gender: e.target.value as "male" | "female",
                            })
                          }
                          className="mr-2 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">👩 Nữ</span>
                      </label>
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      📏 Chiều cao (cm)
                    </label>
                    <input
                      type="number"
                      value={userProfile.height || ""}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          height: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập chiều cao"
                      min="100"
                      max="250"
                    />
                  </div>

                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <ScaleIcon className="w-4 h-4 inline mr-1" />
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      value={userProfile.weight || ""}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          weight: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập cân nặng"
                      min="20"
                      max="300"
                      step="0.1"
                    />
                  </div>

                  {/* Activity Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🏃 Mức độ hoạt động
                    </label>
                    <select
                      value={userProfile.activityLevel}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          activityLevel: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="sedentary">
                        🛋️ Ít vận động (làm việc văn phòng)
                      </option>
                      <option value="light">🚶 Nhẹ (tập 1-3 ngày/tuần)</option>
                      <option value="moderate">
                        🏃 Vừa phải (tập 3-5 ngày/tuần)
                      </option>
                      <option value="active">
                        💪 Tích cực (tập 6-7 ngày/tuần)
                      </option>
                      <option value="very_active">
                        🔥 Rất tích cực (tập 2 lần/ngày)
                      </option>
                    </select>
                  </div>

                  {/* Goal */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      🎯 Mục tiêu
                    </label>
                    <select
                      value={userProfile.goal}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          goal: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="lose_weight">⬇️ Giảm cân</option>
                      <option value="gain_muscle">💪 Tăng cơ</option>
                      <option value="maintain_weight">
                        ⚖️ Duy trì cân nặng
                      </option>
                      <option value="general_health">
                        ❤️ Cải thiện sức khỏe tổng quát
                      </option>
                      <option value="endurance">🏃 Tăng sức bền</option>
                      <option value="strength">🏋️ Tăng sức mạnh</option>
                    </select>
                  </div>
                </div>

                {/* Health Metrics */}
                {userProfile.weight &&
                  userProfile.height &&
                  userProfile.age &&
                  userProfile.gender && (
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-gray-800 mb-3">
                        📊 Chỉ số sức khỏe
                      </h4>
                      <div className="grid grid-cols-1 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">BMR:</span>
                          <span className="ml-2 font-medium text-green-600">
                            {calculateBMR()} kcal/ngày
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">TDEE:</span>
                          <span className="ml-2 font-medium text-purple-600">
                            {calculateTDEE()} kcal/ngày
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
              </div>

              {/* AI Personality Section */}
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-4">
                  <SparklesIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">
                    🤖 Cá tính AI
                  </h3>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Chọn cách bạn muốn Kelly Fitness - AI Agent tương tác với bạn:
                </p>

                <div className="space-y-3">
                  {aiPersonalities.map((personality) => (
                    <motion.div
                      key={personality.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                        selectedPersonality === personality.id
                          ? "border-blue-500 bg-blue-50 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      onClick={() => setSelectedPersonality(personality.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{personality.emoji}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800">
                            {personality.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {personality.description}
                          </p>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            selectedPersonality === personality.id
                              ? "border-blue-500 bg-blue-500"
                              : "border-gray-300"
                          }`}
                        >
                          {selectedPersonality === personality.id && (
                            <div className="w-full h-full rounded-full bg-white scale-50"></div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                disabled={isSyncing}
                className={`px-6 py-2 rounded-lg transition-all duration-200 shadow-lg flex items-center space-x-2 ${
                  isSyncing
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                }`}
              >
                {isSyncing ? (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 animate-pulse" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <span>💾</span>
                    <span>Lưu cài đặt</span>
                  </>
                )}
              </motion.button>
            </div>

            {/* Success Message */}
            <AnimatePresence>
              {saveSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-green-800 font-medium">
                        ✅ Đã lưu cài đặt thành công!
                      </p>
                      {personalityChangeMessage && (
                        <p className="text-green-700 text-sm mt-1">
                          🎭 {personalityChangeMessage}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
