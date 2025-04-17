// src/app/components/survey/builder/editors/DateEditor.js
import React from "react";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput"; // Reusing for date input styling

const DateEditor = ({ question, onChange }) => {
  // Helper to update nested validation property
  const handleValidationChange = (key, value) => {
    onChange({
      ...question,
      validation: {
        ...question.validation,
        [key]: value || undefined, // Store undefined if empty
      },
    });
  };

  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Date - Add min/max date */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <TextInput
          id={`min-date-${question.id}`}
          label="Earliest Date (optional)"
          type="date" // Change input type
          value={question.validation?.minDate || ""}
          onChange={(e) => handleValidationChange("minDate", e.target.value)}
        />
        <TextInput
          id={`max-date-${question.id}`}
          label="Latest Date (optional)"
          type="date" // Change input type
          value={question.validation?.maxDate || ""}
          onChange={(e) => handleValidationChange("maxDate", e.target.value)}
        />
      </div>
    </BaseEditor>
  );
};

export default DateEditor;
