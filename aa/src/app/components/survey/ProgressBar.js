// ProgressBar.jsx
import React from "react";
import { motion } from "framer-motion";

const ProgressBar = ({ currentQuestion, totalQuestions, showPulse }) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full bg-gray-200 rounded-full h-4 relative overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 relative"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Pulse effect on question completion */}
        {showPulse && (
          <motion.div
            className="absolute top-0 right-0 bottom-0 w-full bg-white opacity-70"
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        )}
      </motion.div>

      {/* Progress markers */}
      {Array.from({ length: totalQuestions }).map((_, i) => (
        <div
          key={i}
          className={`absolute top-0 bottom-0 w-2 ${
            i < currentQuestion - 1 ? "bg-transparent" : "bg-white/30"
          }`}
          style={{
            left: `${((i + 1) / totalQuestions) * 100}%`,
            transform: "translateX(-50%)",
          }}
        />
      ))}

      {/* Current position indicator */}
      {currentQuestion < totalQuestions && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 h-6 w-6 bg-white border-2 border-indigo-600 rounded-full shadow-md"
          initial={{ x: "-50%" }}
          animate={{
            x: "-50%",
            scale: showPulse ? 1.2 : 1,
          }}
          transition={{ duration: 0.3 }}
          style={{ left: `${progress}%` }}
        />
      )}
    </div>
  );
};

export default ProgressBar;
