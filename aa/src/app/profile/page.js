"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAPI } from "../utils/SurveyAPI";
import { createClient } from "./../utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Profile() {
  const supabase = createClient();
  const router = useRouter();
  // State management
  const [savedSurveys, setSavedSurveys] = useState([]);
  const [userData, setUserData] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication and get user
  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        // Redirect to login if not authenticated
        router.push("/login");
        return;
      }
      setUser(user);
    };

    getUser();
  }, [router, supabase]);

  // Fetch saved questions using the API directly
  useEffect(() => {
    if (!user) return; // Don't fetch if no user

    async function initializeUserData() {
      try {
        setLoading(true);
        const userData = await UserAPI.getUserData(user.id);
        setUserData(userData);
        setSavedSurveys(userData.saved_questions);
      } catch (err) {
        console.error("Error fetching initial user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeUserData();
  }, [user]);

  // Function to delete a saved survey (if API endpoint exists)
  const deleteSavedSurvey = async (index) => {
    // This would need a proper API endpoint to implement
    console.log("Delete survey at index:", index);

    try {
      setLoading(true);
      const savedQuestions = await UserAPI.removeSavedQuestion(user.id, index);
      setSavedSurveys(savedQuestions);
    } catch (err) {
      console.error("Error removing specific saved question", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Profile</h1>
          <Link
            href="/"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Survey
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>Error loading profile: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* First Column - UserData */}
            <div className="p-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  User Info
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">Username:</span>{" "}
                  {userData.username}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Points:</span> {userData.points}
                </p>
              </div>
            </div>

            {/* Second Column - Your Survey Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {savedSurveys.map((item, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="bg-purple-100 px-4 py-3 flex justify-between items-center">
                    <h3 className="font-medium text-purple-800">
                      Survey #{index + 1}
                    </h3>
                    <button
                      onClick={() => deleteSavedSurvey(index)}
                      className="text-red-500 hover:text-red-700 transition-colors duration-300"
                      aria-label="Delete survey"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Question:
                      </h4>
                      <p className="text-gray-800">{item.question}</p>
                    </div>
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Answer:
                      </h4>
                      <p className="text-gray-800">{item.response}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Completed On:
                      </h4>
                      <p className="text-gray-800">
                        {new Date(item.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
