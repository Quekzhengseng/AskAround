"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { PaymentAPI } from "./../utils/SurveyAPI";

export default function Payment() {
  const [status, setStatus] = useState("");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check URL parameters to determine payment status
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setStatus("success");

      // Get session_id if available
      const sessionId = query.get("session_id");

      if (sessionId) {
        // Fetch session details from your backend
        fetchSessionDetails(sessionId);
      } else {
        setLoading(false);
      }
    } else if (query.get("canceled")) {
      setStatus("canceled");
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, []);

  // Function to fetch session details
  const fetchSessionDetails = async (sessionId) => {
    try {
      // You'd need to create this endpoint on your backend
      const response = await PaymentAPI.getSession(sessionId);

      if (response.ok) {
        const data = await response.json();
        setOrderDetails(data);
      } else {
        console.error("Error fetching session details");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // Success message component
  const SuccessMessage = () => (
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

      <div className="bg-gray-50 p-4 rounded-md text-left mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Order Summary</h3>

        {orderDetails ? (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Product:</span>
              <span className="font-medium">Survey Credits</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Quantity:</span>
              <span className="font-medium">
                {orderDetails.quantity}{" "}
                {parseInt(orderDetails.quantity) === 1 ? "package" : "packages"}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Credits Added:</span>
              <span className="font-medium">
                {parseInt(orderDetails.quantity) * 10} credits
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">
                ${(orderDetails.amount_total / 100).toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between mb-2">
              <span className="text-gray-500">Product:</span>
              <span className="font-medium">Survey Credits</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Amount:</span>
              <span className="font-medium">Purchase Confirmed</span>
            </div>
          </>
        )}
      </div>

      <Link
        href="/"
        className="block w-full bg-indigo-600 text-white py-2 px-4 rounded-md font-medium hover:bg-indigo-700 transition duration-200"
      >
        Return to Home
      </Link>
    </div>
  );

  // Canceled message component
  const CanceledMessage = () => (
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

  // Default state while loading or if no status
  const DefaultState = () => (
    <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-md text-center">
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
      </div>
      <p className="text-gray-600">Processing your request...</p>
    </div>
  );

  // Render appropriate component based on status
  const renderContent = () => {
    if (loading) {
      return <DefaultState />;
    }

    switch (status) {
      case "success":
        return <SuccessMessage />;
      case "canceled":
        return <CanceledMessage />;
      default:
        return <DefaultState />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {renderContent()}
    </div>
  );
}
