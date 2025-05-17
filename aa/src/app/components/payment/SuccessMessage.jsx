import React from "react";
import Link from "next/link";
import OrderSummary from "./OrderSummary";

const SuccessMessage = ({ orderDetails }) => {
  return (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
      <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-green-50 text-green-500 mb-5">
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
            d="M5 13l4 4L19 7"
          ></path>
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        Payment Successful!
      </h2>
      <p className="text-gray-600 mb-6">
        Your order has been processed and credits have been added to your
        account.
      </p>

      <OrderSummary orderDetails={orderDetails} />

      <Link
        href="/"
        className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition duration-200"
      >
        Return to Home
      </Link>
    </div>
  );
};

export default SuccessMessage;
