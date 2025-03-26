"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { sampleSurvey } from "@/app/lib/dummyData";

const SurveyContainer = ({ survey }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  
  const handleNext = () => {
    if (isLastQuestion) {
      setCurrentQuestionIndex(0);
    }
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const setAnswer = (value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 @container rounded-xl">
      {sampleSurvey.title}
      <div className="mb-8">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={survey.questions.length}
        />
      </div>
      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          answer={answers[currentQuestion.id] || ""}
          setAnswer={setAnswer}
          onNext={handleNext}
        />
      </AnimatePresence>
      {currentQuestionIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="mt-4 text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-transform hover:-translate-x-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Previous question
        </button>
      )}
    </div>
  );
};

export default SurveyContainer;
