// app/profile/components/Sidebar.jsx
import React from "react";
import Link from "next/link";

export default function Sidebar({
  activeTab,
  setActiveTab,
  userData,
  user,
  loading,
  handleLogout,
  isLoggingOut,
}) {
  // Sidebar navigation items
  const navItems = [
    {
      id: "profile",
      label: "Profile Information",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "questions",
      label: "Saved Questions",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "vouchers",
      label: "Vouchers",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z"
            clipRule="evenodd"
          />
          <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
        </svg>
      ),
    },
    {
      id: "pastSurveys",
      label: "Answered Surveys",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  return (
    <aside className="w-64 bg-white shadow-md fixed h-full">
      {/* Header/Logo */}
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-indigo-600 text-xl font-bold">●</span>
          <span className="font-semibold text-gray-800">AskAround</span>
        </Link>
      </div>

      {/* Profile summary */}
      {!loading && user && (
        <div className="p-4 border-b flex items-center gap-3">
          <div className="bg-indigo-100 p-2 rounded-full">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-indigo-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="truncate">
            <p className="font-medium text-sm text-gray-800">
              {userData.username || user.email}
            </p>
            <p className="text-xs text-gray-500">
              {userData.points || 0} Points
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="py-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left ${
                  activeTab === item.id
                    ? "bg-indigo-50 text-indigo-600 border-r-4 border-indigo-600"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <span
                  className={
                    activeTab === item.id ? "text-indigo-600" : "text-gray-500"
                  }
                >
                  {item.icon}
                </span>
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}

          {/* Logout option */}
          <li className="mt-4 px-4">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg"
            >
              {isLoggingOut ? (
                <div className="w-5 h-5 border-2 border-red-600 rounded-full border-t-transparent animate-spin"></div>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V7.414l-5-5H3zm7 5a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L12 13.586V8a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">
                {isLoggingOut ? "Signing out..." : "Sign Out"}
              </span>
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
