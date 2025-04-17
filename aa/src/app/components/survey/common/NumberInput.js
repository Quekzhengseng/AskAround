// src/app/components/common/NumberInput.js
import React from "react";

const NumberInput = ({ id, label, value, onChange, min, max, className = "", helpText = "", ...props }) => {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          {label}
        </label>
      )}
      <input
        id={id}
        type="number"
        value={value}
        onChange={onChange}
        min={min}
        max={max}
        className={`w-24 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
        {...props}
      />
      {helpText && <p className="mt-1 text-xs text-gray-500">{helpText}</p>}
    </div>
  );
};

export default NumberInput;

