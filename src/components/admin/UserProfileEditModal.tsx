"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAdminProfileSync } from "@/hooks/useAdminProfileSync";
import {
  XMarkIcon,
  UserIcon,
  SparklesIcon,
  PencilIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { AdminUser } from "@/types/admin";
import ForceBlackInput from "./ForceBlackInput";
import ForceBlackSelect from "./ForceBlackSelect";

interface UserProfile {
  name: string;
  age: number;
  gender: "male" | "female" | "";
  height: number; // cm
  weight: number; // kg
  activityLevel: string;
  goal: string;
}

interface UserProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser;
  onProfileUpdated?: () => void;
}

const UserProfileEditModal: React.FC<UserProfileEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onProfileUpdated,
}) => {
  const { updateUserProfile, getUserProfile, isLoading, error } =
    useAdminProfileSync();

  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: "",
    age: 0,
    gender: "",
    height: 0,
    weight: 0,
    activityLevel: "moderate",
    goal: "maintain_weight",
  });

  const [saveSuccess, setSaveSuccess] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  // Load user profile when modal opens
  useEffect(() => {
    if (isOpen && user.uid && initialLoad) {
      const loadProfile = async () => {
        try {
          const profile = await getUserProfile(user.uid);
          if (profile) {
            setUserProfile(profile);
          } else {
            // Set default profile with user's display name if available
            setUserProfile((prev) => ({
              ...prev,
              name: user.displayName || user.email.split("@")[0] || "",
            }));
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        } finally {
          setInitialLoad(false);
        }
      };

      loadProfile();
    }
  }, [
    isOpen,
    user.uid,
    initialLoad,
    getUserProfile,
    user.displayName,
    user.email,
  ]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInitialLoad(true);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleSave = async () => {
    try {
      const success = await updateUserProfile(user.uid, userProfile);

      if (success) {
        setSaveSuccess(true);
        onProfileUpdated?.();

        // Auto close after 2 seconds
        setTimeout(() => {
          setSaveSuccess(false);
          onClose();
        }, 2000);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const activityLevels = [
    { value: "sedentary", label: "Ít vận động (ngồi nhiều)" },
    { value: "light", label: "Vận động nhẹ (1-3 ngày/tuần)" },
    { value: "moderate", label: "Vận động vừa phải (3-5 ngày/tuần)" },
    { value: "active", label: "Vận động nhiều (6-7 ngày/tuần)" },
    { value: "very_active", label: "Vận động rất nhiều (2 lần/ngày)" },
  ];

  const goals = [
    { value: "lose_weight", label: "Giảm cân - giảm mỡ" },
    { value: "maintain_weight", label: "Duy trì cân nặng" },
    { value: "gain_muscle", label: "Tăng cơ - tăng cân" },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-6 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <PencilIcon className="w-6 h-6" />
                <h2 className="text-xl font-bold">👨‍💼 Chỉnh sửa Profile User</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <div className="mt-2 text-sm opacity-90">
              📧 {user.email} • 🆔 {user.uid.slice(0, 8)}...
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {/* Success Message */}
            {saveSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2"
              >
                <CheckIcon className="w-5 h-5 text-green-600" />
                <span className="text-green-800">
                  ✅ Profile đã được cập nhật thành công!
                </span>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}

            {/* Form Fields */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-4">
                <UserIcon className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-800">
                  👤 Thông tin cá nhân
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Name */}
                <ForceBlackInput
                  label="Tên"
                  type="text"
                  value={userProfile.name}
                  onChange={(e) =>
                    setUserProfile({ ...userProfile, name: e.target.value })
                  }
                  placeholder="Nhập tên"
                />

                {/* Age */}
                <ForceBlackInput
                  label="Tuổi"
                  type="number"
                  value={userProfile.age || ""}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Nhập tuổi"
                />

                {/* Height */}
                <ForceBlackInput
                  label="Chiều cao (cm)"
                  type="number"
                  value={userProfile.height || ""}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      height: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Nhập chiều cao"
                />

                {/* Weight */}
                <ForceBlackInput
                  label="Cân nặng (kg)"
                  type="number"
                  value={userProfile.weight || ""}
                  onChange={(e) =>
                    setUserProfile({
                      ...userProfile,
                      weight: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Nhập cân nặng"
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
                      className="mr-2"
                    />
                    👨 Nam
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
                      className="mr-2"
                    />
                    👩 Nữ
                  </label>
                </div>
              </div>

              {/* Activity Level */}
              <ForceBlackSelect
                label="Mức độ hoạt động"
                value={userProfile.activityLevel}
                onChange={(e) =>
                  setUserProfile({
                    ...userProfile,
                    activityLevel: e.target.value,
                  })
                }
              >
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </ForceBlackSelect>

              {/* Goal */}
              <ForceBlackSelect
                label="Mục tiêu"
                value={userProfile.goal}
                onChange={(e) =>
                  setUserProfile({ ...userProfile, goal: e.target.value })
                }
              >
                {goals.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </ForceBlackSelect>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span>💾 Lưu thay đổi</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default UserProfileEditModal;
