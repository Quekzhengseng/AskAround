// app/profile/components/ProfileTab.jsx
import React from "react";

export default function ProfileTab({ userData }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">User Details</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Username</h3>
            <p className="text-gray-800 font-medium mt-1">
              {userData.username || "Not set"}
            </p>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
            <p className="text-gray-800 font-medium mt-1">{userData?.email}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Account ID</h3>
            <p className="text-gray-800 font-medium mt-1">{userData?.UID}</p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-500">
              Points Balance
            </h3>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              {userData.points || 0}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Survey Statistics
            </h3>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Answered</p>
                <p className="text-lg font-bold text-gray-700">
                  {userData.answered_surveys?.length || 0}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-bold text-gray-700">
                  {userData.to_be_answered_surveys?.length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
