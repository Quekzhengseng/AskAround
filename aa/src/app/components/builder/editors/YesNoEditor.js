// src/app/components/survey/builder/editors/YesNoEditor.js
import React from "react";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput";

const YesNoEditor = ({ question, onChange }) => {
  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Yes/No */}
      <div className="grid grid-cols-2 gap-4">
        <TextInput
          id={`yes-label-${question.id}`}
          label='"Yes" Label (optional)'
          value={question.yesLabel || ""}
          onChange={(e) => onChange({ ...question, yesLabel: e.target.value })}
          placeholder="Yes"
        />
        <TextInput
          id={`no-label-${question.id}`}
          label='"No" Label (optional)'
          value={question.noLabel || ""}
          onChange={(e) => onChange({ ...question, noLabel: e.target.value })}
          placeholder="No"
        />
      </div>

      {/* Preview */}
      <div className="mt-2">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Preview
        </label>
        <div className="flex justify-center space-x-6">
          <button className="px-6 py-2 rounded-lg text-lg font-medium bg-gray-100 cursor-default">
            {question.yesLabel || "Yes"}
          </button>
          <button className="px-6 py-2 rounded-lg text-lg font-medium bg-gray-100 cursor-default">
            {question.noLabel || "No"}
          </button>
        </div>
      </div>
    </BaseEditor>
  );
};

export default YesNoEditor;
