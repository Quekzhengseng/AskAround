const estimateTime = (questionCount) => {
  // Roughly 30 seconds per question
  const minutes = Math.ceil((questionCount * 30) / 60);
  return `~${minutes} min`;
};

const SurveyInfo = ({ survey }) => {
  const questionCount = survey.questions.length;
  const totalPoints = survey.questions.reduce(
    (total, q) => total + q.points,
    0
  );
  const timeEstimate = estimateTime(questionCount);

  return (
    <div className="flex justify-between items-center mt-auto text-sm text-gray-500">
      <div className="flex items-center">
        <svg
          className="w-4 h-4 mr-1"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>{questionCount} questions</span>
        <span>&nbsp;/&nbsp;</span>
        <span>{totalPoints} points</span>
      </div>
      <div>{timeEstimate}</div>
    </div>
  );
};

export default SurveyInfo;
