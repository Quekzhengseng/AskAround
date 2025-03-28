"use client";

import React from "react";
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

const QuestionCard = ({ question, answer, setAnswer, onNext }) => {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && question.type !== QUESTION_TYPES.LONG_TEXT) {
      onNext?.();
    }
  };

  const renderQuestionInput = () => {
    switch (question.type) {
      case QUESTION_TYPES.SHORT_TEXT:
      case QUESTION_TYPES.EMAIL:
        return (
          <input
            type={question.type === QUESTION_TYPES.EMAIL ? "email" : "text"}
            className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent starting:opacity-0 starting:translate-y-4"
            placeholder={question.placeholder || ""}
            value={answer || ""}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        );

      case QUESTION_TYPES.LONG_TEXT:
        return (
          <textarea
            className="w-full p-4 text-xl border-b-2 border-gray-300 focus:border-blue-500 focus:ring-0 bg-transparent min-h-[120px] field-sizing-content"
            placeholder={question.placeholder || ""}
            value={answer || ""}
            onChange={(e) => setAnswer(e.target.value)}
            autoFocus
          />
        );

      case QUESTION_TYPES.SINGLE_CHOICE:
        return (
          <div className="space-y-3 mt-4 @container">
            {question.options.map((option, index) => (
              <div
                key={index}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors @md:hover:scale-102 transform-3d ${
                  answer === option
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => {
                  setAnswer(option);
                  // Auto advance after selection
                  if (onNext) setTimeout(onNext, 500);
                }}
              >
                {option}
              </div>
            ))}
          </div>
        );

      case QUESTION_TYPES.MULTIPLE_CHOICE:
        // Initialize answer as array if not already
        const selectedOptions = Array.isArray(answer) ? answer : [];

        return (
          <div className="space-y-3 mt-4 @container">
            {question.options.map((option, index) => {
              const isSelected = selectedOptions.includes(option);

              return (
                <div
                  key={index}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-colors flex items-center ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 text-blue-900"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => {
                    // Toggle selection
                    if (isSelected) {
                      setAnswer(
                        selectedOptions.filter((item) => item !== option)
                      );
                    } else {
                      setAnswer([...selectedOptions, option]);
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
          </div>
        );

      case QUESTION_TYPES.RATING:
        return (
          <div className="flex justify-center space-x-4 mt-6">
            {[...Array(question.scale)].map((_, i) => (
              <button
                key={i}
                className={`w-14 h-14 rounded-full text-xl font-bold transition-all transform-3d hover:scale-110 hover:rotate-y-6 ${
                  answer === i + 1
                    ? "bg-blue-500 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200"
                }`}
                onClick={() => {
                  setAnswer(i + 1);
                  // Auto advance after selection
                  if (onNext) setTimeout(onNext, 500);
                }}
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
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors transform-3d ${
                answer === true
                  ? "bg-blue-500 text-white rotate-y-1"
                  : "bg-gray-100 hover:bg-gray-200 hover:rotate-y-1"
              }`}
              onClick={() => {
                setAnswer(true);
                if (onNext) setTimeout(onNext, 500);
              }}
            >
              Yes
            </button>
            <button
              className={`px-8 py-3 rounded-lg text-lg font-medium transition-colors transform-3d ${
                answer === false
                  ? "bg-blue-500 text-white rotate-y-1"
                  : "bg-gray-100 hover:bg-gray-200 hover:rotate-y-1"
              }`}
              onClick={() => {
                setAnswer(false);
                if (onNext) setTimeout(onNext, 500);
              }}
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
              value={answer || ""}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={handleKeyDown}
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
      transition={{ duration: 0.5, ease: [0.2, 0, 0, 1] }}
      className="w-full max-w-2xl mx-auto py-10"
    >
      <div className="flex items-start justify-between mb-8">
        <h2 className="text-2xl font-bold font-display">{question.question}</h2>

        {/* Addable indicator */}
        {question.addable && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
            Addable
          </span>
        )}
      </div>

      {renderQuestionInput()}
    </motion.div>
  );
};

export default QuestionCard;
