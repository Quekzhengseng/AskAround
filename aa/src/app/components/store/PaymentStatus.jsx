import React from "react";
import Link from "next/link";

const PaymentStatus = ({ message }) => {
  const isSuccess = message.includes("success");

  return (
    <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md">
      {isSuccess ? (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-green-50 text-green-500 mb-5">
            <svg
              className="w-8 h-8"
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
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Success!</h2>
        </div>
      ) : (
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-amber-50 text-amber-500 mb-5">
            <svg
              className="w-8 h-8"
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
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Payment Canceled
          </h2>
        </div>
      )}

      <p className="text-gray-700 mb-6 text-center">{message}</p>

      <Link
        href="/"
        className="block w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 text-center"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default PaymentStatus;
