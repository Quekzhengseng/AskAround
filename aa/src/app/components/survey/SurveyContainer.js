"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { sampleSurvey } from "@/app/lib/dummyData";

const SurveyContainer = ({ survey }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [achievementCount, setAchievementCount] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  const handleNext = () => {
    if (isLastQuestion) {
      // Increment achievement count when survey is completed
      setAchievementCount((prev) => prev + 1);
      setShowAchievement(true);

      // Reset to first question
      setCurrentQuestionIndex(0);
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
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

  // Hide achievement animation after it completes
  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(false);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [showAchievement]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 @container rounded-xl relative">
      {sampleSurvey.title}
      <div className="mb-8 flex items-center">
        <ProgressBar
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={survey.questions.length}
        />

        {/* Achievement animation */}
        <AnimatePresence>
          {showAchievement && (
            <motion.div
              className="ml-4 font-bold text-amber-500 text-lg"
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: -20 }}
              exit={{ opacity: 0, y: -40 }}
              transition={{ duration: 1 }}
            >
              FIRE {achievementCount}
            </motion.div>
          )}
        </AnimatePresence>
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