import React from "react";
import BenefitsList from "./BenefitsList";

const CreditPackage = ({ creditPrice, benefits }) => {
  return (
    <div className="md:w-7/12">
      <div className="flex items-center mb-6">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Survey Credits</h3>
          <p className="text-gray-600">
            ${creditPrice.toFixed(2)} per credit package
          </p>
        </div>
      </div>

      <BenefitsList benefits={benefits} />

      <div className="border-t border-gray-200 pt-5">
        <p className="text-sm text-gray-500 mb-4">
          Credits never expire and can be used across any survey project. Need
          help choosing the right amount?{" "}
          <a href="#" className="text-indigo-600 hover:text-indigo-500">
            Contact our team
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default CreditPackage;
