"use client";

import React from "react";
import SurveyContainer from "./components/survey/SurveyContainer";
import { sampleSurvey } from "./lib/dummyData";

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-135/oklch from-white via-purple-50 to-blue-100/40">
      <main className="container mx-auto px-4 py-12">
        <header className="text-center mb-12 perspective-distant">
          <h1 className="text-4xl font-bold mb-2 font-display transform-3d hover:rotate-x-2 transition-transform duration-300">
            AskAround
          </h1>
          <p className="text-gray-600">
            Survey Platform for Data Curators and Data Providors
          </p>
        </header>

        <SurveyContainer survey={sampleSurvey} />
      </main>

      <footer className="py-6 text-center text-gray-500 text-sm">
        © {new Date().getFullYear()} Your Survey Platform
      </footer>
    </div>
  );
}
