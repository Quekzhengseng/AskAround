"use client";

import React from "react";
import SurveyContainer from "./components/survey/SurveyContainer";
import { sampleSurvey } from "./lib/dummyData";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40">
      <main className="container mx-auto px-4 py-12">
        <header className="flex justify-between items-center mb-12">
          <div className="flex-1">{/* Empty div for alignment balance */}</div>

          <div className="text-center perspective-distant flex-1">
            <h1 className="text-4xl font-bold mb-2 font-display transform-3d hover:rotate-x-2 transition-transform duration-300">
              AskAround
            </h1>
            <p className="text-gray-600">
              Survey Platform for Data Curators and Data Providors
            </p>
          </div>

          <div className="flex-1 flex justify-end">
            <Link
              href="/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors duration-300"
              aria-label="Go to profile"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-purple-700"
              >
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </Link>
          </div>
        </header>

        <SurveyContainer survey={sampleSurvey} />
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Your Survey Platform
      </footer>
    </div>
  );
}
