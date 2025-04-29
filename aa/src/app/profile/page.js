// app/profile/page.jsx
"use client";
import React, { useState, useEffect } from "react";
import { UserAPI } from "../utils/SurveyAPI";
import { createClient } from "./../utils/supabase/client";
import { useRouter } from "next/navigation";
import Sidebar from "./../components/profile/Sidebar";
import ProfileTab from "./../components/profile/ProfileTab";
import QuestionsTab from "./../components/profile/QuestionsTab";
import VouchersTab from "./../components/profile/VouchersTab";
import PastSurveyTab from "./../components/profile/PastSurvey";
import BackButton from "./../components/profile/BackButton";
import LoadingSpinner from "./../components/profile/LoadingSpinner";
import ErrorMessage from "./../components/profile/ErrorMessage";

export default function Profile() {
  const supabase = createClient();
  const router = useRouter();

  // State management
  const [userData, setUserData] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Check authentication and get user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router, supabase]);

  // Fetch user data
  useEffect(() => {
    if (!user) return;

    async function initializeUserData() {
      try {
        setLoading(true);
        const userData = await UserAPI.getUserData(user.id);
        setUserData(userData);
      } catch (err) {
        console.error("Error fetching initial user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeUserData();
  }, [user]);

  // Function to handle logout
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userData={userData}
        user={user}
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
          </h1>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <ErrorMessage message={error} />
          ) : (
            <>
              {activeTab === "profile" && (
                <ProfileTab userData={userData} user={user} />
              )}

              {activeTab === "questions" && (
                <QuestionsTab userData={userData} userId={user.id} />
              )}

              {activeTab === "vouchers" && <VouchersTab userData={userData} />}

              {activeTab === "pastSurveys" && (
                <PastSurveyTab userData={userData} userId={user.id} />
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
