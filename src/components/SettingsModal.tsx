"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useFirestoreSync } from "@/hooks/useFirestoreSync";
import { useUserSubscriptionOptimized } from "@/hooks/useUserSubscriptionOptimized";
import { useUserProfileSync } from "@/hooks/useUserProfileSync";
import {
  calculateBMR,
  calculateTDEE,
  calculateMacroTargets,
  getGoalDescription,
  getMacroExplanation,
} from "@/lib/macroCalculator";
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
  // Use the profile sync hook as primary data source
  const {
    profile: userProfile,
    isLoading: profileSyncLoading,
    error: profileSyncError,
    updateProfile,
    refreshProfile,
    lastSyncTime,
  } = useUserProfileSync();

  // Use subscription hook for subscription info only
  const { profile: subscriptionInfo, loading: subscriptionLoading } =
    useUserSubscriptionOptimized();

  const [selectedPersonality, setSelectedPersonality] =
    useState<string>("friendly");
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [personalityChangeMessage, setPersonalityChangeMessage] =
    useState<string>("");
  const {
    isAuthenticated,
    isSyncing,
    syncError,
    lastSyncTime: firestoreSyncTime,
    syncProfileToFirestore,
  } = useFirestoreSync();

  // Initialize personality from profile
  useEffect(() => {
    if (userProfile?.personality) {
      setSelectedPersonality(userProfile.personality);
    }
  }, [userProfile?.personality]);

  // Add function to clear subscription cache
  const clearSubscriptionCache = () => {
    if (user) {
      localStorage.removeItem(`user_subscription_cache_${user.uid}`);
      refreshSubscription?.();
    }
  };

  // Refresh profile when modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      console.log("🔄 Settings modal opened, refreshing profile...");
      refreshProfile();
    }
  }, [isOpen, isAuthenticated, refreshProfile]);

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

  // Load saved personality from localStorage
  useEffect(() => {
    const savedPersonality = localStorage.getItem("fitchat_ai_personality");
    if (savedPersonality) {
      setSelectedPersonality(savedPersonality);
    }
  }, []);

  const handleSave = async () => {
    console.log("💾 Saving profile and settings...");

    // Get previous personality to check if it changed
    const prevPersonality = localStorage.getItem("fitchat_ai_personality");

    // Save personality to localStorage
    localStorage.setItem("fitchat_ai_personality", selectedPersonality);

    // Update profile with current form data including personality
    const updatedProfile = {
      ...userProfile,
      personality: selectedPersonality,
    };

    // Save profile using the sync hook
    const profileSaveSuccess = await updateProfile(updatedProfile);

    // Also sync to Firestore if authenticated
    if (isAuthenticated) {
      try {
        await syncProfileToFirestore();
        console.log("☁️ Profile synced to Firestore");
      } catch (error) {
        console.error("❌ Failed to sync to Firestore:", error);
      }
    }

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

    // Show success message based on profile save result
    if (profileSaveSuccess) {
      setSaveSuccess(true);
    } else if (profileSyncError) {
      // Profile saved locally but not synced to server
      setSaveSuccess(true);
      console.log("Profile saved locally, sync to server failed");
    }

    // Notify other components about the update
    window.dispatchEvent(new CustomEvent("fitchat-profile-updated"));

    // Auto hide success message and close modal after 2 seconds
    setTimeout(() => {
      setSaveSuccess(false);
      setPersonalityChangeMessage("");
      onClose();
    }, 2000);
  };

  const calculateBMRLocal = (): number => {
    return calculateBMR(userProfile);
  };

  const calculateTDEELocal = (): number => {
    return calculateTDEE(userProfile);
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
          data-testid="settings-modal"
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
                        updateProfile({
                          name: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập tên của bạn"
                      data-testid="name-input"
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
                        updateProfile({
                          age: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900 placeholder-gray-500"
                      placeholder="Nhập tuổi"
                      min="1"
                      max="120"
                      data-testid="age-input"
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
                            updateProfile({
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
                            updateProfile({
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
                        updateProfile({
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
                        updateProfile({
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
                        updateProfile({
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
                        updateProfile({
                          goal: e.target.value,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
                    >
                      <option value="lose_weight">📉 Giảm cân - giảm mỡ</option>
                      <option value="gain_muscle">💪 Tăng cân - tăng cơ</option>
                      <option value="maintain_weight">
                        ⚖️ Duy trì vóc dáng
                      </option>
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
                            {calculateBMRLocal()} kcal/ngày
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">TDEE:</span>
                          <span className="ml-2 font-medium text-purple-600">
                            {calculateTDEELocal()} kcal/ngày
                          </span>
                        </div>
                        {userProfile.goal && (
                          <>
                            <div className="mt-3 pt-3 border-t border-blue-200">
                              <h5 className="font-semibold text-gray-800 mb-2">
                                🎯 Mục tiêu macro (
                                {getGoalDescription(userProfile.goal)})
                              </h5>
                              {(() => {
                                const macros =
                                  calculateMacroTargets(userProfile);
                                return (
                                  <div className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                      <div>
                                        <span className="text-gray-600">
                                          Calories:
                                        </span>
                                        <span className="ml-2 font-medium text-blue-600">
                                          {macros.calories} kcal
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">
                                          Protein:
                                        </span>
                                        <span className="ml-2 font-medium text-red-600">
                                          {macros.protein}g (
                                          {macros.proteinPercent}%)
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">
                                          Carbs:
                                        </span>
                                        <span className="ml-2 font-medium text-orange-600">
                                          {macros.carbs}g ({macros.carbsPercent}
                                          %)
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-gray-600">
                                          Fat:
                                        </span>
                                        <span className="ml-2 font-medium text-yellow-600">
                                          {macros.fat}g ({macros.fatPercent}%)
                                        </span>
                                      </div>
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2 p-2 bg-blue-50 rounded">
                                      💡 {getMacroExplanation(userProfile.goal)}
                                    </div>
                                  </div>
                                );
                              })()}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                {/* Subscription Info Section */}
                {subscriptionInfo && (
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-4 rounded-lg border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-semibold text-gray-800">
                          Thông tin tài khoản
                        </h4>
                      </div>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="grid grid-cols-1 gap-3">
                        {/* Plan Type */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Gói tài khoản:</span>
                          <span className="font-medium text-lg text-gray-900">
                            {subscriptionInfo?.planDisplay || "Đang tải..."}
                          </span>
                        </div>

                        {/* Status */}
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Trạng thái:</span>
                          <span
                            className={`font-medium px-2 py-1 rounded text-xs ${
                              subscriptionInfo?.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {subscriptionInfo?.isActive
                              ? "✅ Hoạt động"
                              : "❌ Không hoạt động"}
                          </span>
                        </div>

                        {/* Account Created */}
                        {subscriptionInfo?.accountCreatedDate && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Ngày tạo tài khoản:
                            </span>
                            <span className="font-medium text-gray-800">
                              {new Date(
                                subscriptionInfo.accountCreatedDate
                              ).toLocaleDateString("vi-VN", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}

                        {/* Trial Period */}
                        {subscriptionInfo?.isTrialActive &&
                          subscriptionInfo?.trialEndDate && (
                            <>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Dùng thử đến:
                                </span>
                                <span className="font-medium text-orange-700">
                                  {new Date(
                                    subscriptionInfo.trialEndDate
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                              {subscriptionInfo?.daysRemaining !==
                                undefined && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">
                                    Số ngày còn lại:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      subscriptionInfo?.daysRemaining <= 1
                                        ? "text-red-600"
                                        : subscriptionInfo?.daysRemaining <= 3
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {subscriptionInfo?.daysRemaining} ngày
                                  </span>
                                </div>
                              )}
                            </>
                          )}

                        {/* Pro Subscription */}
                        {subscriptionInfo?.isProActive && (
                          <>
                            {subscriptionInfo?.subscriptionStartDate && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Bắt đầu gói Pro:
                                </span>
                                <span className="font-medium text-purple-700">
                                  {new Date(
                                    subscriptionInfo.subscriptionStartDate
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {subscriptionInfo?.subscriptionEndDate && (
                              <div className="flex justify-between items-center">
                                <span className="text-gray-600">
                                  Kết thúc gói Pro:
                                </span>
                                <span className="font-medium text-purple-700">
                                  {new Date(
                                    subscriptionInfo.subscriptionEndDate
                                  ).toLocaleDateString("vi-VN", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            )}
                            {subscriptionInfo?.daysRemaining !== undefined &&
                              subscriptionInfo?.daysRemaining > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-gray-600">
                                    Số ngày còn lại:
                                  </span>
                                  <span
                                    className={`font-medium ${
                                      subscriptionInfo?.daysRemaining <= 7
                                        ? "text-red-600"
                                        : subscriptionInfo?.daysRemaining <= 30
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {subscriptionInfo?.daysRemaining} ngày
                                  </span>
                                </div>
                              )}
                          </>
                        )}

                        {/* Status Message */}
                        <div className="mt-3 pt-3 border-t border-emerald-200"></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Fallback when subscription info is not available */}
                {!subscriptionInfo && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-800">
                        Thông tin tài khoản
                      </h4>
                    </div>
                    <div className="text-center py-4">
                      <p className="text-gray-500">
                        {subscriptionLoading
                          ? "⏳ Đang tải thông tin tài khoản..."
                          : "❌ Không thể tải thông tin tài khoản"}
                      </p>
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
                  Chọn cách bạn muốn OneFitness AI tương tác với bạn:
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
                data-testid="save-button"
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
