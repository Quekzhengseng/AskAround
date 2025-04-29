"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UserAPI, VoucherAPI } from "../utils/SurveyAPI";
import { UseAuth } from "./../utils/hooks/UseAuth";

export default function Profile() {
  // State management
  const [savedVouchers, setSavedVouchers] = useState([]);
  const { userData } = UseAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch saved questions using the API directly
  useEffect(() => {
    if (!userData) return; // Don't fetch if no user

    async function initializeData() {
      try {
        setLoading(true);
        const voucherData = await VoucherAPI.getVoucher();
        setSavedVouchers(voucherData);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initializeData();
  }, [userData]);

  const claimVoucher = async (index) => {
    console.log("Voucher claimed: ", index);
  };

  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40 py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Vouchers</h1>
          <Link
            href="/"
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z"
                clipRule="evenodd"
              />
            </svg>
            Back to Survey
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-purple-400 rounded-full border-t-transparent animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
            <p>Error loading profile: {error}</p>
          </div>
        ) : (
          <div className="flex flex-col space-y-6">
            {/* First Row - User Info */}
            <div className="p-4">
              <div className="bg-white rounded-xl shadow-md p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">
                  User Info
                </h2>
                <p className="text-gray-600">
                  <span className="font-medium">Username:</span>{" "}
                  {userData.username}
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Points:</span> {userData.points}
                </p>
              </div>
            </div>

            {/* Second Row - Marketplace Vouchers */}
            <div className="p-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Marketplace Vouchers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedVouchers.map((item, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    <div className="bg-purple-100 px-4 py-3 flex justify-between items-center">
                      <h3 className="font-medium text-purple-800">
                        Voucher #{index + 1}
                      </h3>
                      <button
                        onClick={() => claimVoucher(index)}
                        className="text-green-500 hover:text-green-700 transition-colors duration-300"
                        aria-label="Claim Voucher"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          {/* Shopping Bag SVG Path */}
                          <path d="M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" />
                          <path d="M8 8V5a3 3 0 016 0v3" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-4">
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Voucher Name:
                        </h4>
                        <p className="text-gray-800">{item.name}</p>
                      </div>
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-500 mb-1">
                          Points Required:
                        </h4>
                        <p className="text-gray-800">{item.points}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bought Vouchers */}
            {/* Used Vouchers */}
          </div>
        )}
      </div>
    </div>
  );
}
