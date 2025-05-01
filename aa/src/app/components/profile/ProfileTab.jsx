// app/profile/components/ProfileTab.jsx
import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function ProfileTab({ userData }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const handleDeleteRequest = () => {
    // Show confirmation dialog
    setShowConfirmation(true);
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    setError(null);

    try {
    } catch (err) {
      console.error("Error deleting account:", err);
      setError(err.message || "Failed to delete account. Please try again.");
      setShowConfirmation(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 relative">
      {/* Main profile content */}
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

      {/* Delete account section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Danger Zone</h3>
        <p className="mt-1 text-sm text-gray-500">
          Permanently delete your account. All points will be lost. This action
          cannot be undone.
        </p>

        {error && (
          <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={handleDeleteRequest}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            disabled={isDeleting || showConfirmation}
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation dialog */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Confirm Account Deletion
            </h3>

            <p className="text-gray-700 mb-6">
              Are you sure you want to delete your account? This action is
              permanent and cannot be undone.
            </p>

            <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>

              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete My Account"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
