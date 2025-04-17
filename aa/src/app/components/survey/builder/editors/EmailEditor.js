// src/app/components/survey/builder/editors/EmailEditor.js
import React from "react";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput";
import ToggleSwitch from "../../common/ToggleSwitch"; // For verify toggle

const EmailEditor = ({ question, onChange }) => {
  // Helper to update nested validation property
  const handleValidationChange = (key, value) => {
    onChange({
      ...question,
      validation: {
        ...question.validation,
        [key]: value,
      },
    });
  };

  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Email */}
      <TextInput
        id={`placeholder-${question.id}`}
        label="Placeholder Text"
        value={question.placeholder || ""}
        onChange={(e) => onChange({ ...question, placeholder: e.target.value })}
        placeholder="e.g., your.email@example.com"
      />

      {/* Add Verify Email Format to Advanced Section */}
      <div className="pt-4 border-t border-gray-100">
         <ToggleSwitch
            id={`verify-email-${question.id}`}
            label="Verify Email Format"
            checked={question.validation?.emailFormat !== false} // Default to true
            onChange={(e) => handleValidationChange("emailFormat", e.target.checked)}
          />
      </div>
    </BaseEditor>
  );
};

export default EmailEditor;