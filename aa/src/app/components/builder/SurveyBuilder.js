// src/app/components/survey/builder/SurveyBuilder.js
"use client";

import React, { useState, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { v4 as uuidv4 } from 'uuid';

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

// Helper function at SurveyBuilder level
const getPrecedingQuestions = (allQuestionsInState, currentIndex) => {
  // allQuestionsInState are the question objects from SurveyBuilder's state,
  // each having a unique `id` (UUID) and other properties.
  // currentIndex is the index of the question for which we are getting preceding questions.

  return allQuestionsInState.slice(0, currentIndex).map((q_item, index_in_full_list_also_current_qX_minus_1) => {
 
    const originalIndexInFullList = allQuestionsInState.findIndex(original_q => original_q.id === q_item.id);
    return {
      id: q_item.id, 
      qXId: `q${originalIndexInFullList + 1}`, 
      text: q_item.question,
      type: q_item.type,
      options: q_item.options,
      scale: q_item.scale,
    };
  });
};


const SurveyBuilder = forwardRef(({ existingSurvey }, ref) => {
  const [questions, setQuestions] = useState([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(null);
  const [draggedQuestionIndex, setDraggedQuestionIndex] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [previewQuestionIndex, setPreviewQuestionIndex] = useState(0);

  useEffect(() => {
    console.log("SurveyBuilder initializing/updating from:", existingSurvey);
    const initialRawQuestions = existingSurvey?.questions || []; // These have qX IDs from DB
    const conditionalLogicRules = existingSurvey?.conditional_logic || {}; // Uses qX IDs

    const questionsWithUuidsAndOriginalQX = initialRawQuestions.map((rawQ, index) => ({
      ...rawQ, 
      uniqueBuilderId: rawQ.id && !rawQ.id.startsWith('q_local_') && !rawQ.id.startsWith('q') ? rawQ.id : uuidv4(), 
      originalQXIdFromLoad: `q${index + 1}` // Its qX ID based on loaded order
    }));

    // Step 2: Map conditional logic to use these new uniqueBuilderIds for `depends_on`
    const processedQuestions = questionsWithUuidsAndOriginalQX.map(q => {
      let dependencyData = null;
      const ruleForThisTarget = conditionalLogicRules[q.originalQXIdFromLoad];

      if (ruleForThisTarget && ruleForThisTarget.depends_on) {
        // Find the source question object by its originalQXIdFromLoad
        const sourceQuestionObj = questionsWithUuidsAndOriginalQX.find(
          src_q => src_q.originalQXIdFromLoad === ruleForThisTarget.depends_on
        );

        if (sourceQuestionObj) {
          dependencyData = {
            depends_on: sourceQuestionObj.uniqueBuilderId, // Store the UUID of the source
            condition_type: ruleForThisTarget.condition_type,
            condition_value: ruleForThisTarget.condition_value,
          };
        } else {
          console.warn(`Init: Could not find source question (${ruleForThisTarget.depends_on}) for target ${q.originalQXIdFromLoad}`);
        }
      }
      // The question's own `id` for React key will be uniqueBuilderId.
      // The `id` property from the DB (the qX one) is preserved in `originalQXIdFromLoad` or `q.id`.
      return {
        ...q, // contains original qX 'id' property from DB
        id: q.uniqueBuilderId, // Override 'id' for React keys and internal builder state
        dependency: dependencyData,
      };
    });

    setQuestions(processedQuestions);
    setActiveQuestionIndex(null);
    setPreviewMode(false);
  }, [existingSurvey]);

  useImperativeHandle(ref, () => ({
    addQuestion: (type) => {
      const newQuestion = {
        id: uuidv4(), 
        type: type,
        question: `New ${QUESTION_TYPE_LABELS[type]} Question`,
        points: 5,
        addable: true,
        dependency: null,
        ...(type === QUESTION_TYPES.SINGLE_CHOICE && { options: ["Option 1", "Option 2"] }),
        ...(type === QUESTION_TYPES.MULTIPLE_CHOICE && { options: ["Option 1", "Option 2"] }),
        ...(type === QUESTION_TYPES.RATING && { scale: 5 }),
        ...((type === QUESTION_TYPES.SHORT_TEXT || type === QUESTION_TYPES.LONG_TEXT || type === QUESTION_TYPES.EMAIL) && { placeholder: "Type answer here..." }),
      };
      setQuestions(prev => {
        const updatedQuestions = [...prev, newQuestion];
        setActiveQuestionIndex(updatedQuestions.length - 1);
        return updatedQuestions;
      });
    },
    getCurrentQuestionsState: () => {
      const finalConditionalLogic = {};
      // Questions are already in the correct order in the `questions` state array
      const finalQuestionsArray = questions.map((q_build, index) => {
        const final_q_id_for_db = `q${index + 1}`; // This is the ID for the question itself for DB

        if (q_build.dependency && q_build.dependency.depends_on) {
          // q_build.dependency.depends_on is the unique UUID of the source question
          const sourceQuestionObj = questions.find(src_q => src_q.id === q_build.dependency.depends_on);
          if (sourceQuestionObj) {
            // Find the index of sourceQuestionObj to determine its final qX ID
            const sourceQuestionIndex = questions.indexOf(sourceQuestionObj);
            const final_source_q_id_for_db = `q${sourceQuestionIndex + 1}`;
            
            finalConditionalLogic[final_q_id_for_db] = {
              depends_on: final_source_q_id_for_db,
              condition_type: q_build.dependency.condition_type || 'answerValueIs',
              condition_value: q_build.dependency.condition_value
            };
          } else {
            console.warn("Save: Could not find source question for dependency ID:", q_build.dependency.depends_on);
          }
        }
        // Prepare the question object for saving, removing builder-specific fields
        const { dependency, id, originalQXIdFromLoad, uniqueBuilderId, ...restOfQuestion } = q_build;
        return {
          ...restOfQuestion,
          id: final_q_id_for_db // Save with the final qX ID
        };
      });

      return {
        id: existingSurvey?.id || null, // survey_id from DB if editing
        questions: finalQuestionsArray,
        conditional_logic: finalConditionalLogic
      };
    },
    togglePreviewMode: () => setPreviewMode(prev => !prev),
  }));

  const deleteQuestion = (index) => {
    setQuestions(prev => prev.filter((_, i) => i !== index));
    if (activeQuestionIndex === index) setActiveQuestionIndex(null);
    else if (activeQuestionIndex > index) setActiveQuestionIndex(activeQuestionIndex - 1);
     // TODO: Consider updating dependencies if a question that was a `depends_on` target is deleted.
     // This might involve iterating through all questions and clearing/updating their `dependency.depends_on`
     // if it pointed to the deleted question's ID. For now, it might leave a dangling reference
     // which `getCurrentQuestionsState` would ignore.
  };

  const duplicateQuestion = (index) => {
    if(index < 0 || index >= questions.length) return;
    const questionToDuplicate = {
        ...questions[index],
        id: uuidv4(), // New unique ID for the copy
        question: `${questions[index].question} (Copy)`,
        dependency: null, // Duplicates don't inherit dependency rule by default
    };
    setQuestions(prev => [
        ...prev.slice(0, index + 1),
        questionToDuplicate,
        ...prev.slice(index + 1),
    ]);
    setActiveQuestionIndex(index + 1);
  };

  const updateQuestion = (index, updatedQuestion) => {
    setQuestions(prev => prev.map((q, i) => (i === index ? updatedQuestion : q)));
  };

  const handleDragStart = (index) => setDraggedQuestionIndex(index);
  const handleDragEnd = () => setDraggedQuestionIndex(null);
  const handleDragOver = (index) => {
    if (draggedQuestionIndex === null || draggedQuestionIndex === index) return;
    setQuestions(prev => {
        const newQuestions = [...prev];
        const [removed] = newQuestions.splice(draggedQuestionIndex, 1);
        newQuestions.splice(index, 0, removed);
        // Update active index (simplified, refine if needed)
        if (activeQuestionIndex === draggedQuestionIndex) {
            setActiveQuestionIndex(index);
        } else if (draggedQuestionIndex < activeQuestionIndex && index >= activeQuestionIndex) {
            setActiveQuestionIndex(activeQuestionIndex - 1);
        } else if (draggedQuestionIndex > activeQuestionIndex && index <= activeQuestionIndex) {
            setActiveQuestionIndex(activeQuestionIndex + 1);
        }
        return newQuestions;
    });
    setDraggedQuestionIndex(index);
  };

  const renderQuestionEditor = (question, index) => {
    const EditorComponent = TYPE_TO_EDITOR[question.type];
    const editorProps = {
      questions: questions,
      index: index,
      getPrecedingQuestions: getPrecedingQuestions, // Pass the actual helper function
    };
    return EditorComponent ? (
      <EditorComponent
        question={question} // Contains unique 'id' (UUID), and 'dependency' object
        onChange={(updatedQ) => updateQuestion(index, updatedQ)}
        editorProps={editorProps}
      />
    ) : (
      <div className="p-4 text-red-600 text-sm">Unknown question type: {question.type}</div>
    );
  };

  const activeBorderColor = '#7c3aed';

return (
  <div className="flex flex-col gap-6">
    {previewMode ? (
      <div className="bg-white rounded-lg border border-gray-200/80 p-6 md:p-8 shadow-sm">
        {questions.length > 0 ? (
          <>
            <div className="w-full h-1 bg-gray-200 rounded-full mb-4 overflow-hidden">
              <div
                className="h-full bg-[#7c3aed]"
                style={{
                  width: `${((previewQuestionIndex + 1) / questions.length) * 100}%`,
                }}
              ></div>
            </div>
            <div className="text-xs text-[#9ca3af] text-right mb-6">
              {previewQuestionIndex + 1} of {questions.length}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={previewQuestionIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <QuestionPreview question={questions[previewQuestionIndex]} />
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200/60">
              <button
                onClick={() =>
                  setPreviewQuestionIndex((p) => Math.max(0, p - 1))
                }
                disabled={previewQuestionIndex === 0}
                className="text-sm text-[#4b5563] hover:text-[#111827] disabled:opacity-40"
              >
                ← Previous
              </button>
              {previewQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={() =>
                    setPreviewQuestionIndex((p) =>
                      Math.min(questions.length - 1, p + 1)
                    )
                  }
                  className="text-sm text-[#4b5563] hover:text-[#111827]"
                >
                  Next →
                </button>
              ) : (
                <button
                  onClick={() => setPreviewMode(false)}
                  className="text-sm bg-[#7c3aed] hover:bg-[#5b21b6] text-white py-1.5 px-4 rounded-md"
                >
                  Finish Preview
                </button>
              )}
            </div>
          </>
        ) : (
          <p className="text-center text-[#4b5563] py-10">
            No questions to preview.
          </p>
        )}
      </div>
    ) : (
      <div className="flex-grow min-w-0">
        <h2 className="text-lg font-semibold text-[#111827] mb-4">
          Questions ({questions.length})
        </h2>

        {questions.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-lg bg-white">
            <p className="text-[#4b5563]">
              Add questions using the panel on the left.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={`bg-white rounded-lg border ${
                  activeQuestionIndex === index
                    ? `border-[${activeBorderColor}] shadow-lg`
                    : "border-gray-200/80 hover:border-gray-300"
                }`}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(index);
                }}
                onDragEnd={handleDragEnd}
              >
                <div
                  className="p-3 cursor-pointer flex justify-between items-center"
                  onClick={() =>
                    setActiveQuestionIndex(
                      activeQuestionIndex === index ? null : index
                    )
                  }
                >
                  <div className="flex items-center gap-2 min-w-0 flex-grow">
                    <div className="flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500">
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
                          d="M4 6h16M4 12h16M4 18h16"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-[#4b5563]">
                      {index + 1}.
                    </span>
                    <h3 className="font-medium text-[#111827] text-sm truncate flex-1">
                      {question.question || `Question ${index + 1}`}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                      {QUESTION_TYPE_LABELS[question.type]}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        duplicateQuestion(index);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteQuestion(index);
                      }}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        activeQuestionIndex === index ? "rotate-180" : ""
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>
                </div>

                <AnimatePresence>
                  {activeQuestionIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
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
});
SurveyBuilder.displayName = 'SurveyBuilder';
export default SurveyBuilder;