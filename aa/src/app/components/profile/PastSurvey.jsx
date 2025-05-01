// app/profile/components/PastSurveyTab.jsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAPI } from "../../utils/SurveyAPI";
import LoadingSpinner from "./LoadingSpinner";

export default function PastSurveyTab({ userData }) {
  const [answeredSurveys, setAnsweredSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedIds, setExpandedIds] = useState({});

  useEffect(() => {
    // Initialize with data from userData if available
    const fetchAnsweredSurveys = async () => {
      try {
        setLoading(true);
        const answeredSurveys = await UserAPI.getUserToBeAnsweredSurveys(
          userData.UID
        );

        if (userData && userData.answered_surveys) {
          setAnsweredSurveys(answeredSurveys);
        }
      } catch (err) {
        console.error("Error fetching answered surveys:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnsweredSurveys();
  }, [userData]);

  // Toggle expanded state for a survey
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

  if (!answeredSurveys || answeredSurveys.length === 0) {
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
          No answered surveys yet
        </h3>
        <p className="text-gray-600 mb-4">
          Your answered survey history will appear here
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
      {answeredSurveys.map((item, index) => {
        const isExpanded = !!expandedIds[index];
        const completedDate = item.completed_at
          ? new Date(item.completed_at).toLocaleDateString()
          : "Not available";

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
                  {item.title || "Untitled Survey"}
                </p>
              </div>

              <div className="text-right flex items-center">
                <span className="text-gray-500 text-sm mr-4 hidden sm:inline">
                  {completedDate}
                </span>

                <button
                  className="text-gray-500 hover:text-gray-700"
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
              Completed: {completedDate}
            </div>

            {/* Expandable Details Section */}
            {isExpanded && (
              <div className="p-4 bg-gray-50 border-t border-gray-100 transition-all duration-200">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Survey Name:
                    </h4>
                    <p className="text-gray-800">
                      {item.title || "Untitled Survey"}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Description:
                    </h4>
                    <p className="text-gray-800">
                      {item.description || "No description available"}
                    </p>
                  </div>

                  {item.points_earned && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Points Earned:
                      </h4>
                      <p className="text-indigo-600 font-semibold">
                        {item.points_earned} points
                      </p>
                    </div>
                  )}

                  {item.questions_count && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-1">
                        Questions Answered:
                      </h4>
                      <p className="text-gray-800">{item.questions_count}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-1">
                      Completed On:
                    </h4>
                    <p className="text-gray-800">{completedDate}</p>
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
