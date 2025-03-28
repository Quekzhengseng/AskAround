"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

export default function Profile() {
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved questions from local storage on component mount
  useEffect(() => {
    const loadQuestions = () => {
      setIsLoading(true);
      try {
        const savedQuestions = localStorage.getItem("questions");
        if (savedQuestions) {
          setAddedQuestions(JSON.parse(savedQuestions));
        }
      } catch (error) {
        console.error("Failed to load questions from local storage:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuestions();
  }, []);

  // Delete a question by its index
  const deleteQuestion = (index) => {
    const updatedQuestions = [...addedQuestions];
    updatedQuestions.splice(index, 1);

    setAddedQuestions(updatedQuestions);

    // Update local storage
    try {
      localStorage.setItem("questions", JSON.stringify(updatedQuestions));
    } catch (error) {
      console.error("Failed to update local storage:", error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Saved Questions</h1>
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : addedQuestions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 mx-auto text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h2 className="text-xl font-medium text-gray-700 mb-2">
              No saved questions yet
            </h2>
            <p className="text-gray-500">
              Add questions from the survey to see them here.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block bg-purple-600 hover:bg-purple-700 text-white py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Return to Survey
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {addedQuestions.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div className="bg-purple-100 px-4 py-3 flex justify-between items-center">
                  <h3 className="font-medium text-purple-800">
                    Question #{index + 1}
                  </h3>
                  <button
                    onClick={() => deleteQuestion(index)}
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
                </div>
                <div className="p-4">
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
                    <p className="text-gray-800">{item.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
