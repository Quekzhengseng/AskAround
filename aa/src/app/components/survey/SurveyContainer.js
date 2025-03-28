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
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [addedQuestionIds, setAddedQuestionIds] = useState({});

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  // Check if current question has an answer
  const hasAnswer = Boolean(answers[currentQuestion.id]);

  // Check if current question has already been added
  const isAlreadyAdded = Boolean(addedQuestionIds[currentQuestion.id]);

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

  const ShowAddable = ({ condition, question, answer, questionId }) => {
    if (condition) {
      // Determine button state based on whether question has been answered and added
      const isDisabled = !answer || isAlreadyAdded;

      let buttonText = "Answer Question to Add";
      if (answer && isAlreadyAdded) {
        buttonText = "Question Already Added";
      } else if (answer) {
        buttonText = "Add Question";
      }

      return (
        <button
          onClick={() => {
            handleAdd(question, answer, questionId);
          }}
          disabled={isDisabled}
          className={`mx-auto px-4 py-2 rounded-lg transition-all duration-300 flex justify-center items-center ${
            answer && !isAlreadyAdded
              ? "bg-green-500 hover:bg-green-600 text-white cursor-pointer"
              : isAlreadyAdded
              ? "bg-blue-100 text-blue-500 cursor-not-allowed"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {buttonText}
        </button>
      );
    } else {
      return null;
    }
  };

  const handleAdd = (question, answer, questionId) => {
    setAddedQuestions([...addedQuestions, { question, answer, questionId }]);
    // Mark this question as added
    setAddedQuestionIds((prev) => ({
      ...prev,
      [questionId]: true,
    }));
    setShowAddNotification(true);
  };

  useEffect(() => {
    localStorage.setItem("questions", JSON.stringify(addedQuestions));
    console.log(addedQuestions);
  }, [addedQuestions]);

  // Hide achievement animation after it completes
  useEffect(() => {
    if (showAchievement) {
      const timer = setTimeout(() => {
        setShowAchievement(false);
      }, 2000); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [showAchievement]);

  // Hide add notification after it completes
  useEffect(() => {
    if (showAddNotification) {
      const timer = setTimeout(() => {
        setShowAddNotification(false);
      }, 3000); // Notification duration

      return () => clearTimeout(timer);
    }
  }, [showAddNotification]);

  // Load previously saved questions from localStorage on mount
  useEffect(() => {
    try {
      const savedQuestions = localStorage.getItem("questions");
      if (savedQuestions) {
        const parsedQuestions = JSON.parse(savedQuestions);
        setAddedQuestions(parsedQuestions);

        // Build an object of added question IDs for tracking
        const addedIds = {};
        parsedQuestions.forEach((item) => {
          if (item.questionId) {
            addedIds[item.questionId] = true;
          }
        });
        setAddedQuestionIds(addedIds);
      }
    } catch (error) {
      console.error("Failed to load questions from localStorage:", error);
    }
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 @container rounded-xl relative">
      {survey.title}
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
        />
      </AnimatePresence>

      <ShowAddable
        condition={currentQuestion.addable}
        question={currentQuestion.question}
        answer={answers[currentQuestion.id] || ""}
        questionId={currentQuestion.id}
      />

      <div className="flex justify-between mt-6">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-transform hover:-translate-x-1"
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

        <button
          onClick={handleNext}
          className="ml-auto text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-transform hover:translate-x-1"
        >
          Next question
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
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Add Success Notification */}
      <AnimatePresence>
        {showAddNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-lg z-50 flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Question successfully added!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SurveyContainer;
