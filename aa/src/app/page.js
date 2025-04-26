"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { SurveyAPI, UserAPI } from "./utils/SurveyAPI";
import ToggleSwitch from "./components/common/ToggleSwitch";
import { User, Award, ClipboardList } from "lucide-react";
import { createClient } from "./utils/supabase/client";
import { useRouter } from "next/navigation";

export default function Home() {
  const supabase = createClient();
  const router = useRouter();

  // State for surveys and loading status
  const [toBeAnsweredSurveys, setToBeAnsweredSurveys] = useState([]);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState();
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

  // Function to fetch surveys
  const fetchSurveys = async () => {
    if (!user) return; // Don't fetch if no user

    try {
      setLoading(true);
      // Use the authenticated user's ID instead of hardcoded value
      const userData = await UserAPI.getUserData(user.id);
      setUserData(userData);
      const data = await SurveyAPI.getUserToBeAnsweredSurveys(user.id);
      setToBeAnsweredSurveys(data);
      // console.log(data);
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
    if (user) {
      fetchSurveys();
    }
  }, [user]);

  // Card animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      },
    },
  };

  // Estimate completion time
  const estimateTime = (questionCount) => {
    // Roughly 30 seconds per question
    const minutes = Math.ceil((questionCount * 30) / 60);
    return `~${minutes} min`;
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
            <ToggleSwitch
              leftOption="Do Surveys"
              rightOption="Create Survey"
              leftPath="/"
              rightPath="/curator"
            />
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
        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white rounded-lg shadow-lg p-6 w-full md:w-3/4 lg:w-3/4 mx-auto mb-12 border border-gray-200"
        >
          <div className="flex flex-col items-center space-y-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <User size={32} className="text-blue-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800">
              {userData?.username || ""}
            </h2>

            <div className="grid grid-cols-2 gap-4 w-full">
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Award size={24} className="text-yellow-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Points</p>
                  <p className="text-lg font-bold">
                    {userData
                      ? userData.points !== undefined
                        ? userData.points
                        : 0
                      : 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <ClipboardList size={24} className="text-green-500 mr-3" />
                <div>
                  <p className="text-sm text-gray-500">Pending Surveys</p>
                  <p className="text-lg font-bold">
                    {userData?.to_be_answered_surveys?.length ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
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
              Discovering surveys for you...
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
                  Couldn't load surveys
                </p>
                <p className="text-red-600 mt-1">{error}</p>
                <button
                  onClick={fetchSurveys}
                  className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Try again
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* No surveys available */}
        {!loading && !error && toBeAnsweredSurveys.length === 0 && (
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
              All caught up!
            </h2>
            <p className="text-gray-600 mb-6">
              You've completed all available surveys. Check back soon for new
              ones!
            </p>
            <button
              onClick={fetchSurveys}
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </motion.div>
        )}

        {/* Survey container */}
        {!loading && !error && toBeAnsweredSurveys.length > 0 && (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {toBeAnsweredSurveys.map((survey, index) => (
              <motion.div
                key={survey.survey_id}
                variants={item}
                whileHover={{
                  y: -8,
                  transition: { type: "spring", stiffness: 300, damping: 15 },
                }}
                className="h-full"
              >
                <Link
                  href={`/survey?id=${survey.survey_id}`}
                  className="block h-full"
                >
                  <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                    {/* Card header with gradient */}
                    <div
                      className={`bg-gradient-to-br ${
                        index % 3 === 0
                          ? "from-purple-500 to-indigo-600"
                          : index % 3 === 1
                          ? "from-blue-500 to-cyan-600"
                          : "from-pink-500 to-rose-600"
                      } px-6 py-5 text-white`}
                    >
                      <h3 className="font-medium text-xl truncate">
                        {survey.title || survey.id}
                      </h3>
                    </div>

                    {/* Card content */}
                    <div className="p-6 flex-grow flex flex-col">
                      <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
                        {survey.description}
                      </p>

                      {/* Card footer with info */}
                      <div className="flex justify-between items-center mt-auto">
                        <div className="flex items-center text-gray-500 text-sm">
                          <svg
                            className="w-4 h-4 mr-1"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span>{survey.questions.length} questions</span>
                          <span>&nbsp;/&nbsp;</span>
                          <span>
                            {survey.questions.reduce(
                              (total, q) => total + q.points,
                              0
                            )}
                            &nbsp;points
                          </span>
                        </div>
                        <div className="text-gray-500 text-sm">
                          {estimateTime(survey.questions.length)}
                        </div>
                      </div>

                      {/* Take Survey button */}
                      <button className="mt-5 w-full bg-white border border-gray-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-800 font-medium rounded-lg py-2.5 px-4 transition-all duration-200 flex items-center justify-center group">
                        Start Survey
                        <svg
                          className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M14 5l7 7m0 0l-7 7m7-7H3"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
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
    </div>
  );
}
