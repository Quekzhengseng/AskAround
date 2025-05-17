// app/profile/page.jsx
"use client";

import React, { useState, useEffect, Suspense } from "react";

import Sidebar from "./../components/profile/Sidebar";
import BackButton from "./../components/profile/BackButton";
import ProfileTabsRenderer from "./../components/profile/ProfileTabsRenderer";

import { UseAuth } from "./../utils/hooks/UseAuth";
import { UserAPI } from "../utils/SurveyAPI";
import { useRouter, useSearchParams } from "next/navigation";

function Profile() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userData } = UseAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize active tab from URL parameter or localStorage, fallback to 'profile'
  const [activeTab, setActiveTab] = useState(() => {
    // First check URL parameter
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["profile", "questions", "vouchers", "pastSurveys"].includes(tabParam)
    ) {
      return tabParam;
    }

    // Then check localStorage (if we're in browser environment)
    if (typeof window !== "undefined") {
      const savedTab = localStorage.getItem("profileActiveTab");
      if (savedTab) {
        return savedTab;
      }
    }

    // Default to profile tab
    return "profile";
  });

  // Update loading state when userData is fetched
  useEffect(() => {
    if (userData) {
      setLoading(false); // Set loading to false when userData is available
    }
  }, [userData]);

  // Update URL and localStorage when activeTab changes
  useEffect(() => {
    // Update URL without full page navigation
    router.replace(`/profile?tab=${activeTab}`, { scroll: false });

    // Save to localStorage
    localStorage.setItem("profileActiveTab", activeTab);
  }, [activeTab, router]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Function to handle logout
  const handleLogout = () => {
    try {
      setIsLoggingOut(true);

      UserAPI.logout(localStorage.getItem("token"));

      // Remove tokens from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("profileActiveTab");

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Error during logout:", error);
      setError("Failed to log out. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        userData={userData}
        loading={loading}
        handleLogout={handleLogout}
        isLoggingOut={isLoggingOut}
      />

      <main className="ml-64 flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <BackButton />

          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            {{
              profile: "Profile Information",
              questions: "My Questions",
              vouchers: "My Vouchers",
              pastSurveys: "Past Surveys",
            }[activeTab] || "Profile"}
          </h1>

          <ProfileTabsRenderer
            activeTab={activeTab}
            userData={userData}
            loading={loading}
            error={error}
          />
        </div>
      </main>
    </div>
  );
}

export default function ProfilePageWrapper() {
  return (
    <Suspense fallback={<div>Loading profile...</div>}>
      <Profile />
    </Suspense>
  );
}
