import React from "react";
import Link from "next/link";

const CanceledMessage = () => {
  return (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
      <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-500 mb-5">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          ></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Canceled
      </h2>
      <p className="text-gray-600 mb-6">
        Your payment was canceled and you have not been charged. Feel free to
        try again when you're ready.
      </p>

      <div className="space-y-3">
        <Link
          href="/store"
          className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition duration-200"
        >
          Try Again
        </Link>
        <Link
          href="mailto:support@example.com"
          className="block w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-50 transition duration-200"
        >
          Contact Support
        </Link>
      </div>
    </div>
  );
};

export default CanceledMessage;
