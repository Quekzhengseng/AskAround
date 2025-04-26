"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import SurveyContainer from "./../components/survey/SurveyContainer";
import Link from "next/link";
import { SurveyAPI, UserAPI } from "./../utils/SurveyAPI";
import { createClient } from "./../utils/supabase/client";
import SurveyCompletionModal from "./../components/survey/SurveyCompletionModal";

export default function SurveyPage() {
  // Get the survey ID from URL params
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");
  const router = useRouter();
  const supabase = createClient();

  // State for survey and loading status
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialUserPoints, setInitialUserPoints] = useState(0);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

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

  // Function to fetch the specific survey
  const fetchSurvey = async () => {
    if (!user) return; // Don't fetch if no user

    if (!surveyId) {
      setError("No survey ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get all surveys the user needs to answer
      const surveys = await SurveyAPI.getUserToBeAnsweredSurveys(user.id);

      // Find the specific survey by ID
      const survey = surveys.find((s) => s.survey_id === surveyId);

      // Also get user's current points
      const userData = await UserAPI.getUserData(user.id);
      if (userData && typeof userData.points === "number") {
        setInitialUserPoints(userData.points);
      }

      if (!survey) {
        setError("Survey not found or not available for this user");
      } else {
        setCurrentSurvey(survey);
        console.log(survey);
      }
    } catch (err) {
      console.error("Error fetching survey:", err);
      setError(err.message || "Failed to fetch survey");
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of the survey
  useEffect(() => {
    fetchSurvey();
  }, [surveyId, user]);

  const handleSurveyComplete = async () => {
    if (!user || !currentSurvey) return;

    try {
      // Show the completion modal first
      setShowCompletionModal(true);

      // Process API call to add all points
      await UserAPI.changePoints(
        user.id,
        currentSurvey.survey_id,
        "survey_completion"
      );

      // Mark the survey as completed in the user's profile
      await UserAPI.addAnsweredSurvey(user.id, currentSurvey.survey_id);

      // The modal will automatically redirect back to the main page after animation
      // No need to manually redirect here
    } catch (err) {
      console.error("Error completing survey:", err);
      setError("Failed to submit survey. Please try again.");

      // Hide the modal if there was an error
      setShowCompletionModal(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50">
      {/* --- Header --- */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/80">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          {/* Left Section */}
          <div className="flex-1 flex justify-start">
            <Link
              href="/"
              className="font-semibold text-lg text-gray-800 flex items-center"
            >
              <span className="text-indigo-600 mr-2 text-xl">●</span>
              AskAround
            </Link>
          </div>
          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {/* Profile Link */}
            <Link
              href="/profile"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              aria-label="Profile"
            >
              <svg
                className="w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
            <Link
              href="/voucher"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
              aria-label="Go to voucher"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
                <path d="M12 4v2m0 2v2m0 2v2m0 2v2m0 2v2" />
              </svg>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        {/* Back navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Link
            href="/"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to All Surveys
          </Link>
        </motion.div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col justify-center items-center py-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: 1,
                transition: {
                  duration: 0.5,
                  repeat: Infinity,
                  repeatType: "reverse",
                },
              }}
              className="w-16 h-16 mb-4"
            >
              <svg
                viewBox="0 0 38 38"
                xmlns="http://www.w3.org/2000/svg"
                className="text-indigo-500"
              >
                <defs>
                  <linearGradient
                    x1="8.042%"
                    y1="0%"
                    x2="65.682%"
                    y2="23.865%"
                    id="prefix__a"
                  >
                    <stop
                      stopColor="currentColor"
                      stopOpacity="0"
                      offset="0%"
                    />
                    <stop
                      stopColor="currentColor"
                      stopOpacity=".631"
                      offset="63.146%"
                    />
                    <stop stopColor="currentColor" offset="100%" />
                  </linearGradient>
                </defs>
                <g fill="none" fillRule="evenodd">
                  <g transform="translate(1 1)">
                    <path
                      d="M36 18c0-9.94-8.06-18-18-18"
                      stroke="url(#prefix__a)"
                      strokeWidth="3"
                    >
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite"
                      />
                    </path>
                    <circle fill="currentColor" cx="36" cy="18" r="1">
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        from="0 18 18"
                        to="360 18 18"
                        dur="0.9s"
                        repeatCount="indefinite"
                      />
                    </circle>
                  </g>
                </g>
              </svg>
            </motion.div>
            <p className="text-indigo-500 font-medium">
              Loading your survey...
            </p>
          </div>
        )}

        {/* Error state */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-red-50 border-l-4 border-red-400 p-5 rounded-md mb-6"
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-lg font-medium text-red-700">
                  Couldn't load survey
                </p>
                <p className="text-red-600 mt-1">{error}</p>
                <Link
                  href="/"
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to All Surveys
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* No survey available */}
        {!loading && !error && !currentSurvey && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-lg p-12 text-center max-w-2xl mx-auto"
          >
            <div className="inline-block mb-6 p-5 bg-indigo-50 rounded-full">
              <svg
                className="w-12 h-12 text-indigo-500"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Survey Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested survey doesn't exist or isn't available.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Return to All Surveys
            </Link>
          </motion.div>
        )}

        {/* Survey container */}
        {!loading && !error && currentSurvey && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="transition-all duration-300"
          >
            <SurveyContainer
              key={currentSurvey.id}
              survey={currentSurvey}
              userId={user.id}
              onComplete={handleSurveyComplete}
            />
          </motion.div>
        )}
      </main>

      <footer className="mt-16 bg-gray-50 border-t border-gray-100 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <p className="flex items-center text-gray-800 font-medium">
                <span className="text-indigo-600 mr-2 text-xl">●</span>
                AskAround
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Share your thoughts, shape our future
              </p>
            </div>
            <div className="text-gray-500 text-sm">
              © {new Date().getFullYear()} AskAround Survey Platform
            </div>
          </div>
        </div>
      </footer>
      {/* Survey Completion Modal */}
      <SurveyCompletionModal
        isOpen={showCompletionModal}
        onClose={() => {
          setShowCompletionModal(false);
          router.push("/");
        }}
        survey={currentSurvey}
        userId={user?.id}
        initialPoints={initialUserPoints}
      />
    </div>
  );
}
