import React from "react";

const ProgressBar = ({ currentQuestion, totalQuestions }) => {
  const progress = (currentQuestion / totalQuestions) * 100;

  return (
    <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full bg-blue-500 transition-all duration-500 ease-[var(--ease-snappy)]"
        style={{ width: `${progress}%` }}
      ></div>
      <div className="mt-2 text-xs text-gray-500 text-right">
        {currentQuestion} of {totalQuestions}
      </div>
    </div>
  );
};

export default ProgressBar;
