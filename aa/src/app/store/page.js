"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Footer from "../components/common/footer";
import Header from "../components/common/header";
import { UseAuth } from "./../utils/hooks/UseAuth";
import { UserAPI } from "./../utils/SurveyAPI";

const CreditStoreDisplay = () => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { userData } = UseAuth();
  const creditPrice = 10.0;
  const totalPrice = creditPrice * quantity;

  // Credit package benefits
  const benefits = [
    "Run surveys with respondents per credit",
    "Access to all question types and templates",
    "Real-time analytics and reporting",
    "Export data in multiple formats",
  ];

  const handleCheckout = async () => {
    try {
      setLoading(true);
      // Get token from wherever you store it (localStorage, context, etc.)
      const token = localStorage.getItem("token");

      const response = await UserAPI.handleCheckout(token, quantity);

      console.log(response);

      // Redirect to Stripe checkout
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col">
      {/* --- Header --- */}
      <Header />

      <main className="container mx-auto px-4 py-12 flex-grow">
        <div className="max-w-3xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Purchase Credits
            </h1>
            <p className="text-gray-600 mt-2">
              Power your research with flexible survey credits
            </p>
          </div>

          {/* Credit Purchase Section */}
          <section className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-blue-500 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Survey Credits</h2>
              <p className="text-indigo-100">
                Get more responses with our flexible credit packages
              </p>
            </div>

            <div className="p-6 md:p-8 md:flex gap-8">
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
                    <h3 className="text-lg font-bold text-gray-900">
                      Survey Credits
                    </h3>
                    <p className="text-gray-600">
                      ${creditPrice.toFixed(2)} per credit package
                    </p>
                  </div>
                </div>

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

                <div className="border-t border-gray-200 pt-5">
                  <p className="text-sm text-gray-500 mb-4">
                    Credits never expire and can be used across any survey
                    project. Need help choosing the right amount?{" "}
                    <a
                      href="#"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Contact our team
                    </a>
                    .
                  </p>
                </div>
              </div>

              <div className="md:w-5/12 mt-6 md:mt-0">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Order Summary
                  </h3>

                  <div className="mb-5">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of credit packages
                    </label>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-l-md hover:bg-gray-200 transition"
                      >
                        <svg
                          className="h-4 w-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M20 12H4"
                          ></path>
                        </svg>
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 text-center py-2 border-t border-b border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => setQuantity(quantity + 1)}
                        className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-r-md hover:bg-gray-200 transition"
                      >
                        <svg
                          className="h-4 w-4 text-gray-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          ></path>
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {quantity} {quantity === 1 ? "package" : "packages"} ={" "}
                      {quantity * 10} survey credits
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-5">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">
                        ${totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-indigo-600 text-white font-medium py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-200 flex items-center justify-center"
                  >
                    <svg
                      className="h-5 w-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    Secure Checkout
                  </button>

                  <div className="flex items-center justify-center mt-4 text-sm text-gray-500">
                    <svg
                      className="h-4 w-4 mr-1 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      ></path>
                    </svg>
                    Secure payment via Stripe
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const Message = ({ message }) => (
  <div className="min-h-screen bg-gradient-to-br from-white to-indigo-50 flex flex-col">
    {/* --- Header --- */}
    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/80">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        {/* Left Section */}
        <div className="flex-1 flex justify-start">
          <Link
            href="/"
            className="font-semibold text-lg text-gray-800 flex items-center"
          >
            <span className="text-indigo-600 mr-2 text-xl">●</span>
            AskAround
          </Link>
        </div>
        {/* Right Section */}
        <div className="flex-1 flex justify-end items-center gap-2">
          {/* Profile Link */}
          <Link
            href="/profile"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            aria-label="Profile"
          >
            <svg
              className="w-5 h-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
          <Link
            href="/voucher"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            aria-label="Go to voucher"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2z" />
              <path d="M12 4v2m0 2v2m0 2v2m0 2v2m0 2v2" />
            </svg>
          </Link>
        </div>
      </div>
    </header>

    <main className="container mx-auto px-4 py-12 flex-grow flex items-center justify-center">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-md">
        {message.includes("success") ? (
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
    </main>

    <footer className="mt-auto bg-gray-50 border-t border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="flex items-center text-gray-800 font-medium">
              <span className="text-indigo-600 mr-2 text-xl">●</span>
              AskAround
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Share your thoughts, shape our future
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AskAround Survey Platform
          </div>
        </div>
      </div>
    </footer>
  </div>
);

export default function CreditStore() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      setMessage(
        "Credits purchased successfully! You can now use these credits for your surveys."
      );
    }

    if (query.get("canceled")) {
      setMessage(
        "Credit purchase canceled. You have not been charged. Please try again when you're ready."
      );
    }
  }, []);

  return (
    <>{message ? <Message message={message} /> : <CreditStoreDisplay />}</>
  );
}
