"use client";

import { useUserData } from "@/hooks/useUserDataV2";

/**
 * 🧪 Debug Component cho Unified Data Store
 *
 * Component này giúp test và debug UserDataStore
 * Hiển thị tất cả data và actions trong 1 nơi
 */
export default function UserDataDebugPanel() {
  const {
    profile,
    trialStatus,
    isLoading,
    error,
    lastSync,
    updateProfile,
    refreshProfile,
    refreshTrialStatus,
    forceFullSync,
    enableProfileSync,
    enableTrialSync,
    clearData,
  } = useUserData();

  const handleTestProfileUpdate = () => {
    updateProfile({
      name: "Test User " + Date.now(),
      age: 25,
      gender: "male",
      height: 175,
      weight: 70,
    });
  };

  const handleClearCache = () => {
    localStorage.removeItem("fitchat_user_profile");
    console.log("🧹 Cache cleared");
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg max-w-md text-xs">
      <h3 className="font-bold text-green-400 mb-2">
        🗄️ User Data Store Debug
      </h3>

      {/* Loading & Error State */}
      <div className="mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isLoading ? "bg-yellow-400" : "bg-green-400"
            }`}
          ></span>
          <span>Loading: {isLoading ? "Yes" : "No"}</span>
        </div>
        {error && <div className="text-red-400 text-xs mt-1">❌ {error}</div>}
        {lastSync && (
          <div className="text-gray-400 text-xs">
            Last sync: {lastSync.toLocaleTimeString()}
          </div>
        )}
      </div>

      {/* Profile Data */}
      <div className="mb-2">
        <h4 className="font-semibold text-blue-400">👤 Profile</h4>
        <div className="text-xs text-gray-300">
          <div>Name: {profile.name || "Empty"}</div>
          <div>Age: {profile.age || "Empty"}</div>
          <div>Gender: {profile.gender || "Empty"}</div>
          <div>Height: {profile.height || "Empty"}</div>
          <div>Weight: {profile.weight || "Empty"}</div>
        </div>
      </div>

      {/* Trial Status */}
      <div className="mb-2">
        <h4 className="font-semibold text-purple-400">🎫 Trial Status</h4>
        <div className="text-xs text-gray-300">
          <div>Access: {trialStatus.hasAccess ? "Yes" : "No"}</div>
          <div>Status: {trialStatus.status}</div>
          <div>Loading: {trialStatus.loading ? "Yes" : "No"}</div>
          {trialStatus.message && (
            <div className="text-yellow-300">{trialStatus.message}</div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-1">
        <button
          onClick={handleTestProfileUpdate}
          className="w-full bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          Test Profile Update
        </button>

        <div className="flex gap-1">
          <button
            onClick={refreshProfile}
            className="flex-1 bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
          >
            Refresh Profile
          </button>
          <button
            onClick={refreshTrialStatus}
            className="flex-1 bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded text-xs"
          >
            Refresh Trial
          </button>
        </div>

        <button
          onClick={forceFullSync}
          className="w-full bg-orange-600 hover:bg-orange-700 px-2 py-1 rounded text-xs"
        >
          Force Full Sync
        </button>

        <div className="flex gap-1">
          <button
            onClick={handleClearCache}
            className="flex-1 bg-red-600 hover:bg-red-700 px-2 py-1 rounded text-xs"
          >
            Clear Cache
          </button>
          <button
            onClick={clearData}
            className="flex-1 bg-red-800 hover:bg-red-900 px-2 py-1 rounded text-xs"
          >
            Clear All
          </button>
        </div>

        <div className="flex gap-1 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              defaultChecked
              onChange={(e) => enableProfileSync(e.target.checked)}
            />
            Profile Sync
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              defaultChecked
              onChange={(e) => enableTrialSync(e.target.checked)}
            />
            Trial Sync
          </label>
        </div>
      </div>
    </div>
  );
}
