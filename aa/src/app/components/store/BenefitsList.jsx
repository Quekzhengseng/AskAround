import React from "react";

const BenefitsList = ({ benefits }) => {
  return (
    <div className="mb-6">
      <h4 className="font-medium text-gray-900 mb-3">
        Each credit package includes:
      </h4>
      <ul className="space-y-2">
        {benefits.map((benefit, index) => (
          <li key={index} className="flex items-start">
            <svg
              className="h-5 w-5 text-green-500 mr-2 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span className="text-gray-600">{benefit}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsList;
