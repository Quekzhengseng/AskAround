// src/app/components/survey/builder/editors/BaseEditor.js
import React from "react";
import TextInput from "../../common/TextInput";
import NumberInput from "../../common/NumberInput";
import ToggleSwitch from "../../common/ToggleSwitch"; // Uses arbitrary values internally now

// Helper remains the same
const useValidationChange = (question, onChange) => (key, value) => { /* ... */ };

const BaseEditor = ({ question, onChange, children }) => {
  const handleValidationChange = useValidationChange(question, onChange);
  const activeColor = '#7c3aed'; // Define purple again if needed for focus rings etc.

  return (
    <div className="space-y-5 py-4">
      {/* Question Text */}
      <TextInput
        id={`question-text-${question.id}`}
        label="Question Prompt"
        value={question.question}
        onChange={(e) => onChange({ ...question, question: e.target.value })}
        placeholder="Type your question here..."
        className="text-base font-medium text-[#111827]" // text-main
      />

      {/* Render specific editor fields */}
      {children}

      {/* --- Settings Section --- */}
      <div className="pt-4 mt-4 border-t border-gray-200/80 space-y-4">
          <h3 className="text-xs font-semibold uppercase text-[#9ca3af] mb-3">Options</h3> {/* text-subtle */}

          {/* Required Question Toggle */}
          <ToggleSwitch
            id={`required-${question.id}`}
            label="Required Answer"
            checked={question.validation?.required || false}
            onChange={(e) => handleValidationChange("required", e.target.checked)}
          />

          {/* Points Setting */}
          <div className="flex items-center justify-between">
              <label htmlFor={`points-${question.id}`} className="text-sm text-[#4b5563]"> {/* text-secondary */}
                  Points Awarded
              </label>
              <NumberInput
                 id={`points-${question.id}`}
                 value={question.points ?? 5}
                 onChange={(e) =>
                   onChange({ ...question, points: parseInt(e.target.value, 10) || 0 })
                 }
                 min="0"
                 className="w-16 p-1 text-sm"
              />
          </div>

           {/* Addable Setting */}
           <div className="flex items-center gap-2 pt-2">
               <input
                 id={`addable-${question.id}`}
                 type="checkbox"
                 checked={question.addable ?? true}
                 onChange={(e) => onChange({ ...question, addable: e.target.checked })}
                 // Use arbitrary value for accent color
                 className={`h-4 w-4 text-[${activeColor}] focus:ring-[${activeColor}]/50 border-gray-300 rounded`}
               />
               <label htmlFor={`addable-${question.id}`} className="text-sm text-[#4b5563]"> {/* text-secondary */}
                 Allow users to save question
               </label>
          </div>

           <div data-role="advanced-settings-placeholder"></div>
      </div>
    </div>
  );
};

export default BaseEditor;