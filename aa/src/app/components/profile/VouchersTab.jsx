// app/profile/components/VouchersTab.jsx
import React from "react";
import Link from "next/link";

export default function VouchersTab({ userData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Available Vouchers
          </h2>
          <p className="text-gray-600">Use your points to redeem vouchers</p>
        </div>
        <div className="bg-indigo-100 px-3 py-1 rounded-full">
          <p className="text-indigo-700 font-medium">
            {userData.points || 0} Points Available
          </p>
        </div>
      </div>

      {/* Placeholder for vouchers */}
      <div className="text-center py-12">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-12 w-12 mx-auto text-gray-400 mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-2.5 1.1l-.9.9a4 4 0 00-1.1 2.5V8m5.6-4H12"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v13m0-13V6a4 4 0 014-4h.2a4 4 0 012.5 1.1l.9.9a4 4 0 011.1 2.5V8m-5.7-4H12"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          No vouchers available
        </h3>
        <p className="text-gray-600 mb-4">
          Complete more surveys to earn points and unlock vouchers
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          Take more surveys
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
}
