// src/app/components/survey/builder/SurveyCreatorPage.js
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import SurveyBuilder, {
  QUESTION_TYPES,
  QUESTION_TYPE_LABELS,
} from "./SurveyBuilder"; // Import constants
import { SurveyAPI } from "../../utils/SurveyAPI"; // For fetching surveys (:5001)
import { SurveyPublisherAPI } from "../../utils/SurveyPublisherAPI"; // For CUD actions (:5002)
import Link from "next/link";
import TextInput from "../common/TextInput"; // Reusable input
import TextArea from "../common/TextArea"; // Reusable textarea

const SurveyCreatorPage = () => {
  // --- State ---
  const [isCreating, setIsCreating] = useState(false); // Controls view: list vs. builder
  const [allSurveys, setAllSurveys] = useState([]); // Surveys for the list view
  const [editingSurvey, setEditingSurvey] = useState(null); // Survey being edited (full object) or null if new

  // State for title/description managed by this parent component
  const [currentTitle, setCurrentTitle] = useState("");
  const [currentDescription, setCurrentDescription] = useState("");

  // Ref to access SurveyBuilder methods
  const surveyBuilderRef = useRef();

  // --- Data Fetching ---
  const fetchAllSurveys = async () => {
    console.log("Fetching all surveys...");
    try {
      const surveys = await SurveyAPI.getAllSurveys();
      console.log("Fetched surveys:", surveys);
      setAllSurveys(surveys || []);
    } catch (err) {
      console.error("Error fetching surveys:", err);
      setAllSurveys([]); // Clear list on error
      alert(
        "Error fetching surveys. Please check the console or try again later."
      );
    }
  };

  // Fetch surveys when mounting or returning to list view
  useEffect(() => {
    if (!isCreating) {
      fetchAllSurveys();
    }
  }, [isCreating]);

  // Sync local title/description state when editingSurvey changes
  // This ensures the inputs are populated when editing starts
  useEffect(() => {
    if (isCreating) {
      setCurrentTitle(editingSurvey?.title || "");
      setCurrentDescription(editingSurvey?.description || "");
    } else {
      // Clear when exiting create mode
      setCurrentTitle("");
      setCurrentDescription("");
    }
  }, [isCreating, editingSurvey]);

  // --- Action Handlers ---

  // Combined handler for saving/updating and potentially publishing
  const triggerSaveOrUpdate = async (isPublishing = false) => {
    if (!surveyBuilderRef.current) {
      console.error("SurveyBuilder ref not available");
      alert("Error: Cannot access survey builder state.");
      return;
    }

    // Get ONLY questions state from SurveyBuilder ref
    const builderState = surveyBuilderRef.current.getCurrentQuestionsState();
    const questions = builderState.questions;

    // Use title/description from the state managed by THIS component
    const titleToSave = currentTitle.trim() || "Untitled Survey"; // Use local state
    const descriptionToSave = currentDescription.trim(); // Use local state

    // --- Validation ---
    if (!titleToSave || titleToSave === "Untitled Survey") {
      alert("Please provide a survey title.");
      document.getElementById("survey-title-main")?.focus();
      return;
    }
    if (isPublishing && (!questions || questions.length === 0)) {
      alert("Add at least one question before publishing.");
      return;
    }
    // --- End Validation ---

    let surveyIdToPublish = editingSurvey?.id || null; // Use original ID if editing
    let successMessage = "";

    try {
      let response;
      // Construct payload using local state + builder state
      const payload = {
        title: titleToSave,
        description: descriptionToSave,
        questions: questions || [],
      };

      if (surveyIdToPublish) {
        // UPDATE existing survey
        console.log(`Updating survey ${surveyIdToPublish}`, payload);
        response = await SurveyPublisherAPI.updateSurvey(
          surveyIdToPublish,
          payload
        );
        successMessage = "Survey updated!";
      } else {
        // CREATE new survey
        console.log("Creating new survey", payload);
        response = await SurveyPublisherAPI.createSurvey(payload);
        surveyIdToPublish = response?.data?.id; // Get the new ID from response
        if (!surveyIdToPublish)
          throw new Error("Create failed: No survey ID returned from API.");
        successMessage = "Survey created!";
      }

      // PUBLISH if requested (and we have an ID)
      if (isPublishing && surveyIdToPublish) {
        console.log(`Publishing survey ${surveyIdToPublish}`);
        // Note: This might fail if backend doesn't have publish columns yet
        await SurveyPublisherAPI.publishSurvey(surveyIdToPublish);
        successMessage = "Survey published!";
      }

      // --- Success ---
      alert(successMessage);
      setIsCreating(false); // Return to list view
      setEditingSurvey(null); // Clear editing state (also clears title/desc via useEffect)
    } catch (err) {
      console.error(
        `Error ${isPublishing ? "publishing" : "saving"} survey:`,
        err
      );
      alert(
        `Error: Could not ${isPublishing ? "publish" : "save"} survey. ${
          err.message
        }`
      );
    }
  };

  // Specific handlers calling the trigger function
  const handlePublishSurvey = () => triggerSaveOrUpdate(true);
  const handleSaveDraft = () => triggerSaveOrUpdate(false);

  // Set state to enter edit mode
  const handleEditSurvey = (survey) => {
    console.log("Setting survey to edit:", survey);
    setEditingSurvey({ ...survey, questions: survey.questions || [] }); // Pass the full object
    setIsCreating(true);
  };

  // Set state to enter create mode
  const handleCreateNewSurvey = () => {
    setEditingSurvey(null); // Signal to SurveyBuilder to use default state
    setIsCreating(true);
  };

  // Delete a survey
  const handleDeleteSurvey = async (surveyId) => {
    if (!confirm("Are you sure you want to permanently delete this survey?"))
      return;
    try {
      await SurveyPublisherAPI.deleteSurvey(surveyId);
      alert("Survey deleted successfully!");
      setIsCreating(false); // Go back to list view, triggers refetch
    } catch (err) {
      console.error("Error deleting survey:", err);
      alert(`Error: Could not delete survey. ${err.message}`);
    }
  };

  // Callback for the "Add Question" sidebar to trigger action in builder
  const handleAddQuestion = useCallback((type) => {
    // Check if ref is mounted before calling
    if (surveyBuilderRef.current) {
      surveyBuilderRef.current.addQuestion(type);
    } else {
      console.error(
        "Attempted to add question before SurveyBuilder ref was ready."
      );
    }
  }, []); // Dependency array is empty as ref doesn't change

  // --- Render Logic ---
  return (
    <div className="min-h-screen bg-[#f9fafb] text-[#111827] font-sans">
      {" "}
      {/* bg-gray-50 text-gray-900 */}
      {/* --- Header --- */}
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-sm border-b border-gray-200/80">
        <div className="container mx-auto px-4 h-16 flex justify-between items-center">
          {/* Left Section */}
          <div className="flex-1 flex justify-start">
            {isCreating ? (
              <button
                onClick={() => {
                  setIsCreating(false);
                  setEditingSurvey(null);
                }}
                className="-ml-2 flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                Surveys
              </button>
            ) : (
              <span className="font-semibold text-lg text-gray-800">
                AskAround
              </span>
            )}
          </div>
          {/* Center Section (Title in List View) */}
          <div className="flex-1 text-center">
            {!isCreating && (
              <h1 className="text-xl font-semibold text-[#111827]">
                Manage Surveys
              </h1>
            )}
          </div>
          {/* Right Section */}
          <div className="flex-1 flex justify-end items-center gap-2">
            {isCreating ? (
              // Actions for Builder View (Save/Publish)
              <div className="flex items-center gap-3">
                {/* Maybe add a Preview button later that calls builderRef.current.togglePreviewMode() */}
                <button
                  onClick={handleSaveDraft}
                  className="text-sm font-medium text-[#4b5563] hover:text-[#111827] px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors" // text-secondary
                >
                  Save Draft
                </button>
                <button
                  onClick={handlePublishSurvey}
                  className="bg-[#7c3aed] hover:bg-[#5b21b6] text-white text-sm font-medium py-1.5 px-4 rounded-md transition-colors shadow-sm hover:shadow" // purple
                >
                  {/* Check original editingSurvey prop for initial state */}
                  {editingSurvey?.is_published
                    ? "Update & Publish"
                    : "Publish Survey"}
                </button>
              </div>
            ) : (
              // Action for List View
              <button
                onClick={handleCreateNewSurvey}
                className="bg-[#7c3aed] hover:bg-[#5b21b6] text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 shadow-sm hover:shadow" // purple colors
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Create Survey
              </button>
            )}
            {/* Profile Link (Always visible) */}
            <Link
              href="/profile"
              className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors"
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
          </div>
        </div>
      </header>
      {/* --- Main Content --- */}
      <main className="container mx-auto px-4 py-8">
        {isCreating ? (
          // --- Builder View ---
          <div className="flex flex-col lg:flex-row gap-8">
            {/* LEFT SIDEBAR: ADD QUESTION */}
            <aside className="w-full lg:w-56 xl:w-64 flex-shrink-0">
              <div className="sticky top-24 space-y-2">
                {" "}
                {/* Adjust top offset based on header height */}
                <h3 className="text-xs font-semibold uppercase text-[#9ca3af] mb-3 px-1">
                  Add Question
                </h3>{" "}
                {/* text-subtle */}
                {Object.entries(QUESTION_TYPES).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => handleAddQuestion(value)} // Calls parent handler which uses ref
                    className={`w-full text-left text-sm px-3 py-2 bg-white border border-gray-200/80 rounded-md hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/50 focus:border-[#7c3aed]`} // purple focus
                  >
                    {QUESTION_TYPE_LABELS[value]}
                  </button>
                ))}
              </div>
            </aside>

            {/* RIGHT MAIN AREA: Title/Desc Inputs + Builder Component */}
            <section className="flex-grow min-w-0">
              {/* Title and Description Inputs managed by this component's state */}
              <div className="mb-6 space-y-4 pb-6 border-b border-gray-200/80">
                <TextInput
                  id="survey-title-main"
                  value={currentTitle} // Bind to local state
                  onChange={(e) => setCurrentTitle(e.target.value)} // Update local state
                  placeholder="Survey Title"
                  // Styling for title input
                  className="text-2xl font-semibold border-0 border-b-2 border-gray-200 focus:border-[#7c3aed] focus:ring-0 px-1 pb-1 w-full" // purple focus
                />
                <TextArea
                  id="survey-description-main"
                  value={currentDescription} // Bind to local state
                  onChange={(e) => setCurrentDescription(e.target.value)} // Update local state
                  placeholder="Type a description (optional)..."
                  rows={2}
                  // Styling for description input
                  className="w-full text-sm text-[#4b5563] border-0 focus:border-gray-300 focus:ring-0 px-1 resize-none mt-1" // text-secondary
                />
              </div>

              {/* Builder Component - only needs the survey data to initialize */}
              <SurveyBuilder
                ref={surveyBuilderRef}
                key={editingSurvey ? editingSurvey.id : "new"} // Force re-render on change
                existingSurvey={editingSurvey} // Pass the initial survey data (or null)
              />
            </section>
          </div>
        ) : (
          // --- List View ---
          <>
            {/* Create button is in the header */}
            {allSurveys.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {allSurveys.map((survey) => (
                  // Survey Card
                  <div
                    key={survey.id}
                    className="bg-white rounded-lg hover:shadow-md transition-shadow duration-200 group flex flex-col border border-gray-200/50 hover:border-[#7c3aed]/40" // purple hover border
                  >
                    {/* Card Content */}
                    <div className="p-4 flex-grow">
                      <h3
                        className="font-medium text-[#111827] truncate mb-1 group-hover:text-[#7c3aed] text-sm"
                        title={survey.title}
                      >
                        {" "}
                        {/* text-main hover:purple */}
                        {survey.title || "Untitled Survey"}
                      </h3>
                      <p className="text-xs text-[#4b5563] mb-3 line-clamp-2 h-8">
                        {" "}
                        {/* text-secondary */}
                        {survey.description || (
                          <span className="italic text-gray-400">
                            No description
                          </span>
                        )}
                      </p>
                      <div className="text-xs text-[#9ca3af] flex justify-between items-center">
                        {" "}
                        {/* text-subtle */}
                        <span>{survey.questions?.length || 0} questions</span>
                        {/* Status Badge */}
                        {survey.hasOwnProperty("is_published") && (
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                              survey.is_published
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {survey.is_published ? "Published" : "Draft"}
                          </span>
                        )}
                      </div>
                    </div>
                    {/* Card Actions (Show on Hover) */}
                    <div className="p-2 bg-gray-50/30 border-t border-gray-100 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        onClick={() => handleEditSurvey(survey)}
                        className="text-xs px-2 py-1 rounded text-blue-600 hover:bg-blue-100 transition-colors"
                        title="Edit Survey"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteSurvey(survey.id)}
                        className="text-xs px-2 py-1 rounded text-red-500 hover:bg-red-100 transition-colors"
                        title="Delete Survey"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // Empty State
              <div className="text-center py-20">
                <svg
                  className="mx-auto h-12 w-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-[#111827]">
                  No surveys yet
                </h3>{" "}
                {/* text-main */}
                <p className="mt-1 text-sm text-[#4b5563]">
                  Create your first survey to get started.
                </p>{" "}
                {/* text-secondary */}
                <div className="mt-6">
                  <button
                    onClick={handleCreateNewSurvey}
                    className="bg-[#7c3aed] hover:bg-[#5b21b6] text-white py-1.5 px-4 rounded-md text-sm font-medium transition-colors"
                  >
                    {" "}
                    Create Survey{" "}
                  </button>{" "}
                  {/* purple */}
                </div>
              </div>
            )}
          </>
        )}
      </main>
      {/* Footer */}
      <footer className="py-6 text-center text-[#9ca3af] text-xs">
        {" "}
        {/* text-subtle */}© {new Date().getFullYear()} AskAround Survey
        Platform
      </footer>
    </div>
  );
};

export default SurveyCreatorPage;
