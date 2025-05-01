import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAPI } from "../../utils/SurveyAPI";
import LoadingSpinner from "./LoadingSpinner";

export default function QuestionsTab({ userData }) {
  const [savedQuestions, setSavedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    // Initialize with data from userData if available
    if (userData && userData.saved_questions) {
      setSavedQuestions(userData.saved_questions);
    }
  }, [userData]);

  const deleteSavedQuestion = async (index) => {
    try {
      setLoading(true);
      const updatedQuestions = await UserAPI.removeSavedQuestion(
        userData.UID,
        index
      );
      setSavedQuestions(updatedQuestions);
    } catch (err) {
      console.error("Error removing saved question:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle expanded state for a question
  const toggleExpanded = (index) => {
    setExpandedIds((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!savedQuestions || savedQuestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-8 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No saved questions yet
        </h3>
        <p className="text-gray-600 mb-4">
          Your answered survey questions will appear here
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Take a survey
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {savedQuestions.map((item, index) => {
        const isExpanded = !!expandedIds[index];

        return (
          <div
            key={index}
            className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
          >
            {/* Row Header - clickable to expand */}
            <div
              className="px-4 py-3 flex items-center cursor-pointer"
              onClick={() => toggleExpanded(index)}
            >
              <div className="bg-indigo-100 rounded-lg p-2 mr-3">
                <span className="font-medium text-indigo-800">
                  #{index + 1}
                </span>
              </div>

              <div className="flex-grow">
                <p className="text-gray-800 font-medium line-clamp-1">
                  {item.question}
                </p>
              </div>

              <div className="text-right flex items-center">
                <span className="text-gray-500 text-sm mr-4 hidden sm:inline">
                  {new Date(item.timestamp).toLocaleDateString()}
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent triggering the row click
                    deleteSavedQuestion(index);
                  }}
                  className="text-red-500 hover:text-red-700 transition-colors duration-300"
                  aria-label="Delete question"
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

                <button
                  className="ml-2 text-gray-500 hover:text-gray-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(index);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-transform duration-200 transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile view completed date (only visible on small screens) */}
            <div className="px-4 pb-2 sm:hidden text-gray-500 text-xs -mt-2">
              Completed: {new Date(item.timestamp).toLocaleDateString()}
            </div>

            {/* Expandable Answer Section */}
            {isExpanded && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 transition-all duration-200">
                <div className="mb-2">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Question:
                    </h4>
                    <p className="text-gray-800">{item.question}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Answer:
                    </h4>
                    <p className="text-gray-800">{item.response}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
