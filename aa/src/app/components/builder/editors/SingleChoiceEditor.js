// src/app/components/survey/builder/editors/SingleChoiceEditor.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput";
import ToggleSwitch from "../../common/ToggleSwitch";

const SingleChoiceEditor = ({ question, onChange }) => {
  const [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  const [showOptionsError, setShowOptionsError] = useState(false);

  const validateOptions = (options) => {
    if (options.length < 2) {
      setShowOptionsError("Must have at least 2 options.");
      return false;
    }
    if (options.some((opt) => typeof opt !== "string" || opt.trim() === "")) {
      setShowOptionsError("Options cannot be empty.");
      return false;
    }
    setShowOptionsError(false);
    return true;
  };

  const addOption = () => {
    const newOptions = [
      ...(question.options || []),
      `Option ${(question.options?.length || 0) + 1}`,
    ];
    onChange({ ...question, options: newOptions });
    validateOptions(newOptions);
  };

  const addOtherOption = () => {
    if (question.options?.includes("Other (please specify)")) return;
    const newOptions = [...(question.options || []), "Other (please specify)"];
    onChange({ ...question, options: newOptions, hasOtherOption: true });
    validateOptions(newOptions);
  };

  const updateOption = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    onChange({ ...question, options: newOptions });
    validateOptions(newOptions); // Validate on update
  };

  const deleteOption = (index) => {
    const currentOptions = question.options || [];
    if (currentOptions.length <= 2) {
      validateOptions(currentOptions); // Show error if trying to delete below 2
      return;
    }
    const deletedOption = currentOptions[index];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    onChange({
      ...question,
      options: newOptions,
      ...(deletedOption === "Other (please specify)" && {
        hasOtherOption: false,
      }),
    });
    validateOptions(newOptions);
  };

  const toggleRandomize = () => {
    onChange({ ...question, randomize: !question.randomize });
  };

  // Drag handlers... (keep existing logic)
  const handleDragStart = (index) => setDraggedOptionIndex(index);
  const handleDragEnd = () => setDraggedOptionIndex(null);
  const handleDragOver = (index) => {
    if (draggedOptionIndex === null || draggedOptionIndex === index) return;
    const newOptions = [...question.options];
    const [removed] = newOptions.splice(draggedOptionIndex, 1);
    newOptions.splice(index, 0, removed);
    onChange({ ...question, options: newOptions });
    setDraggedOptionIndex(index);
  };

  return (
    <BaseEditor question={question} onChange={onChange}>
      {/* Specific fields for Single Choice */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Answer Options
          </label>
          <div className="flex gap-2">
            <button
              onClick={addOption}
              type="button"
              className="text-sm text-purple-600 hover:text-purple-800 flex items-center gap-1"
            >
              {/* SVG Icon */} Add Option
            </button>
            <button
              onClick={addOtherOption}
              type="button"
              className={`text-sm flex items-center gap-1 ${
                question.hasOtherOption
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-purple-600 hover:text-purple-800"
              }`}
              disabled={question.hasOtherOption}
            >
              {/* SVG Icon */} Add "Other"
            </button>
          </div>
        </div>

        {showOptionsError && (
          <div className="text-red-500 text-sm mb-2">{showOptionsError}</div>
        )}

        {/* Options List */}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {(question.options || []).map((option, index) => (
              <motion.div
                key={`option-${index}-${question.id}`} // More unique key
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 group"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => {
                  e.preventDefault();
                  handleDragOver(index);
                }}
                onDragEnd={handleDragEnd}
              >
                {/* Drag Handle SVG */}
                <div className="cursor-move text-gray-400 hover:text-gray-600">
                  ...
                </div>
                <TextInput
                  id={`option-input-${index}-${question.id}`}
                  value={option}
                  onChange={(e) => updateOption(index, e.target.value)}
                  className="flex-1" // Remove default width styling from TextInput if needed
                  placeholder={`Option ${index + 1}`}
                />
                <button
                  onClick={() => deleteOption(index)}
                  className={`transition-colors ${
                    question.options?.length <= 2
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-400 hover:text-red-600"
                  }`}
                  disabled={question.options?.length <= 2}
                  aria-label="Delete option"
                >
                  {/* Delete SVG */} X
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Randomize to Advanced Settings */}
      <div className="pt-4 border-t border-gray-100">
        <ToggleSwitch
          id={`randomize-${question.id}`}
          label="Randomize Options"
          checked={question.randomize || false}
          onChange={toggleRandomize}
        />
      </div>
    </BaseEditor>
  );
};

export default SingleChoiceEditor;
