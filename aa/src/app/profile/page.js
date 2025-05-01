// app/profile/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { UseAuth } from "./../utils/hooks/UseAuth";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "./../components/profile/Sidebar";
import ProfileTab from "./../components/profile/ProfileTab";
import QuestionsTab from "./../components/profile/QuestionsTab";
import VouchersTab from "./../components/profile/VouchersTab";
import PastSurveyTab from "./../components/profile/PastSurvey";
import BackButton from "./../components/profile/BackButton";
import LoadingSpinner from "./../components/profile/LoadingSpinner";
import ErrorMessage from "./../components/profile/ErrorMessage";

export default function Profile() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
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
            {activeTab === "profile" && "Profile Information"}
            {activeTab === "questions" && "My Questions"}
            {activeTab === "vouchers" && "My Vouchers"}
            {activeTab === "pastSurveys" && "Past Surveys"}
          </h1>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {activeTab === "profile" && <ProfileTab userData={userData} />}

              {activeTab === "questions" && (
                <QuestionsTab userData={userData} />
              )}

              {activeTab === "vouchers" && <VouchersTab userData={userData} />}

              {activeTab === "pastSurveys" && (
                <PastSurveyTab userData={userData} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
