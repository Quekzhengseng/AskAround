// src/app/components/common/TextArea.js
import React from "react";

const TextArea = ({ id, label, value, onChange, placeholder = "", className = "", rows = 4, ...props }) => {
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
            <textarea
                id={id}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                rows={rows}
                className={`w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent ${className}`}
                {...props}
            />
        </div>
    );
};

export default TextArea;