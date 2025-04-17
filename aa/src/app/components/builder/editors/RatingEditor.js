// src/app/components/survey/builder/editors/RatingEditor.js
import React from "react";
import BaseEditor from "./BaseEditor";
import NumberInput from "../../common/NumberInput";
import TextInput from "../../common/TextInput";

const RatingEditor = ({ question, onChange }) => {
  const updateScale = (value) => {
    const scale = parseInt(value, 10);
    if (!isNaN(scale) && scale >= 2 && scale <= 10) {
      onChange({ ...question, scale });
    } else if (value === "") {
      onChange({ ...question, scale: undefined }); // Allow clearing
    }
  };

  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Rating */}
      <NumberInput
        id={`rating-scale-${question.id}`}
        label="Rating Scale (2-10)"
        value={question.scale || ""} // Use empty string if undefined for input control
        onChange={(e) => updateScale(e.target.value)}
        min="2"
        max="10"
        className="w-20"
        placeholder="5"
      />

      {/* Rating Preview */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preview
        </label>
        <div className="flex flex-wrap gap-2">
          {[...Array(question.scale || 5)].map((_, i) => (
            <div
              key={i}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-700 font-medium"
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Add Labels to Advanced Section */}
      <div className="pt-4 border-t border-gray-100 space-y-4">
        <TextInput
          id={`low-label-${question.id}`}
          label="Low Rating Label (optional)"
          value={question.lowLabel || ""}
          onChange={(e) => onChange({ ...question, lowLabel: e.target.value })}
          placeholder="e.g., Poor"
        />
        <TextInput
          id={`high-label-${question.id}`}
          label="High Rating Label (optional)"
          value={question.highLabel || ""}
          onChange={(e) => onChange({ ...question, highLabel: e.target.value })}
          placeholder="e.g., Excellent"
        />
      </div>
    </BaseEditor>
  );
};

export default RatingEditor;
