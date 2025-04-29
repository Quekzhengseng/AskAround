// app/profile/components/QuestionsTab.jsx
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAPI } from "../../utils/SurveyAPI";
import LoadingSpinner from "./LoadingSpinner";

export default function PastSurveyTab({ userData, userId }) {
  const [answeredSurveys, setansweredSurveys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Initialize with data from userData if available
    const fetchAnsweredSurveys = async () => {
      try {
        const answeredSurveys = await UserAPI.getUserToBeAnsweredSurveys(
          userId
        );
        console.log(answeredSurveys);
        if (userData && userData.answered_surveys) {
          setansweredSurveys(answeredSurveys);
        }
      } catch (err) {
        console.error("Error fetching answered surveys:", err);
        setError(err.message);
      }
    };

    fetchAnsweredSurveys();
  }, [userData, userId]);

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
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {answeredSurveys.map((item, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <div className="bg-indigo-100 px-4 py-3 flex justify-between items-center">
            <h3 className="font-medium text-indigo-800">Survey #{index + 1}</h3>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Survey Name:
              </h4>
              <p className="text-gray-800">{item.title}</p>
            </div>
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Description
              </h4>
              <p className="text-gray-800">{item.description}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-1">
                Completed On:
              </h4>
              <p className="text-gray-800">
                {/* {new Date(item.timestamp).toLocaleDateString()} */}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
