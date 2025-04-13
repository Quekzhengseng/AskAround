"use client";

import React, { useState, useEffect } from "react";
import SurveyContainer from "./components/survey/SurveyContainer";
import Link from "next/link";
import { SurveyAPI } from "./utils/SurveyAPI";

export default function Home() {
  // You can replace this with actual user ID from authentication
  const userId = "user_data-001";

  // State for surveys and loading status
  const [toBeAnsweredSurveys, setToBeAnsweredSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // State to track the currently displayed survey
  const [currentSurvey, setCurrentSurvey] = useState(null);
  const [remainingSurveys, setRemainingSurveys] = useState([]);

  // Function to fetch surveys
  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const data = await SurveyAPI.getUserToBeAnsweredSurveys(userId);
      console.log("To-be-answered surveys:", data);
      setToBeAnsweredSurveys(data);
      return data;
    } catch (err) {
      console.error("Error fetching to-be-answered surveys:", err);
      setError(err.message || "Failed to fetch surveys");
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch of surveys
  useEffect(() => {
    fetchSurveys();
  }, []);

  // Set the first to-be-answered survey as current when data loads
  useEffect(() => {
    if (toBeAnsweredSurveys && toBeAnsweredSurveys.length > 0 && !loading) {
      setCurrentSurvey(toBeAnsweredSurveys[0]);
      setRemainingSurveys(toBeAnsweredSurveys.slice(1));
    }
  }, [toBeAnsweredSurveys, loading]);

  // Handle survey completion with prefetching
  const handleSurveyComplete = () => {
    // Move to the next survey if available immediately
    if (remainingSurveys.length > 0) {
      // Set the current survey to the next one right away
      setCurrentSurvey(remainingSurveys[0]);
      setRemainingSurveys((prev) => prev.slice(1));

      // Refetch in the background without waiting
      fetchSurveys();
    } else {
      setCurrentSurvey(null);
      // Still refetch to ensure we don't miss any new surveys
      fetchSurveys();
    }
  };

  // Add prefetching when the user is likely to finish soon
  useEffect(() => {
    // This will trigger prefetching when the component mounts
    // and whenever the surveys or current survey changes
    const prefetchNextSurveys = async () => {
      // If we have remaining surveys, but they're running low (less than 3)
      // prefetch the next batch to have them ready
      if (remainingSurveys.length < 3 && remainingSurveys.length > 0) {
        // Prefetch in the background
        fetchSurveys();
      }
    };

    prefetchNextSurveys();
  }, [remainingSurveys.length]);

  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40">
      <main className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex-1">{/* Empty div for alignment balance */}</div>

          <div className="text-center perspective-distant flex-1">
            <h1 className="text-4xl font-bold mb-2 font-display transform-3d hover:rotate-x-2 transition-transform duration-300">
              AskAround
            </h1>
            <p className="text-gray-600">
              Survey Platform for Data Curators and Data Providers
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
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
            <p className="font-medium">There was an error loading surveys</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* No surveys available */}
        {!loading && !error && !currentSurvey && (
          <div className="text-center py-16">
            <h2 className="text-2xl font-medium text-gray-700 mb-2">
              No Surveys Available
            </h2>
            <p className="text-gray-500">
              Check back later for new surveys to answer.
            </p>
          </div>
        )}

        {/* Survey container */}
        {!loading && !error && currentSurvey && (
          <div className="transition-opacity duration-300 ease-in-out">
            <SurveyContainer
              key={currentSurvey.id} // Add key to force re-render
              survey={currentSurvey}
              userId={userId}
              onComplete={handleSurveyComplete}
            />

            {/* Display count of remaining surveys */}
            {remainingSurveys.length > 0 && (
              <div className="mt-4 text-center text-gray-600">
                {remainingSurveys.length} more{" "}
                {remainingSurveys.length === 1 ? "survey" : "surveys"} to
                complete
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} AskAround Survey Platform
      </footer>
    </div>
  );
}
