// ProgressBar.jsx
import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const ProgressBar = ({ currentQuestion, totalQuestions, showPulse }) => {
  const progress = (currentQuestion / totalQuestions) * 100;
  const controls = useAnimation();

  // Effect to animate the progress bar when currentQuestion changes
  useEffect(() => {
    controls.start({
      width: `${progress}%`,
      transition: { duration: 0.6, ease: [0.34, 1.56, 0.64, 1] },
    });
  }, [progress, controls]);

  return (
    <div className="w-full">
      {/* Question counter - simple text display */}
      <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
        <span>
          Question {currentQuestion} of {totalQuestions}
        </span>
        <span>{Math.round(progress)}% Complete</span>
      </div>

      {/* Main progress track - enhanced visual design */}
      <div className="w-full h-4 bg-gray-100 rounded-full shadow-inner overflow-hidden border border-gray-200 relative">
        {/* Animated progress fill */}
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 relative"
          initial={{ width: 0 }}
          animate={controls}
        >
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              className="w-20 h-full bg-white/20 skew-x-12 blur-sm"
              animate={{
                x: ["calc(-100%)", "calc(100% + 500px)"],
              }}
              transition={{
                duration: 2.5,
                ease: "linear",
                repeat: Infinity,
                repeatType: "loop",
              }}
            />
          </div>

          {/* Pulse effect on question completion */}
          {showPulse && (
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ opacity: 0.7 }}
              animate={{
                opacity: 0,
                scale: 1.05,
              }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {/* Current position indicator */}
          <motion.div
            className="absolute top-1/2 right-0 w-3 h-3 bg-white border-2 border-indigo-600 rounded-full shadow-md"
            initial={{ y: "-50%" }}
            animate={{
              y: "-50%",
              scale: showPulse ? [1, 1.3, 1] : 1,
              boxShadow: showPulse
                ? [
                    "0 0 0 0 rgba(79, 70, 229, 0.2)",
                    "0 0 0 6px rgba(79, 70, 229, 0)",
                    "0 0 0 0 rgba(79, 70, 229, 0)",
                  ]
                : "0 1px 3px rgba(0,0,0,0.2)",
            }}
            transition={{ duration: 0.8 }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressBar;
