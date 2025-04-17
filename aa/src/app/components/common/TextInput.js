
// src/app/components/common/TextInput.js
import React from "react";

const TextInput = ({ id, label, value, onChange, placeholder = "", className = "", ...props }) => {
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
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
        {...props}
      />
    </div>
  );
};

export default TextInput;

