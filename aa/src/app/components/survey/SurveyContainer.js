"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import QuestionCard from "./QuestionCard";
import ProgressBar from "./ProgressBar";
import { UserAPI } from "../../utils/surveyAPI";

const SurveyContainer = ({ survey, userId, onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [achievementCount, setAchievementCount] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [showAddNotification, setShowAddNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [points, setPoints] = useState(0);
  const [showPointsAnimation, setShowPointsAnimation] = useState(false);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);

  // Fetch initial user data to get starting points
  useEffect(() => {
    async function initializeUserData() {
      if (!userId) return;

      try {
        setIsLoadingInitialData(true);
        const userData = await UserAPI.getAnsweredQuestions(userId);

        if (userData && typeof userData.points === "number") {
          setPoints(userData.points);
        }
      } catch (err) {
        console.error("Error fetching initial user data:", err);
        // Don't set error state as this isn't critical for the survey to function
      } finally {
        setIsLoadingInitialData(false);
      }
    }

    initializeUserData();
  }, [userId]);

  // Make sure we have questions
  if (!survey || !survey.questions || survey.questions.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-8 @container rounded-xl">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-yellow-800 font-medium">Survey Unavailable</h3>
          <p className="text-yellow-700">
            This survey has no questions or is not properly configured.
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = survey.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === survey.questions.length - 1;

  // Check if current question has an answer
  const hasAnswer = Boolean(answers[currentQuestion.id]);

  const handleNext = async () => {
    // Save the current answer to the API
    if (hasAnswer && currentQuestion.addable) {
      await saveCurrentAnswer();
    }

    // Show the points animation immediately
    if (currentQuestion.points) {
      setShowPointsAnimation(true);
    }

    // Add points after answering a question
    await addPoints();

    if (isLastQuestion) {
      await submitSurvey();
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const addPoints = async () => {
    try {
      const response = await UserAPI.changePoints(
        userId,
        survey.id,
        currentQuestion.id
      );

      if (response && typeof response.points === "number") {
        setPoints(response.points);
      }
    } catch (err) {
      console.error("Error changing points:", err);
    }
  };

  useEffect(() => {
    console.log("Updated points:", points);
  }, [points]);

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

  const saveCurrentAnswer = async () => {
    // Only save if we have an answer and a user ID
    if (!answers[currentQuestion.id] || !userId) return;

    try {
      // Save the answer for this specific question to the API
      await UserAPI.addQuestionResponse(
        userId,
        currentQuestion["question"],
        answers[currentQuestion.id]
      );
      // No need to show notification for regular answer saving
    } catch (err) {
      console.error("Error saving answer:", err);
      // We don't stop the flow even if saving fails, but we log it
    }
  };

  const submitSurvey = async () => {
    if (!userId) {
      console.error("Cannot submit survey: No user ID provided");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save final answer if needed
      if (hasAnswer && currentQuestion.addable) {
        await saveCurrentAnswer();
      }

      // Mark the survey as completed in the user's profile
      await UserAPI.moveToAnsweredSurveys(userId, survey.id);

      // Show achievement animation
      setAchievementCount((prev) => prev + 1);
      setShowAchievement(true);

      // Mark survey as completed
      setSurveyCompleted(true);

      // Call onComplete callback after a delay to show achievement
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2500);
    } catch (err) {
      console.error("Error submitting survey:", err);
      setError("There was a problem submitting your survey. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

  // Hide points animation after it completes
  useEffect(() => {
    if (showPointsAnimation) {
      const timer = setTimeout(() => {
        setShowPointsAnimation(false);
      }, 1500); // Animation duration

      return () => clearTimeout(timer);
    }
  }, [showPointsAnimation]);

  // Hide add notification after it completes
  useEffect(() => {
    if (showAddNotification) {
      const timer = setTimeout(() => {
        setShowAddNotification(false);
      }, 3000); // Notification duration

      return () => clearTimeout(timer);
    }
  }, [showAddNotification]);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8 @container rounded-xl relative">
      {/* Points counter with animation */}
      <div className="absolute top-4 right-4 bg-green-100 text-green-700 font-semibold px-4 py-2 rounded-lg shadow">
        {isLoadingInitialData ? (
          <span className="flex items-center">
            Loading points...
            <svg
              className="animate-spin ml-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
          </span>
        ) : (
          <span>Points: {points}</span>
        )}

        {/* Points animation - positioned absolutely so it doesn't affect layout */}
        <AnimatePresence>
          {showPointsAnimation && currentQuestion.points > 0 && (
            <motion.div
              className="absolute top-0 left-full ml-2 text-green-600 font-bold text-lg"
              initial={{ opacity: 0, y: 0, scale: 0.8 }}
              animate={{ opacity: 1, y: -15, scale: 1.2 }}
              exit={{ opacity: 0, y: -30, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            >
              +{currentQuestion.points}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <h2 className="text-2xl font-bold mb-4">{survey.title}</h2>

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

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <AnimatePresence mode="wait">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          answer={answers[currentQuestion.id] || ""}
          setAnswer={setAnswer}
        />
      </AnimatePresence>

      <div className="flex justify-between mt-6">
        {currentQuestionIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-transform hover:-translate-x-1"
            disabled={isSubmitting}
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
          disabled={isSubmitting}
          className="ml-auto text-gray-500 hover:text-gray-700 flex items-center gap-2 transition-transform hover:translate-x-1"
        >
          {isSubmitting ? (
            <>
              <span className="mr-2">Submitting...</span>
              <svg
                className="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
            </>
          ) : (
            <>
              {isLastQuestion ? "Submit Survey" : "Next question"}
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
            </>
          )}
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
