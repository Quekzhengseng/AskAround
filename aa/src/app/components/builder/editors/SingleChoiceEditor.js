// src/app/components/survey/builder/editors/SingleChoiceEditor.js
"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import BaseEditor from "./BaseEditor";
import TextInput from "../../common/TextInput";
import BooleanToggle from "../../common/BooleanToggle";
import ConditionEditor from './ConditionEditor';

const SingleChoiceEditor = ({ question, onChange, editorProps = {} }) => {
  const [draggedOptionIndex, setDraggedOptionIndex] = useState(null);
  const [showOptionsError, setShowOptionsError] = useState(false);

  // --- Dependency State & Preceding Questions Calculation ---
  const [internalDependency, setInternalDependency] = useState(null); // Start with null

  const allQuestionsFromBuilder = editorProps.questions || [];
  const currentIndexInBuilder = typeof editorProps.index === 'number' ? editorProps.index : -1;
  const getPrecedingQuestionsFunc = editorProps.getPrecedingQuestions;

  const precedingQuestionsForEditor = (getPrecedingQuestionsFunc && currentIndexInBuilder > -1)
    ? getPrecedingQuestionsFunc(allQuestionsFromBuilder, currentIndexInBuilder)
    : [];

  useEffect(() => {
    let initialDepObject = question.dependency || null;
    if (initialDepObject && initialDepObject.depends_on_qX && !initialDepObject.depends_on) {
      const sourceQuestion = precedingQuestionsForEditor.find(
        pq => pq.qXId === initialDepObject.depends_on_qX
      );
      if (sourceQuestion) {
        initialDepObject = {
          ...initialDepObject,
          depends_on: sourceQuestion.id, // Set the UUID for ConditionEditor
          // depends_on_qX: undefined, // Optionally clear this after resolution
        };
      } else {
        console.warn(`SingleChoiceEditor: Could not resolve depends_on_qX "${initialDepObject.depends_on_qX}" to a UUID for question "${question.id}". Clearing dependency.`);
        initialDepObject = null; 
      }
    }
    setInternalDependency(initialDepObject);
  }, [question.dependency, precedingQuestionsForEditor]); // Rerun if dependency or preceding questions change


  const handleChangeDependencyInEditor = (newDependency) => {
    setInternalDependency(newDependency);
    onChange({ ...question, dependency: newDependency });
  };

  const validateOptions = (options) => {
    if (options.length < 2) { setShowOptionsError("Must have at least 2 options."); return false; }
    if (options.some((opt) => typeof opt !== "string" || opt.trim() === "")) { setShowOptionsError("Options cannot be empty."); return false; }
    setShowOptionsError(false); return true;
  };
  const addOption = () => {
    const newOptions = [...(question.options || []), `Option ${(question.options?.length || 0) + 1}`];
    onChange({ ...question, options: newOptions }); validateOptions(newOptions);
  };
  const addOtherOption = () => {
    if (question.options?.includes("Other (please specify)")) return;
    const newOptions = [...(question.options || []), "Other (please specify)"];
    onChange({ ...question, options: newOptions, hasOtherOption: true }); validateOptions(newOptions);
  };
  const updateOption = (index, value) => {
    const newOptions = [...question.options]; newOptions[index] = value;
    onChange({ ...question, options: newOptions }); validateOptions(newOptions);
  };
  const deleteOption = (index) => {
    const currentOptions = question.options || []; if (currentOptions.length <= 2) { validateOptions(currentOptions); return; }
    const deletedOption = currentOptions[index];
    const newOptions = currentOptions.filter((_, i) => i !== index);
    onChange({ ...question, options: newOptions, ...(deletedOption === "Other (please specify)" && { hasOtherOption: false }) });
    validateOptions(newOptions);
  };
  const toggleRandomize = (e) => { 
    onChange({ ...question, randomize: e.target.checked });
  };
  const handleDragStart = (index) => setDraggedOptionIndex(index);
  const handleDragEnd = () => setDraggedOptionIndex(null);
  const handleDragOver = (index) => {
    if (draggedOptionIndex === null || draggedOptionIndex === index) return;
    const newOptions = [...question.options];
    const [removed] = newOptions.splice(draggedOptionIndex, 1);
    newOptions.splice(index, 0, removed);
    onChange({ ...question, options: newOptions }); setDraggedOptionIndex(index);
  };

  return (
    <BaseEditor question={question} onChange={onChange} editorProps={editorProps}>
      {/* Content specific to SingleChoiceEditor passed as children to BaseEditor */}
      <div> 
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">Answer Options</label>
          <div className="flex gap-2">
            <button onClick={addOption} 
            type="button" 
            className="text-sm text-purple-600 hover:text-purple-800">
              Add Option</button>
            <button onClick={addOtherOption} 
            type="button" 
            className={`text-sm ${question.hasOtherOption ? "text-gray-400 cursor-not-allowed" : "text-purple-600 hover:text-purple-800"}`} 
            disabled={question.hasOtherOption}>
              Add "Other"</button>
          </div>
        </div>
        {showOptionsError && <div className="text-red-500 text-sm mb-2">{showOptionsError}</div>}
        <div className="space-y-2 mb-4">
          <AnimatePresence>
            {(question.options || []).map((option, index) => (
              <motion.div 
              key={`option-${index}-${question.id}`} 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, height: 0 }} 
              className="flex items-center gap-2 group" 
              draggable 
              onDragStart={() => handleDragStart(index)} onDragOver={(e) => { e.preventDefault(); handleDragOver(index); }} 
              onDragEnd={handleDragEnd}>
                
                
                <div className="cursor-move text-gray-400 hover:text-gray-600">...</div> {/* Replace with SVG drag handle */}
                <TextInput 
                id={`option-input-${index}-${question.id}`} 
                value={option} onChange={(e) => updateOption(index, e.target.value)} 
                className="flex-1" placeholder={`Option ${index + 1}`} />
                <button 
                onClick={() => deleteOption(index)} 
                className={`transition-colors ${question.options?.length <= 2 ? "text-gray-300 cursor-not-allowed" : "text-gray-400 hover:text-red-600"}`} 
                disabled={question.options?.length <= 2}>X</button> {/* Replace with SVG delete icon */}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100">
        <BooleanToggle
          id={`randomize-${question.id}`}
          label="Randomize Options"
          checked={question.randomize || false}
          onChange={toggleRandomize}
        />
      </div>
      
      {/* Render ConditionEditor only if it's not the first question AND preceding questions exist */}
      {currentIndexInBuilder > 0 && precedingQuestionsForEditor.length > 0 && (
          <ConditionEditor
              currentQuestionUniqueId={question.id} // This is the UUID
              dependency={internalDependency}
              onChangeDependency={handleChangeDependencyInEditor}
              precedingQuestions={precedingQuestionsForEditor} // object w { id, qXId, text, type, ... }
          />
      )}
    </BaseEditor>
  );
};

export default SingleChoiceEditor;