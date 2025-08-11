"use client";

import { useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";

export default function SimpleHomePage() {
  const [user, loading, error] = useAuthState(auth);

  console.log("Auth State:", { user: !!user, loading, error });

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show error if auth failed
  if (error) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center text-red-600">
          <h1 className="text-xl font-bold mb-2">Authentication Error</h1>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold text-center mb-4">Please Login</h1>
          <p className="text-gray-600 text-center">
            You need to login to continue
          </p>
        </div>
      </div>
    );
  }

  // Show main content if authenticated
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Welcome, {user.displayName || user.email}!
          </h1>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              You are successfully logged in.
            </p>
            <p className="text-sm text-gray-400">UID: {user.uid}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
