import Link from "next/link";
import SurveyInfo from "./SurveyInfo";

const SurveyCard = ({ survey, index }) => {
  const gradientClass =
    index % 3 === 0
      ? "from-purple-500 to-indigo-600"
      : index % 3 === 1
      ? "from-blue-500 to-cyan-600"
      : "from-pink-500 to-rose-600";

  return (
    <Link href={`/survey?id=${survey.survey_id}`} className="block h-full">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col">
        <div
          className={`bg-gradient-to-br ${gradientClass} px-6 py-5 text-white`}
        >
          <h3 className="font-medium text-xl truncate">
            {survey.title || survey.id}
          </h3>
        </div>

        <div className="p-6 flex-grow flex flex-col">
          <p className="text-gray-600 mb-6 line-clamp-3 flex-grow">
            {survey.description}
          </p>

          <SurveyInfo survey={survey} />

          <button className="mt-5 w-full bg-white border border-gray-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-800 font-medium rounded-lg py-2.5 px-4 transition-all duration-200 flex items-center justify-center group">
            Start Survey
            <svg
              className="ml-2 w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default SurveyCard;
