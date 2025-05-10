"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ToggleSwitch from "./ToggleSwitch";

const Header = () => {
  const pathname = usePathname();
  const showToggle = pathname === "/" || pathname === "/curator";

  return (
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
          {/* Only show ToggleSwitch on specific pages */}
          {showToggle && (
            <ToggleSwitch
              leftOption="Do Surveys"
              rightOption="Create Survey"
              leftPath="/"
              rightPath="/curator"
            />
          )}

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

          {/* Store Link */}
          <Link
            href="/store"
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-indigo-600 transition-colors"
            aria-label="Store"
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
              <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
