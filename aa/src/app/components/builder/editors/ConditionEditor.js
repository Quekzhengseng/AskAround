// src/app/components/builder/editors/ConditionEditor.js
"use client"; 

import React, { useState, useEffect } from 'react';


const QUESTION_TYPES = {
    SINGLE_CHOICE: "SINGLE_CHOICE",
    RATING: "RATING",
    YES_NO: "YES_NO",
    
};

const ConditionEditor = ({
    currentQuestionUniqueId, // The unique UUID/temp_id of the question this editor is for
    dependency, // Current dependency object: { depends_on: 'uuid_of_prereq', condition_type: '...', condition_value: '...' } or null
    onChangeDependency, // Function to call with the new/updated dependency object or null
    precedingQuestions, // Array: [{ id: 'uuid', text: 'Q text', type: 'Q_TYPE', options: [], scale: 5, qXId: 'q1' }, ...]
}) => {
    // Internal state to manage the form fields within this component
    const [selectedDependsOnId, setSelectedDependsOnId] = useState('');
    const [selectedConditionType, setSelectedConditionType] = useState('answerValueIs'); // Default
    const [conditionValue, setConditionValue] = useState('');

    const [prerequisiteQuestionDetails, setPrerequisiteQuestionDetails] = useState(null);


    useEffect(() => {
        setSelectedDependsOnId(dependency?.depends_on || '');
        setSelectedConditionType(dependency?.condition_type || 'answerValueIs');
        setConditionValue(dependency?.condition_value || '');
    }, [dependency]);

    // Effect to update details of the prerequisite question when `selectedDependsOnId` changes
    useEffect(() => {
        if (selectedDependsOnId) {
            const foundPrereq = precedingQuestions.find(q => q.id === selectedDependsOnId);
            setPrerequisiteQuestionDetails(foundPrereq || null);
        } else {
            setPrerequisiteQuestionDetails(null);
        }
    }, [selectedDependsOnId, precedingQuestions]);

    const handleDependsOnChange = (e) => {
        const newDependsOnId = e.target.value;
        setSelectedDependsOnId(newDependsOnId);

        if (!newDependsOnId) { 
            onChangeDependency(null); // Clear the entire dependency
            setSelectedConditionType('answerValueIs');
            setConditionValue('');
        } else {
            // When a new prerequisite is selected, reset condition type and value
            // as they are specific to the prerequisite. Maybe change this in the future.
            const defaultNewConditionType = 'answerValueIs'; 
            setSelectedConditionType(defaultNewConditionType);
            setConditionValue(''); // Crucial to reset this
            onChangeDependency({
                depends_on: newDependsOnId,
                condition_type: defaultNewConditionType,
                condition_value: '', // Reset value
            });
        }
    };

    const handleConditionTypeChange = (e) => {
        const newType = e.target.value;
        setSelectedConditionType(newType);
        onChangeDependency({
            depends_on: selectedDependsOnId, // Must be selected if this is enabled
            condition_type: newType,
            condition_value: conditionValue, // Keep current value, or reset if type implies different value format
        });
    };

    const handleConditionValueChange = (e) => {
        const newValue = e.target.value;
        setConditionValue(newValue);
        onChangeDependency({
            depends_on: selectedDependsOnId, // Must be selected
            condition_type: selectedConditionType,
            condition_value: newValue,
        });
    };

    // Filter preceding questions that can be used as a condition source
    const conditionablePrecedingQuestions = precedingQuestions.filter(q =>
        [QUESTION_TYPES.SINGLE_CHOICE, QUESTION_TYPES.YES_NO, QUESTION_TYPES.RATING].includes(q.type)
    );

    return (
        <div className="pt-4 mt-4 border-t border-gray-200/80 space-y-4">
            <h3 className="text-xs font-semibold uppercase text-gray-500 mb-1">
                Conditional Display Logic
            </h3>
            <p className="text-xs text-gray-500 mb-3">
                Define a rule to show this question only if a specific condition on a previous question is met.
            </p>

            {/* 1. "Depends On" Dropdown (Prerequisite Question) */}
            <div>
                <label
                    htmlFor={`depends-on-${currentQuestionUniqueId}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Show this question if answer to:
                </label>
                <select
                    id={`depends-on-${currentQuestionUniqueId}`}
                    value={selectedDependsOnId}
                    onChange={handleDependsOnChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                    <option value="">-- Always Show this Question (No Condition) --</option>
                    {conditionablePrecedingQuestions.map((pq, index) => (
                        <option key={pq.id} value={pq.id}>
                            {`Q${precedingQuestions.indexOf(pq) + 1}: ${pq.text.substring(0, 40)}${pq.text.length > 40 ? '...' : ''} (${pq.type})`}
                        </option>
                    ))}
                </select>
            </div>

            {/* Conditional fields: only show if a prerequisite question is selected */}
            {selectedDependsOnId && prerequisiteQuestionDetails && (
                <>
                    {/* 2. "Condition Type" Dropdown (How to compare) */}
                    <div>
                        <label
                            htmlFor={`condition-type-${currentQuestionUniqueId}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Condition is:
                        </label>
                        <select
                            id={`condition-type-${currentQuestionUniqueId}`}
                            value={selectedConditionType}
                            onChange={handleConditionTypeChange}
                            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                            <option value="answerValueIs">Answer Is Equal To</option>
                            {prerequisiteQuestionDetails.type === QUESTION_TYPES.RATING && (
                                <>
                                    <option value="answerValueGreaterThan">Answer Is Greater Than</option>
                                    <option value="answerValueLessThan">Answer Is Less Than</option>
                                    <option value="answerValueNotIs">Answer Is Not Equal To</option>
                                </>
                            )}
                            {/* Add more types like "contains", "startsWith" for text if supported later */}
                        </select>
                    </div>

                    {/* 3. "Condition Value" Input (The target value for the condition) */}
                    <div>
                        <label
                            htmlFor={`condition-value-${currentQuestionUniqueId}`}
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Required Value:
                        </label>
                        {/* Dynamic input based on prerequisite question type */}
                        {(prerequisiteQuestionDetails.type === QUESTION_TYPES.SINGLE_CHOICE ||
                          prerequisiteQuestionDetails.type === QUESTION_TYPES.YES_NO) && (
                            <select
                                id={`condition-value-${currentQuestionUniqueId}`}
                                value={conditionValue}
                                onChange={handleConditionValueChange}
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                                <option value="">-- Select Required Value --</option>
                                {(prerequisiteQuestionDetails.options || (prerequisiteQuestionDetails.type === QUESTION_TYPES.YES_NO ? ['Yes', 'No'] : [])).map((opt, idx) => (
                                    <option key={idx} value={opt}>
                                        {opt}
                                    </option>
                                ))}
                            </select>
                        )}

                        {prerequisiteQuestionDetails.type === QUESTION_TYPES.RATING && (
                            <input
                                type="number"
                                id={`condition-value-${currentQuestionUniqueId}`}
                                value={conditionValue}
                                onChange={handleConditionValueChange}
                                min="1"
                                max={prerequisiteQuestionDetails.scale || 10} // Default max if scale not present
                                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder={`Enter number (1-${prerequisiteQuestionDetails.scale || 10})`}
                            />
                        )}
                        {/* Placeholder for other types if ever supported as condition sources */}
                        {![QUESTION_TYPES.SINGLE_CHOICE, QUESTION_TYPES.YES_NO, QUESTION_TYPES.RATING].includes(prerequisiteQuestionDetails.type) && (
                             <p className="text-xs text-gray-400">Condition value input for {prerequisiteQuestionDetails.type} not yet implemented.</p>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default ConditionEditor;