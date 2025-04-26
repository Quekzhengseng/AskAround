"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const SurveyCompletionModal = ({
  isOpen,
  onClose,
  survey,
  userId,
  initialPoints,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Calculate total points from all questions
  const totalSurveyPoints =
    survey?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;

  const finalPoints = initialPoints + totalSurveyPoints;

  // Trigger animation when modal opens
  useEffect(() => {
    if (isOpen) {
      // Start animations
      setIsAnimating(true);

      // After a short delay, show confetti
      setTimeout(() => {
        setShowConfetti(true);
      }, 800);

      // Close modal after animation completes
      setTimeout(() => {
        onClose();
      }, 3500);
    }
  }, [isOpen, userId, survey, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Confetti overlay */}
        {showConfetti && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
            {Array.from({ length: 100 }).map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  top: "-10%",
                  left: `${Math.random() * 100}%`,
                  opacity: 1,
                  scale: 0.8 + Math.random() * 0.5,
                }}
                animate={{
                  top: "110%",
                  left: `${Math.random() * 100}%`,
                  opacity: [1, 1, 0.8, 0.6, 0.4, 0],
                  rotate: Math.random() * 360,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  ease: "easeOut",
                  delay: Math.random() * 0.5,
                }}
                style={{
                  position: "absolute",
                  width: "8px",
                  height: "8px",
                  borderRadius: Math.random() > 0.5 ? "50%" : "0",
                  backgroundColor: `hsl(${Math.floor(
                    Math.random() * 360
                  )}, 100%, 50%)`,
                }}
              />
            ))}
          </div>
        )}

        <h2 className="text-2xl font-bold text-center mb-6">
          Survey Completed!
        </h2>

        <div className="text-center mb-6">
          <p className="text-gray-600 mb-2">Thank you for your feedback on</p>
          <p className="text-lg font-semibold text-indigo-700">
            {survey?.title}
          </p>
        </div>

        {/* Points display (all at once) */}
        <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg p-6 mb-6 shadow-inner">
          <div className="mb-4 text-center">
            <p className="text-sm text-indigo-600 font-medium">YOUR POINTS</p>
          </div>

          <div className="flex justify-center items-center">
            <div className="bg-white rounded-lg overflow-hidden border-2 border-indigo-300 p-4 text-center">
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <span className="text-4xl font-bold text-indigo-700">
                  {initialPoints}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="mt-2 flex items-center justify-center"
              >
                <span className="text-green-600 font-bold text-2xl">
                  +{totalSurveyPoints}
                </span>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: [0, 1.2, 1], opacity: 1 }}
                  transition={{ delay: 0.9, duration: 0.5 }}
                  className="ml-2 text-yellow-500"
                >
                  <span className="text-2xl">🎉</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2, duration: 0.4 }}
                className="mt-2 pt-2 border-t border-gray-200"
              >
                <span className="text-xl font-bold text-indigo-800">
                  = {finalPoints}
                </span>
              </motion.div>
            </div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8 }}
          className="text-center"
        >
          <p className="text-green-600 font-semibold mb-2">
            Points added successfully!
          </p>
          <p className="text-sm text-gray-500">Returning to main page...</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SurveyCompletionModal;
