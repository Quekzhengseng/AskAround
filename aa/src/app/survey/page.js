"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SurveyContainer from "./../components/survey/SurveyContainer";
import Link from "next/link";
import { SurveyAPI } from "./../utils/SurveyAPI";
import ToggleSwitch from "./../components/common/ToggleSwitch";

export default function SurveyPage() {
  // Get the survey ID from URL params
  const searchParams = useSearchParams();
  const surveyId = searchParams.get("id");
  const router = useRouter();

  // You can replace this with actual user ID from authentication
  const userId = "user_data-001";

  // State for survey and loading status
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to fetch the specific survey
  const fetchSurvey = async () => {
    if (!surveyId) {
      setError("No survey ID provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Get all surveys the user needs to answer
      const surveys = await SurveyAPI.getUserToBeAnsweredSurveys(userId);

      // Find the specific survey by ID
      const survey = surveys.find((s) => s.id === surveyId);

      if (!survey) {
        setError("Survey not found or not available for this user");
      } else {
        setCurrentSurvey(survey);
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
  }, [surveyId]);

  // Handle survey completion
  const handleSurveyComplete = () => {
    // Navigate back to the survey list
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40">
      <main className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
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
              Back to All Surveys
            </Link>
          </div>

          <div className="text-center perspective-distant flex-1">
            <h1 className="text-4xl font-bold mb-2 font-display transform-3d hover:rotate-x-2 transition-transform duration-300">
              AskAround
            </h1>
            <p className="text-gray-600">
              Survey Platform for Data Curators and Data Providers
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <ToggleSwitch
              leftOption="Do Surveys"
              rightOption="Create Survey"
              leftPath="/"
              rightPath="/curator"
            />
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 mx-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
              aria-label="Go to profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-purple-700"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
            <Link
              href="/voucher"
              className="flex items-center justify-center w-10 h-10 mx-2 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
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
                className="w-5 h-5 text-purple-700"
              >
                {/* Voucher outline with zigzag edge */}
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />

                {/* Zigzag/perforated line down the middle */}
                <path d="M12 4v2m0 2v2m0 2v2m0 2v2m0 2v2" />
              </svg>
            </Link>
          </div>
        </header>

        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">There was an error loading the survey</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No survey available */}
        {!loading && !error && !currentSurvey && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-700 mb-2">
              Survey Not Found
            </h2>
            <p className="text-gray-500 mb-6">
              The requested survey doesn't exist or isn't available.
            </p>
            <Link
              href="/"
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-colors"
            >
              Return to All Surveys
            </Link>
          </div>
        )}

        {/* Survey container */}
        {!loading && !error && currentSurvey && (
          <div className="transition-opacity duration-300 ease-in-out">
            <SurveyContainer
              key={currentSurvey.id}
              survey={currentSurvey}
              userId={userId}
              onComplete={handleSurveyComplete}
            />
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} AskAround Survey Platform
      </footer>
    </div>
  );
}
