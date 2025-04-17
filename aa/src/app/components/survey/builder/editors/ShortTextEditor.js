// src/app/components/survey/builder/editors/ShortTextEditor.js
import React from "react";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput";
import NumberInput from "../../common/NumberInput"; // Only for max length

const ShortTextEditor = ({ question, onChange }) => {

  // Helper to update nested validation property
   const handleValidationChange = (key, value) => {
      onChange({
        ...question,
        validation: {
          ...question.validation,
          [key]: value === "" ? undefined : value, // Store undefined if empty
        },
      });
    };

  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Short Text */}
      <TextInput
        id={`placeholder-${question.id}`}
        label="Placeholder Text"
        value={question.placeholder || ""}
        onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
        placeholder="Enter placeholder text"
      />

       {/* Add Max Length to Advanced Section (Example of extending Base) */}
       <div className="pt-4 border-t border-gray-100"> {/* Separator */}
         <div className="flex items-center justify-between">
            <label htmlFor={`max-chars-${question.id}`} className="text-sm text-gray-700">
              Maximum Characters (optional)
            </label>
            <NumberInput
              id={`max-chars-${question.id}`}
              value={question.validation?.maxLength || ""}
              onChange={(e) => handleValidationChange("maxLength", parseInt(e.target.value, 10) || undefined)}
              min="1"
              className="w-20 p-1" // Override base style if needed
              placeholder="None"
            />
          </div>
       </div>
    </BaseEditor>
  );
};

export default ShortTextEditor;