// src/app/components/survey/builder/SurveyBuilder.js
"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
// Import editors & preview
import MultipleChoiceEditor from "./editors/MultipleChoiceEditor";
import ShortTextEditor from "./editors/ShortTextEditor";
import LongTextEditor from "./editors/LongTextEditor";
import SingleChoiceEditor from "./editors/SingleChoiceEditor";
import RatingEditor from "./editors/RatingEditor";
import YesNoEditor from "./editors/YesNoEditor";
import EmailEditor from "./editors/EmailEditor";
import DateEditor from "./editors/DateEditor";
import QuestionPreview from "./QuestionPreview";

// --- Constants ---
// Export these so the parent can use them if needed (like for the Add Question sidebar)
export const QUESTION_TYPES = {
  SHORT_TEXT: "SHORT_TEXT", LONG_TEXT: "LONG_TEXT", SINGLE_CHOICE: "SINGLE_CHOICE",
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE", RATING: "RATING", YES_NO: "YES_NO",
  EMAIL: "EMAIL", DATE: "DATE",
};
export const QUESTION_TYPE_LABELS = {
  [QUESTION_TYPES.SHORT_TEXT]: "Short Text", [QUESTION_TYPES.LONG_TEXT]: "Long Text",
  [QUESTION_TYPES.SINGLE_CHOICE]: "Single Choice", [QUESTION_TYPES.MULTIPLE_CHOICE]: "Multiple Choice",
  [QUESTION_TYPES.RATING]: "Rating Scale", [QUESTION_TYPES.YES_NO]: "Yes/No",
  [QUESTION_TYPES.EMAIL]: "Email", [QUESTION_TYPES.DATE]: "Date",
};
const TYPE_TO_EDITOR = {
  [QUESTION_TYPES.SHORT_TEXT]: ShortTextEditor, [QUESTION_TYPES.LONG_TEXT]: LongTextEditor,
  [QUESTION_TYPES.SINGLE_CHOICE]: SingleChoiceEditor, [QUESTION_TYPES.MULTIPLE_CHOICE]: MultipleChoiceEditor,
  [QUESTION_TYPES.RATING]: RatingEditor, [QUESTION_TYPES.YES_NO]: YesNoEditor,
  [QUESTION_TYPES.EMAIL]: EmailEditor, [QUESTION_TYPES.DATE]: DateEditor,
};
// --- End Constants ---

// Wrap component with forwardRef to allow parent access via ref
const SurveyBuilder = forwardRef(({ existingSurvey }, ref) => {

  // Internal state for ONLY questions (title/desc managed by parent)
  // And UI interaction state
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  // Initialize/Reset state when existingSurvey prop changes
  useEffect(() => {
    console.log("SurveyBuilder initializing/updating questions from:", existingSurvey);
    setQuestions(existingSurvey?.questions || []); // Only sync questions
    setActiveQuestionIndex(null); // Reset focus
    setPreviewMode(false); // Exit preview mode if the survey changes
  }, [existingSurvey]); // Dependency is the survey prop

  // --- Expose Methods to Parent via Ref ---
  useImperativeHandle(ref, () => ({
    // Method for parent (sidebar) to add a question
    addQuestion: (type) => {
        const newQuestion = {
            // Generate a unique temporary ID for React keys
            id: `q_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            type: type,
            question: `New ${QUESTION_TYPE_LABELS[type]} Question`, // Default prompt
            points: 5, // Default points
            addable: true, // Default addable setting
            // Add minimal required defaults based on type for editors to function
             ...(type === QUESTION_TYPES.SINGLE_CHOICE && { options: ["Option 1", "Option 2"] }),
             ...(type === QUESTION_TYPES.MULTIPLE_CHOICE && { options: ["Option 1", "Option 2"] }),
             ...(type === QUESTION_TYPES.RATING && { scale: 5 }),
             ...((type === QUESTION_TYPES.SHORT_TEXT || type === QUESTION_TYPES.LONG_TEXT || type === QUESTION_TYPES.EMAIL) && { placeholder: "Type answer here..." }),
        };
        setQuestions(prev => {
            const updatedQuestions = [...prev, newQuestion];
            // Automatically activate the newly added question for editing
            setActiveQuestionIndex(updatedQuestions.length - 1);
            return updatedQuestions;
        });
    },
    // Method for parent to get the current questions state for saving
    getCurrentQuestionsState: () => ({
        // Include the original survey ID if we are editing, otherwise null
        id: existingSurvey?.id || null,
        questions: questions
    }),
    // Method for parent (header button) to toggle preview mode
    togglePreviewMode: () => togglePreviewMode(), // Expose internal toggle function
  }));


  // --- Internal Question Management (Modifies internal questions state) ---
  const deleteQuestion = (index) => {
      setQuestions(prev => prev.filter((_, i) => i !== index));
      // Adjust active index if needed
      if (activeQuestionIndex === index) setActiveQuestionIndex(null);
      else if (activeQuestionIndex > index) setActiveQuestionIndex(activeQuestionIndex - 1);
  };
  const duplicateQuestion = (index) => {
      if(index < 0 || index >= questions.length) return; // Bounds check
      const questionToDuplicate = {
          ...questions[index],
          // Generate a new unique local ID
          id: `q_local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          question: `${questions[index].question} (Copy)`,
      };
      setQuestions(prev => [
          ...prev.slice(0, index + 1),
          questionToDuplicate,
          ...prev.slice(index + 1),
      ]);
      // Activate the newly duplicated question
      setActiveQuestionIndex(index + 1);
  };
  const updateQuestion = (index, updatedQuestion) => {
      setQuestions(prev => prev.map((q, i) => (i === index ? updatedQuestion : q)));
  };

  // --- Drag and Drop Handlers (Modify internal questions state) ---
   const handleDragStart = (index) => setDraggedQuestionIndex(index);
   const handleDragEnd = () => setDraggedQuestionIndex(null);
   const handleDragOver = (index) => {
     if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;
     setQuestions(prev => {
         // Basic safety check
         if (draggedQuestionIndex < 0 || draggedQuestionIndex >= prev.length) return prev;

         const newQuestions = [...prev];
         const [removed] = newQuestions.splice(draggedQuestionIndex, 1);
         newQuestions.splice(index, 0, removed);

         // Update active index intelligently
         let newActiveIndex = activeQuestionIndex;
         if (activeQuestionIndex === draggedQuestionIndex) { // If dragging the active item
             newActiveIndex = index;
         } else if (draggedQuestionIndex < activeQuestionIndex && index >= activeQuestionIndex) { // Dragged from above to below/at active
             newActiveIndex = activeQuestionIndex - 1;
         } else if (draggedQuestionIndex > activeQuestionIndex && index <= activeQuestionIndex) { // Dragged from below to above/at active
             newActiveIndex = activeQuestionIndex + 1;
         }

         setActiveQuestionIndex(newActiveIndex);
         setDraggedQuestionIndex(index); // Update the index being currently dragged over
         return newQuestions;
     });
   };

   // --- Preview Mode Handlers (Internal) ---
   const togglePreviewMode = () => { setPreviewMode(!previewMode); setPreviewQuestionIndex(0); };
   const previewNextQuestion = () => { if (previewQuestionIndex < questions.length - 1) setPreviewQuestionIndex(previewQuestionIndex + 1); };
   const previewPreviousQuestion = () => { if (previewQuestionIndex > 0) setPreviewQuestionIndex(previewQuestionIndex - 1); };

  // --- Render Editor ---
  const renderQuestionEditor = (question, index) => {
    const EditorComponent = TYPE_TO_EDITOR[question.type];
    return EditorComponent ? (
        <EditorComponent
            question={question}
            onChange={(updatedQ) => updateQuestion(index, updatedQ)}
        />
    ) : (
        <div className="p-4 text-red-600 text-sm">Unknown question type: {question.type}</div>
    );
  };

  // --- Styling Constants ---
  const activeBorderColor = '#7c3aed'; // Purple
  const focusRingColor = 'rgba(124, 58, 237, 0.5)'; // Purple focus ring

  // --- Component Render ---
  // Renders only the question list section or the preview section
  return (
    <div className="flex flex-col gap-6">
        {/* --- RENDER PREVIEW OR BUILDER LIST --- */}
         {previewMode ? (
             // --- Preview Mode UI ---
             <div className="bg-white rounded-lg border border-gray-200/80 p-6 md:p-8 shadow-sm">
                 {/* Title/Desc for preview context - Get from internal state if needed, or maybe parent passes them? */}
                 {/* Assuming parent passes title/desc as props IF needed in preview */}
                 {/* <h2 className="text-xl font-semibold ...">{currentTitle || "Preview"}</h2> */}
                 {/* <p className="text-sm ...">{currentDescription || ""}</p> */}

                 {questions.length > 0 ? (
                    <>
                      {/* Progress Bar & Index */}
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden"><div className="h-full bg-[#7c3aed]" style={{ width: `${((previewQuestionIndex + 1) / questions.length) * 100}%` }}></div></div>
                      <div className="text-xs text-[#9ca3af] text-right mb-6">{previewQuestionIndex + 1} of {questions.length}</div>
                      {/* Question Preview Component */}
                      <AnimatePresence mode="wait">
                          <motion.div key={previewQuestionIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                              <QuestionPreview question={questions[previewQuestionIndex]} />
                          </motion.div>
                      </AnimatePresence>
                      {/* Preview Navigation */}
                      <div className="flex justify-between mt-8 pt-6 border-t border-gray-200/60">
                           <button onClick={previewPreviousQuestion} disabled={previewQuestionIndex === 0} className="text-sm text-[#4b5563] hover:text-[#111827] disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1">← Previous</button>
                           {previewQuestionIndex < questions.length - 1 ? (
                               <button onClick={previewNextQuestion} className="text-sm text-[#4b5563] hover:text-[#111827] flex items-center gap-1">Next →</button>
                           ) : (
                               // Use internal toggle function
                               <button onClick={togglePreviewMode} className="text-sm bg-[#7c3aed] hover:bg-[#5b21b6] text-white py-1.5 px-4 rounded-md transition-colors">Finish Preview</button> // purple
                           )}
                      </div>
                    </>
                 ) : (
                     <p className="text-center text-[#4b5563] py-10">No questions added to preview.</p> // text-secondary
                 )}
             </div>
          ) : (
             // --- Builder Mode UI (Questions List Only) ---
             <div className="flex-grow min-w-0">
                 {/* Header for the questions section */}
                 <h2 className="text-lg font-semibold text-[#111827] mb-4">
                     Questions ({questions.length})
                 </h2>
                 {/* Empty State or Question List */}
                 {questions.length === 0 ? (
                     <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                        <p className="text-[#4b5563]">Add questions using the panel on the left.</p> {/* text-secondary */}
                     </div>
                 ) : (
                     <div className="space-y-3">
                        {/* Map over internal questions state */}
                        {questions.map((question, index) => (
                            <div
                                key={question.id || `q-fallback-${index}`} // Use local ID as key
                                className={`bg-white rounded-lg border transition-all duration-150 ${
                                    activeQuestionIndex === index
                                        ? `border-[${activeBorderColor}] shadow-lg` // purple border
                                        : "border-gray-200/80 hover:border-gray-300 hover:shadow-sm"
                                }`}
                                draggable onDragStart={() => handleDragStart(index)} onDragOver={(e) => { e.preventDefault(); handleDragOver(index); }} onDragEnd={handleDragEnd}
                              >
                                {/* Question Header */}
                                <div
                                    className="p-3 cursor-pointer flex justify-between items-center gap-2"
                                    onClick={() => setActiveQuestionIndex(activeQuestionIndex === index ? null : index)}
                                >
                                    {/* Left side: Drag handle, index, question text */}
                                    <div className="flex items-center gap-2 min-w-0 flex-grow">
                                         <div className="flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 active:cursor-grabbing" title="Drag to reorder">
                                             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                                         </div>
                                         <span className="text-sm font-medium text-[#4b5563] flex-shrink-0">{index + 1}.</span>
                                         <h3 className="font-medium text-[#111827] text-sm break-words flex-1 mr-2">{question.question || `Question ${index + 1}`}</h3>
                                     </div>
                                     {/* Right side: Type label, actions, expand arrow */}
                                     <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                                         <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">
                                           {QUESTION_TYPE_LABELS[question.type]}
                                         </span>
                                         <button onClick={(e) => { e.stopPropagation(); duplicateQuestion(index); }} className="p-1 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-100" title="Duplicate">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                         </button>
                                         <button onClick={(e) => { e.stopPropagation(); deleteQuestion(index); }} className="p-1 text-gray-400 hover:text-red-600 rounded hover:bg-red-100" title="Delete">
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                         </button>
                                         <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 transition-transform ${activeQuestionIndex === index ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                                     </div>
                                </div>
                                {/* Expanded Editor Area (Animated) */}
                                <AnimatePresence>
                                    {activeQuestionIndex === index && (
                                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2, ease: "easeInOut" }} className="overflow-hidden">
                                            <div className="px-4 pb-4 pt-3 border-t border-gray-200/60">
                                                {renderQuestionEditor(question, index)}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                     </div>
                 )}
             </div>
          )}
    </div>
  );
}); // End of forwardRef

SurveyBuilder.displayName = 'SurveyBuilder'; // Add display name for DevTools

export default SurveyBuilder;