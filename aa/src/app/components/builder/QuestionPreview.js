"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

const QUESTION_TYPES = {
  SHORT_TEXT: "SHORT_TEXT",
  LONG_TEXT: "LONG_TEXT",
  SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  RATING: "RATING",
  YES_NO: "YES_NO",
  EMAIL: "EMAIL",
  DATE: "DATE",
};

const QuestionPreview = ({ question }) => {
  // Mock state for the preview
  const [answer, setAnswer] = useState(
    question.type === QUESTION_TYPES.MULTIPLE_CHOICE ? [] : ""
  );

  const renderInput = () => {
    // Randomize options if needed
    const options = question.randomize
      ? [...question.options].sort(() => Math.random() - 0.5)
      : question.options;

    switch (question.type) {
      case QUESTION_TYPES.SHORT_TEXT:
      case QUESTION_TYPES.EMAIL:
        return (
          <input
            type={question.type === QUESTION_TYPES.EMAIL ? "email" : "text"}
            className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent"
            placeholder={question.placeholder || ""}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );

      case QUESTION_TYPES.LONG_TEXT:
        return (
          <textarea
            className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent min-h-[120px]"
            placeholder={question.placeholder || ""}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
          />
        );

      case QUESTION_TYPES.SINGLE_CHOICE:
        return (
          <div className="space-y-3 mt-4">
            {options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  answer === option
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setAnswer(option)}
              >
                {option}
                {option === "Other (please specify)" && answer === option && (
                  <input
                    type="text"
                    className="mt-2 w-full p-2 border border-gray-300 rounded"
                    placeholder="Please specify..."
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            ))}
          </div>
        );

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        return (
          <div className="space-y-3 mt-4">
            {options.map((option, index) => {
              const isSelected =
                Array.isArray(answer) && answer.includes(option);
              return (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    if (isSelected) {
                      setAnswer(answer.filter((item) => item !== option));
                    } else {
                      if (
                        question.maxSelections &&
                        answer.length >= question.maxSelections
                      ) {
                        return; // Don't add if max selections reached
                      }
                      setAnswer([...answer, option]);
                    }
                  }}
                >
                  <div
                    className={`w-5 h-5 mr-3 flex-shrink-0 border-2 rounded ${
                      isSelected
                        ? "bg-blue-500 border-blue-500 flex items-center justify-center"
                        : "border-gray-300"
                    }`}
                  >
                    {isSelected && (
                      <svg
                        className="w-3 h-3 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    )}
                  </div>
                  <span>{option}</span>
                </div>
              );
            })}
            {question.maxSelections && (
              <p className="text-sm text-gray-500 mt-2">
                Please select up to {question.maxSelections} options.
              </p>
            )}
          </div>
        );

      case QUESTION_TYPES.RATING:
        return (
          <div className="flex justify-center space-x-4 mt-6">
            {[...Array(question.scale)].map((_, i) => (
              <button
                key={i}
                className={`w-14 h-14 rounded-full text-xl font-bold transition-all ${
                  answer === i + 1
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => setAnswer(i + 1)}
              >
                {i + 1}
              </button>
            ))}
          </div>
        );

      case QUESTION_TYPES.YES_NO:
        return (
          <div className="flex justify-center space-x-6 mt-6">
            <button
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors ${
                answer === true
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setAnswer(true)}
            >
              Yes
            </button>
            <button
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors ${
                answer === false
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
              onClick={() => setAnswer(false)}
            >
              No
            </button>
          </div>
        );

      case QUESTION_TYPES.DATE:
        return (
          <div className="mt-4">
            <input
              type="date"
              className="w-full p-4 text-xl border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-0 bg-white"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
          </div>
        );

      default:
        return <div>Unsupported question type: {question.type}</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto py-6"
    >
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-2xl font-bold">{question.question}</h2>

        {/* If question is marked as required */}
        {question.validation?.required && (
          <span className="text-red-500 text-sm">* Required</span>
        )}
      </div>

      {renderInput()}

      {/* Show points info */}
      {question.points > 0 && (
        <div className="mt-4 text-right text-sm text-gray-600">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
            {question.points} points
          </span>
        </div>
      )}
    </motion.div>
  );
};

export default QuestionPreview;
